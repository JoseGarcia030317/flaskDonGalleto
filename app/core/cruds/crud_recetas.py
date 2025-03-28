import json
import logging
from sqlalchemy import case
from core.classes.Tb_receta import Receta
from core.classes.Tb_galletas import Galleta
from utils.connectiondb import DatabaseConnector

logger = logging.getLogger(__name__)

class RecetaCRUD:
    # Lista de atributos permitidos para la receta
    ATTRIBUTES_RECETA = ["nombre_receta", "tiempo_horneado", "galletas_producidas", "estatus", "galleta_id"]
    # Atributos que no se deben actualizar (por ejemplo, la galleta asociada no se modifica una vez asignada)
    ATTRIBUTES_DONT_UPDATE = ["galleta_id"]

    # Constantes para manejo de estados
    STATUS_ACTIVO = True
    STATUS_INACTIVO = False

    @staticmethod
    def _filter_data(data: dict, allowed: list) -> dict:
        """Filtra y retorna solo las claves permitidas."""
        return {k: v for k, v in data.items() if k in allowed}

    @staticmethod
    def _update_attributes(instance, data: dict, allowed: list) -> None:
        """Actualiza los atributos de una instancia con los valores permitidos."""
        for key, value in data.items():
            if key in allowed and key not in RecetaCRUD.ATTRIBUTES_DONT_UPDATE:
                setattr(instance, key, value)

    def create_receta(self, receta_json: str | dict) -> dict:
        """
        Crea una nueva receta a partir de datos en JSON o diccionario.
        Retorna un dict con status, mensaje e id_receta.
        """
        data = json.loads(receta_json) if isinstance(receta_json, str) else receta_json
        receta = Receta(**self._filter_data(data, self.ATTRIBUTES_RECETA))
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(receta)
                session.commit()
                return {"status": 201, "message": "Success", "id_receta": receta.id_receta}
            except Exception as e:
                session.rollback()
                logger.error("Error creating receta: %s", e)
                raise e

    def read_receta(self, id_receta: int) -> dict:
        """
        Recupera una receta activa por su id y retorna sus datos junto con
        la descripción de la galleta asociada.
        Retorna {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            row = session.query(
                Receta.id_receta,
                Receta.nombre_receta,
                Receta.tiempo_horneado,
                Receta.galletas_producidas,
                Receta.estatus,
                Receta.galleta_id,
                Galleta.nombre_galleta.label("galleta_descripcion")
            ).join(
                Galleta, Receta.galleta_id == Galleta.id_galleta
            ).filter(
                Receta.id_receta == id_receta,
                Receta.estatus == self.STATUS_ACTIVO
            ).first()
            return dict(row._mapping) if row is not None else {}

    def update_receta(self, id_receta: int, receta_json: str | dict) -> dict:
        """
        Actualiza los datos de una receta activa a partir de datos en JSON o diccionario.
        Retorna un dict con status, mensaje e id_receta o {} si no se encuentra.
        """
        data = json.loads(receta_json) if isinstance(receta_json, str) else receta_json
        Session = DatabaseConnector().get_session
        with Session() as session:
            receta = session.query(Receta).filter_by(id_receta=id_receta).first()
            if not receta:
                return {}
            self._update_attributes(receta, data, self.ATTRIBUTES_RECETA)
            try:
                session.commit()
            except Exception as e:
                session.rollback()
                logger.error("Error updating receta: %s", e)
                raise e
            return {"status": 200, "message": "Success", "id_receta": id_receta}

    def delete_receta(self, id_receta: int) -> dict:
        """
        Realiza una eliminación lógica de una receta (marca como inactiva).
        Retorna un dict con status, mensaje e id_receta o {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            receta = session.query(Receta).filter_by(id_receta=id_receta, estatus=self.STATUS_ACTIVO).first()
            if not receta:
                return {}
            try:
                receta.estatus = self.STATUS_INACTIVO
                session.commit()
            except Exception as e:
                session.rollback()
                logger.error("Error deleting receta: %s", e)
                raise e
            return {"status": 200, "message": "Success", "id_receta": id_receta}

    def list_all_recetas(self) -> list:
        """
        Obtiene el listado completo de recetas activas, incluyendo la descripción de la galleta asociada.
        Retorna una lista vacía si no hay registros.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            query = session.query(
                Receta.id_receta,
                Receta.nombre_receta,
                Receta.tiempo_horneado,
                Receta.galletas_producidas,
                Receta.estatus,
                Receta.galleta_id,
                Galleta.nombre_galleta.label("galleta_descripcion")
            ).join(
                Galleta, Receta.galleta_id == Galleta.id_galleta
            ).filter(
                Receta.estatus == self.STATUS_ACTIVO
            )
            result = query.all()
            return [dict(row._mapping) for row in result]
