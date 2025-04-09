import json
import logging
from datetime import datetime
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_horneado import Horneado
from core.classes.Tb_galletas import Receta, DetalleReceta
from core.classes.Tb_insumos import Insumo, InventarioInsumo
from core.classes.Tb_catalogoUnidad import Unidad
from core.cruds.crud_insumos import InsumoCRUD
from core.cruds.crud_galletas import InventarioGalleta

logger = logging.getLogger(__name__)

class HorneadoCRUD:
    __STATUS_PROCESO__ = 1 #cuando se dio iniciar acepto la solicitud (se descuentan unicamente insumos)
    __STATUS_TERMINADO__ = 2 # cuando ya el horneado termino (se agrega galletas)
    __STATUS_CANCELADO__ = 3 # se revierte todo lo consumido y generado (insumos consumidos)
    __STATUS_SOLICITADO__ = 4 #se encuentra en espera de ser aceptado (iniciar) o rechazado
    __STATUS_RECHAZADO__ = 5  #no genera ningun impacto en insumos
    

    def get_all_horneados(self, id_horneado:int = None, state:int = None):
        """
        Obtiene todos los horneados activos junto con su receta e insumos asociados.
        Retorna una lista de diccionarios con la estructura requerida:
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                # Se obtienen todos los horneados que no estén cancelados
                if id_horneado:
                    horneados = session.query(Horneado).filter(Horneado.id_horneado == id_horneado).all()
                else:
                    if state:
                        horneados = session.query(Horneado).filter(Horneado.estatus == state).all()
                    else:
                        horneados = session.query(Horneado).filter(Horneado.estatus == self.__STATUS_PROCESO__).all()
                        

                result = []
                estatus_map = {
                    self.__STATUS_PROCESO__: "En proceso",
                    self.__STATUS_TERMINADO__: "Terminado",
                    self.__STATUS_CANCELADO__: "Cancelado",
                    self.__STATUS_SOLICITADO__: "Solicitado",
                    self.__STATUS_RECHAZADO__: "Rechazado"
                }

                for horneado in horneados:
                    receta = session.query(Receta).filter(Receta.id_receta == horneado.receta_id).first()
                    detalleReceta = session.query(Insumo, DetalleReceta, Unidad).join(
                        DetalleReceta, Insumo.id_insumo == DetalleReceta.insumo_id
                    ).join(
                        Unidad, Insumo.unidad_id == Unidad.id_unidad
                    ).filter(DetalleReceta.receta_id == receta.id_receta).all()

                    insumos = [
                                {
                                'id_insumo': insumo.id_insumo, 
                                'nombre': insumo.nombre, 
                                'cantidad': detalle.cantidad,
                                'id_unidad': unidad.id_unidad,
                                'unidad': unidad.nombre
                                } for insumo, detalle, unidad in detalleReceta
                            ] if detalleReceta else []

                    fecha_formateada = (
                        horneado.fecha_horneado.strftime("%d/%m/%Y %H:%M")
                        if horneado.fecha_horneado else None
                    )

                    result.append({
                        "id_horneado": horneado.id_horneado,
                        "lote": horneado.lote,
                        "receta": {
                            "id": receta.id_receta,
                            "nombre": receta.nombre_receta,
                            "tiempo": receta.tiempo_horneado,
                            "cantidad": receta.galletas_producidas,
                            "insumos": insumos
                        },
                        "fecha_horneado": fecha_formateada,
                        "estatus": estatus_map.get(horneado.estatus, "Desconocido")
                    })

                return result

        except Exception as e:
            logger.error("Error al obtener los horneados: %s", e)
            raise e

    def solicitar_horneado(self, json_horneado: dict) -> dict:
        """
        Crea un nuevo horneado en estado solicitado.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                # Se crea el nuevo horneado
                nuevo_horneado = Horneado(**json_horneado)
                nuevo_horneado.estatus= self.__STATUS_SOLICITADO__
                session.add(nuevo_horneado)
                session.commit()
                return {"id_horneado": nuevo_horneado.id_horneado, "estatus": "Solicitado"}
        except Exception as e:
            logger.error("Error al crear el horneado: %s", e)
            raise e

    def rechazar_horneado(self, id_horneado: int) -> dict:
        """
        Cambia el estado de un horneado a rechazado.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                # Se obtiene el horneado por su ID
                horneado = session.query(Horneado).filter(Horneado.id_horneado == id_horneado).first()
                if horneado:
                    # Se cambia el estado a rechazado
                    horneado.estatus = self.__STATUS_RECHAZADO__
                    session.commit()
                    return {"id_horneado": horneado.id_horneado, "estatus": "Rechazado"}
                else:
                    return False
        except Exception as e:
            logger.error("Error al rechazar el horneado: %s", e)
            raise e

    def preparar_horneado(self, id_horneado: int) -> dict:
        """
        Cambia el estado de un horneado a en proceso. Y explota insumos requeridos.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                # Se obtiene el horneado por su ID
                horneado = session.query(Horneado).filter(Horneado.id_horneado == id_horneado).first()
                
                # Se valida si la receta esta completa para ejecutarse
                explosion_insumos = ExplosionInsumos(horneado.receta_id)
                insumos_requeridos_no_validos = explosion_insumos.validar_existencias()
                if insumos_requeridos_no_validos:
                    return {
                        "status": 400,
                        "message": "No hay suficientes insumos para el horneado",
                        "insumos_requeridos_no_validos": insumos_requeridos_no_validos
                    }

                if horneado:
                    # Se descuentan las existencias de los insumos requeridos
                    explosion_insumos.descontar_existencias_insumos(horneado.id_horneado, session)

                    # Se cambia el estado a en proceso
                    horneado.estatus = self.__STATUS_PROCESO__
                    session.commit()
                    return {"id_horneado": horneado.id_horneado, "estatus": "En proceso"}
                else:
                    return False
        except Exception as e:
            logger.error("Error al preparar el horneado: %s", e)
            raise e

    def terminar_horneado(self, id_horneado: int) -> dict:
        """
        Cambia el estado de un horneado a terminado. Y aumenta las existencias de las galletas producidas.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                # Se obtiene el horneado por su ID
                horneado = session.query(Horneado).filter(Horneado.id_horneado == id_horneado).first()
                if horneado:
                    # Se aumenta las existencias de las galletas producidas
                    explosion_insumos = ExplosionInsumos(horneado.receta_id)
                    explosion_insumos.aumentar_existencias_galletas(horneado.id_horneado, session)

                    # Se cambia el estado a terminado
                    horneado.estatus = self.__STATUS_TERMINADO__
                    session.commit()
                    return {"id_horneado": horneado.id_horneado, "estatus": "Terminado"}
                else:
                    return False
        except Exception as e:
            logger.error("Error al terminar el horneado: %s", e)
            raise e

    def crear_horneado(self, json_horneado: dict) -> dict:
        """
        Crea un nuevo horneado en estado solicitado.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                nuevo_horneado = Horneado(**json_horneado)
                nuevo_horneado.estatus= self.__STATUS_PROCESO__
                
                session.add(nuevo_horneado)
                session.flush()
                # Se obtiene el ID del nuevo horneado
                nuevo_horneado_id = nuevo_horneado.id_horneado
                
                # valida existencias de insumos
                explosion_insumos = ExplosionInsumos(nuevo_horneado.receta_id)
                insumos_requeridos_no_validos = explosion_insumos.validar_existencias()
                if insumos_requeridos_no_validos:
                    session.rollback()
                    return {
                        "status": 400,
                        "message": "No hay suficientes insumos para el horneado",
                        "insumos_requeridos_no_validos": insumos_requeridos_no_validos
                    }
                
                # Se descuentan las existencias de los insumos requeridos
                explosion_insumos.descontar_existencias_insumos(nuevo_horneado_id, session)

                session.commit()
                return {"id_horneado": nuevo_horneado.id_horneado, "estatus": "Proceso"}
        except Exception as e:
            logger.error("Error al crear el horneado: %s", e)
            raise e

class ExplosionInsumos:
    TIPO_MOVIMIENTO = 3 #Horneado
    TIPO_SALIDA = 0  #Salida
    TIPO_ENTRADA = 1 #Entrada

    def __init__(self, id_receta: int):
        self.id_receta = id_receta
        self.receta = None # de momento no se usa
        self.detalle_receta = self.__get_detalle_receta()
        self.insumos = None
        self.insumos_requeridos = None

    def __list_insumos(self):
        insumo_crud = InsumoCRUD()
        return insumo_crud.list_all_insumo_unidad()

    def __get_receta(self):
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                receta = session.query(Receta).filter(Receta.id_receta == self.id_receta).first()
                return receta
            except Exception as e:
                logger.error("Error al obtener la receta: %s", e)
                raise e

    def __get_detalle_receta(self):
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                detalle_receta = session.query(DetalleReceta).filter(DetalleReceta.receta_id == self.id_receta).all()
                return detalle_receta
            except Exception as e:
                logger.error("Error al obtener el detalle de la receta: %s", e)
                raise e

    def validar_existencias(self):
        """
        Valida si las existencias de los insumos requeridos en el detalle de la receta con los
        que hay en el inventario son suficientes para el horneado.
        """
        # insumos actuales con existencias
        insumos_actuales = self.__list_insumos()
        # insumos requeridos en el detalle de la receta
        insumos_requeridos = self.detalle_receta
        self.insumos_requeridos = insumos_requeridos
        # se recorre el detalle de la receta y se valida si las existencias de los insumos son suficientes
        insumos_requeridos_no_validos = []
        for insumo in insumos_requeridos:
            for insumo_actual in insumos_actuales:
                if insumo.insumo_id == insumo_actual["id_insumo"]:
                    if insumo.cantidad > insumo_actual["existencias"]:
                        insumos_requeridos_no_validos.append({
                            "id_insumo": insumo.insumo_id,
                            "nombre": insumo_actual["nombre"],
                            "cantidad": insumo.cantidad,
                            "existencias": insumo_actual["existencias"],
                            "unidad": insumo_actual["unidad"]
                        })
        return insumos_requeridos_no_validos

    def descontar_existencias_insumos(self, id_horneado: int, session):
        """
        Descontar las existencias de los insumos requeridos en el detalle de la receta
        """
        insumos = self.insumos_requeridos
        if insumos:
            try:
                for insumo in insumos:
                    inventario = InventarioInsumo(
                    insumo_id=insumo.insumo_id,
                        cantidad=insumo.cantidad,
                        tipo_movimiento=self.TIPO_MOVIMIENTO,
                        tipo_registro=self.TIPO_SALIDA,
                        horneado_id=id_horneado
                    )
                    session.add(inventario)
            except Exception as e:
                logger.error("Error al descontar las existencias: %s", e)
                raise e
        else:
            return
    
    def aumentar_existencias_galletas(self, id_horneado: int, session):
        """
        Aumentar las existencias de las galletas producidas en el horneado
        """
        self.receta = self.__get_receta()
        if self.receta:
            inventario_galleta = InventarioGalleta(
                galleta_id=self.receta.galleta_id,
                cantidad=self.receta.galletas_producidas,
                tipo_movimiento=self.TIPO_MOVIMIENTO,
                tipo_registro=self.TIPO_ENTRADA,
                horneado_id=id_horneado
            )
            session.add(inventario_galleta)
        else:
            return

    def cancelar_descuento_existencias_insumos(self, id_horneado: int, session):
        """
        Cancelar el descuento de las existencias de los insumos requeridos en el detalle de la receta
        """
        inventario_insumo = session.query(InventarioInsumo).filter(InventarioInsumo.horneado_id == id_horneado).all()
        try:
            if inventario_insumo:
                for inventario in inventario_insumo:
                    inventario.id_estatus = 0
                    session.commit()
            else:
                return
        except Exception as e:
            logger.error("Error al cancelar el descuento de las existencias de los insumos: %s", e)
            raise e

    def cancelar_aumento_existencias_galletas(self, id_horneado: int, session):
        """
        Cancelar el aumento de las existencias de las galletas producidas en el horneado
        """
        inventario_galleta = session.query(InventarioGalleta).filter(InventarioGalleta.horneado_id == id_horneado).all()
        try:
            if inventario_galleta:
                for inventario in inventario_galleta:
                    inventario.estatus = 0
                    session.commit()
            else:
                return
        except Exception as e:
            logger.error("Error al cancelar el aumento de las existencias de las galletas: %s", e)
            raise e
