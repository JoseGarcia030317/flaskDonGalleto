import json
import logging
from datetime import datetime
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_horneado import Horneado
from core.classes.Tb_galletas import Receta, DetalleReceta
from core.classes.Tb_insumos import Insumo
from core.classes.Tb_catalogoUnidad import Unidad

logger = logging.getLogger(__name__)

class HorneadoCRUD:
    __STATUS_PROCESO__ = 1
    __STATUS_TERMINADO__ = 2
    __STATUS_CANCELADO__ = 3
    __STATUS_SOLICITADO__ = 4
    __STATUS_RECHAZADO__ = 5

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

    def crear_horneado(self, json_horneado: dict, state: int):
        """
        Crea un nuevo horneado.
        """

        horneado = Horneado(**json_horneado)
        horneado.estatus = state

        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                session.add(horneado)
                session.commit()
                return {
                    "status": 200,
                    "message": "Horneado creado correctamente",
                    "id_horneado": horneado.id_horneado
                }
        except Exception as e:
            logger.error("Error al crear el horneado: %s", e)
            raise e


    def cancelar_horneado(self, id_horneado: int):
        """
        Cancela un horneado.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                horneado = session.query(Horneado).filter(Horneado.id_horneado == id_horneado).first()
                if horneado:
                    horneado.estatus = self.__STATUS_CANCELADO__
                    horneado.fecha_cancelacion = datetime.now()
                    session.commit()
                    return {
                        "status": 200,
                        "message": "Horneado cancelado correctamente"
                    }
                else:
                    return {
                        "status": 404,
                        "message": "Horneado no encontrado"
                    }
        except Exception as e:
            logger.error("Error al cancelar el horneado: %s", e)
            raise e
        
    def update_horneado(self, data: dict, state: int):
        """
        Actualiza un horneado.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                horneado = session.query(Horneado).filter(Horneado.id_horneado == data.get("id_horneado")).first()
                if horneado:
                    horneado.estatus = state
                    session.commit()
                    return {
                        "status": 200,
                        "message": "Horneado actualizado correctamente"
                    }
                else:
                    return {
                        "status": 404,
                        "message": "Horneado no encontrado"
                    }
        except Exception as e:
            logger.error("Error al actualizar el horneado: %s", e)
            raise e
