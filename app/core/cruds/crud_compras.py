from datetime import datetime
import json
import logging
from typing import List
from sqlalchemy import case, func
from core.classes.Tb_compras import Compra, CompraDetalle
from core.classes.Tb_insumos import Insumo
from core.classes.Tb_catalogoUnidad import Unidad
from core.classes.Tb_proveedores import Proveedor
from utils.connectiondb import DatabaseConnector

logger = logging.getLogger(__name__)


class CompraCRUD:
    # Atributos permitidos para la tabla Compra y CompraDetalle
    ATTRIBUTES_COMPRA = ["fecha_compra",
                         "observacion", "estatus", "proveedor_id"]
    ATTRIBUTES_COMPRA_DETALLE = ["insumo_id",
                                 "presentacion", "precio_unitario", "cantidad"]
    # Atributos que no se deben actualizar para detalles (si aplica)
    ATTRIBUTES_DONT_UPDATE = ["clave_compra", "insumo_id"]

    # Constantes para manejo de estados (por ejemplo, 1: Activo, 0: Inactivo)
    STATUS_INVENTARIAR = 1
    STATUS_INACTIVO = 0
    STATUS_COMPLETADA = 2

    @staticmethod
    def _filter_data(data: dict, allowed: list) -> dict:
        """
        Filtra y retorna solo las claves permitidas.
        """
        return {k: v for k, v in data.items() if k in allowed}

    @staticmethod
    def _update_attributes(instance, data: dict, allowed: list) -> None:
        """
        Actualiza los atributos de una instancia con los valores permitidos,
        omitiendo aquellos que no deben modificarse.
        """
        for key, value in data.items():
            if key in allowed and key not in CompraCRUD.ATTRIBUTES_DONT_UPDATE:
                setattr(instance, key, value)

    def _create_compra(self, data: dict) -> dict:
        """
        Método auxiliar para crear una compra y sus detalles asociados.
        Se espera que los detalles se encuentren en la clave "detalles" del diccionario.
        """
        compra_data = self._filter_data(data, self.ATTRIBUTES_COMPRA)
        compra = Compra(**compra_data)

        # Extraer detalles si existen; se espera que sea una lista de diccionarios
        detalles_data = data.get("detalles", [])
        detalles = []
        for detalle in detalles_data:
            filtered_detalle = self._filter_data(
                detalle, self.ATTRIBUTES_COMPRA_DETALLE)
            detalles.append(CompraDetalle(**filtered_detalle))

        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(compra)
                session.flush()  # Permite asignar compra.id_compra
                # Asignar el id de la compra a cada detalle y agregarlos a la sesión
                for detalle in detalles:
                    detalle.compra_id = compra.id_compra
                    session.add(detalle)
                session.commit()
                return {"status": 201, "message": "Success", "id_compra": compra.id_compra}
            except Exception as e:
                session.rollback()
                logger.error("Error creating compra: %s", e)
                raise e

    def create_compra(self, compra_json: str | dict) -> dict:
        """
        Crea una nueva compra (con uno o varios detalles) a partir de datos en JSON o diccionario.
        """
        data = json.loads(compra_json) if isinstance(
            compra_json, str) else compra_json
        return self._create_compra(data)

    def read_compra(self, id_compra: int) -> dict:
        """
        Recupera una compra por su ID y retorna un diccionario con sus datos, 
        incluyendo una lista de detalles asociados y el total de venta.
        Retorna {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            # Obtener la compra junto con el nombre del proveedor
            compra_data = session.query(
                Compra,
                Proveedor.nombre
            ).join(
                Proveedor, Compra.proveedor_id == Proveedor.id_proveedor
            ).filter(Compra.id_compra == id_compra).first()

            if not compra_data:
                return {}

            # Desempaquetar la tupla
            compra_obj, proveedor_nombre = compra_data

            result = {
                "id_compra": compra_obj.id_compra,
                "clave_compra": compra_obj.clave_compra,
                "fecha_compra": compra_obj.fecha_compra,
                "observacion": compra_obj.observacion,
                "estatus": compra_obj.estatus,
                "proveedor_id": compra_obj.proveedor_id,
                "proveedor": proveedor_nombre,
                "detalles": [],
                "total_compra": 0  # Se asignará el total acumulado de la compra
            }

            # Obtener los detalles de la compra, junto con el nombre del insumo
            detalles = session.query(
                CompraDetalle,
                Insumo.nombre,
                Unidad
            ).join(
                Insumo, CompraDetalle.insumo_id == Insumo.id_insumo
            ).join(
                Unidad, Insumo.unidad_id == Unidad.id_unidad
            ).filter(CompraDetalle.compra_id == id_compra).all()

            total_compra = 0  # Acumulador para el total
            for detalle_data in detalles:
                detalle_obj, insumo_nombre, unidad = detalle_data  # Desempaquetar cada tupla
                precio_unitario = float(detalle_obj.precio_unitario)
                cantidad = detalle_obj.cantidad
                importe = precio_unitario * cantidad
                total_compra += importe
                result["detalles"].append({
                    "insumo_id": detalle_obj.insumo_id,
                    "insumo": insumo_nombre,
                    "presentacion": detalle_obj.presentacion,
                    "precio_unitario": precio_unitario,
                    "cantidad": cantidad,
                    "unidad": unidad.simbolo
                })

            result["total_compra"] = total_compra
            return result

    def _update_compra(self, id_compra: int, data: dict) -> dict:
        """
        Método auxiliar para actualizar una compra y sus detalles asociados.
        Si en los datos se incluye la clave "detalles", se reemplazarán los registros actuales.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            compra = session.query(Compra).filter_by(
                id_compra=id_compra).first()
            if not compra:
                return {}
            # Actualizar atributos de la compra principal
            self._update_attributes(compra, data, self.ATTRIBUTES_COMPRA)
            # Si se envían detalles, se reemplazan los actuales
            if "detalles" in data:
                # Eliminar los detalles actuales asociados a la compra
                session.query(CompraDetalle).filter_by(
                    compra_id=id_compra).delete()
                # Agregar los nuevos detalles
                for detalle_data in data["detalles"]:
                    filtered_detalle = self._filter_data(
                        detalle_data, self.ATTRIBUTES_COMPRA_DETALLE)
                    new_detalle = CompraDetalle(**filtered_detalle)
                    new_detalle.compra_id = id_compra
                    session.add(new_detalle)
            try:
                session.commit()
            except Exception as e:
                session.rollback()
                logger.error("Error updating compra: %s", e)
                raise e
            return {"status": 200, "message": "Success", "id_compra": id_compra}

    def update_compra(self, id_compra: int, compra_json: str | dict) -> dict:
        """
        Actualiza una compra (y sus detalles si se proporcionan) a partir de datos en JSON o diccionario.
        """
        data = json.loads(compra_json) if isinstance(
            compra_json, str) else compra_json
        return self._update_compra(id_compra, data)

    def delete(self, id_compra: int) -> dict:
        """
        Realiza una eliminación lógica de una compra (marca el registro como inactivo).
        Retorna {} si no se encuentra la compra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            compra = session.query(Compra).filter_by(
                id_compra=id_compra).first()
            if not compra:
                return {}
            try:
                compra.estatus = self.STATUS_INACTIVO
                session.commit()
            except Exception as e:
                session.rollback()
                logger.error("Error deleting compra: %s", e)
                raise e
            return {"status": 200, "message": "Success", "id_compra": id_compra}

    def list_all(self) -> list:
        """
        Obtiene el listado completo de compras activas, incluyendo sus detalles.
        Retorna una lista vacía si no hay registros.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            compras = session.query(
                Compra,
                Proveedor.nombre
            ).join(
                Proveedor, Compra.proveedor_id == Proveedor.id_proveedor
            ).filter(Compra.estatus != self.STATUS_INACTIVO).all()
            result_list = []
            for compra in compras:
                total_compra = 0  # Inicializamos el acumulador para cada compra
                compra_dict = {
                    "id_compra": compra.Compra.id_compra,
                    "clave_compra": compra.Compra.clave_compra,
                    "fecha_compra": compra.Compra.fecha_compra,
                    "observacion": compra.Compra.observacion,
                    "estatus": compra.Compra.estatus,
                    "proveedor_id": compra.Compra.proveedor_id,
                    "proveedor": compra.nombre,
                    "detalles": [],
                    "total_compra": 0  # Se asignará al finalizar el bucle
                }
                detalles = session.query(
                    CompraDetalle,
                    Insumo.nombre
                ).join(
                    Insumo, CompraDetalle.insumo_id == Insumo.id_insumo
                ).filter(CompraDetalle.compra_id == compra.Compra.id_compra).all()
                for detalle in detalles:
                    precio_unitario = float(
                        detalle.CompraDetalle.precio_unitario)
                    cantidad = detalle.CompraDetalle.cantidad
                    importe = precio_unitario * cantidad
                    total_compra += importe  # Se acumula el importe
                    compra_dict["detalles"].append({
                        "insumo_id": detalle.CompraDetalle.insumo_id,
                        "insumo": detalle.nombre,
                        "presentacion": detalle.CompraDetalle.presentacion,
                        "precio_unitario": precio_unitario,
                        "cantidad": cantidad
                    })
                # Se asigna el total calculado a la compra
                compra_dict["total_compra"] = total_compra
                result_list.append(compra_dict)
            return result_list

    def list_all_by_state(self, estatus= None, filtrar_por_fecha_actual: bool = False) -> list:
        """
        Obtiene el listado completo de compras activas, incluyendo sus detalles.
        Retorna una lista vacía si no hay registros.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            fecha_actual = datetime.now().date()
            query = session.query(
                Compra,
                Proveedor.nombre
            ).join(
                Proveedor, Compra.proveedor_id == Proveedor.id_proveedor
            )

            if isinstance(estatus, list):
                query = query.filter(Compra.estatus.in_(estatus))
            elif estatus is not None:
                query = query.filter(Compra.estatus == estatus)
            else:
                query = query.filter(Compra.estatus.in_([0, 1]))

            if filtrar_por_fecha_actual:
                query = query.filter(
                    func.date(Compra.fecha_compra) == fecha_actual
                )

            compras = query.all()

            result_list = []
            for compra in compras:
                total_compra = 0
                compra_dict = {
                    "id_compra": compra.Compra.id_compra,
                    "clave_compra": compra.Compra.clave_compra,
                    "fecha_compra": compra.Compra.fecha_compra,
                    "observacion": compra.Compra.observacion,
                    "estatus": compra.Compra.estatus,
                    "proveedor_id": compra.Compra.proveedor_id,
                    "proveedor": compra.nombre,
                    "detalles": [],
                    "total_compra": 0
                }
                detalles = session.query(
                    CompraDetalle,
                    Insumo.nombre
                ).join(
                    Insumo, CompraDetalle.insumo_id == Insumo.id_insumo
                ).filter(CompraDetalle.compra_id == compra.Compra.id_compra).all()
                for detalle in detalles:
                    precio_unitario = float(
                        detalle.CompraDetalle.precio_unitario)
                    cantidad = detalle.CompraDetalle.cantidad
                    importe = precio_unitario * cantidad
                    total_compra += importe
                    compra_dict["detalles"].append({
                        "insumo_id": detalle.CompraDetalle.insumo_id,
                        "insumo": detalle.nombre,
                        "presentacion": detalle.CompraDetalle.presentacion,
                        "precio_unitario": precio_unitario,
                        "cantidad": cantidad
                    })
                compra_dict["total_compra"] = total_compra
                result_list.append(compra_dict)
            return result_list
