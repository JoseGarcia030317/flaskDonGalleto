import json
import logging
from sqlalchemy import case
from core.classes.Tb_compras import Compra, CompraDetalle
from utils.connectiondb import DatabaseConnector

logger = logging.getLogger(__name__)

class CompraCRUD:
    # Atributos permitidos para la tabla Compra y CompraDetalle
    ATTRIBUTES_COMPRA = ["clave_compra", "fecha_compra", "observacion", "estatus", "proveedor_id"]
    ATTRIBUTES_COMPRA_DETALLE = ["insumo_id", "presentacion", "precio_unitario", "cantidad"]
    # Atributos que no se deben actualizar para detalles (si aplica)
    ATTRIBUTES_DONT_UPDATE = ["insumo_id"]

    # Constantes para manejo de estados (por ejemplo, 1: Activo, 0: Inactivo)
    STATUS_ACTIVO = 1
    STATUS_INACTIVO = 0

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
            filtered_detalle = self._filter_data(detalle, self.ATTRIBUTES_COMPRA_DETALLE)
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
        data = json.loads(compra_json) if isinstance(compra_json, str) else compra_json
        return self._create_compra(data)

    def read_compra(self, id_compra: int) -> dict:
        """
        Recupera una compra por su ID y retorna un diccionario con sus datos, 
        incluyendo una lista de detalles asociados. Retorna {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            compra = session.query(Compra).filter_by(id_compra=id_compra).first()
            if not compra:
                return {}
            result = {
                "id_compra": compra.id_compra,
                "clave_compra": compra.clave_compra,
                "fecha_compra": compra.fecha_compra,
                "observacion": compra.observacion,
                "estatus": compra.estatus,
                "proveedor_id": compra.proveedor_id,
                "detalles": []
            }
            detalles = session.query(CompraDetalle).filter_by(compra_id=id_compra).all()
            for detalle in detalles:
                result["detalles"].append({
                    "insumo_id": detalle.insumo_id,
                    "presentacion": detalle.presentacion,
                    "precio_unitario": float(detalle.precio_unitario),
                    "cantidad": detalle.cantidad,
                    "fecha_caducidad": detalle.fecha_caducidad
                })
            return result

    def _update_compra(self, id_compra: int, data: dict) -> dict:
        """
        Método auxiliar para actualizar una compra y sus detalles asociados.
        Si en los datos se incluye la clave "detalles", se reemplazarán los registros actuales.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            compra = session.query(Compra).filter_by(id_compra=id_compra).first()
            if not compra:
                return {}
            # Actualizar atributos de la compra principal
            self._update_attributes(compra, data, self.ATTRIBUTES_COMPRA)
            # Si se envían detalles, se reemplazan los actuales
            if "detalles" in data:
                # Eliminar los detalles actuales asociados a la compra
                session.query(CompraDetalle).filter_by(compra_id=id_compra).delete()
                # Agregar los nuevos detalles
                for detalle_data in data["detalles"]:
                    filtered_detalle = self._filter_data(detalle_data, self.ATTRIBUTES_COMPRA_DETALLE)
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
        data = json.loads(compra_json) if isinstance(compra_json, str) else compra_json
        return self._update_compra(id_compra, data)

    def delete(self, id_compra: int) -> dict:
        """
        Realiza una eliminación lógica de una compra (marca el registro como inactivo).
        Retorna {} si no se encuentra la compra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            compra = session.query(Compra).filter_by(id_compra=id_compra, estatus=self.STATUS_ACTIVO).first()
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
            compras = session.query(Compra).filter(Compra.estatus == self.STATUS_ACTIVO).all()
            result_list = []
            for compra in compras:
                compra_dict = {
                    "id_compra": compra.id_compra,
                    "clave_compra": compra.clave_compra,
                    "fecha_compra": compra.fecha_compra,
                    "observacion": compra.observacion,
                    "estatus": compra.estatus,
                    "proveedor_id": compra.proveedor_id,
                    "detalles": []
                }
                detalles = session.query(CompraDetalle).filter_by(compra_id=compra.id_compra).all()
                for detalle in detalles:
                    compra_dict["detalles"].append({
                        "insumo_id": detalle.insumo_id,
                        "presentacion": detalle.presentacion,
                        "precio_unitario": float(detalle.precio_unitario),
                        "cantidad": detalle.cantidad,
                        "fecha_caducidad": detalle.fecha_caducidad
                    })
                result_list.append(compra_dict)
            return result_list
