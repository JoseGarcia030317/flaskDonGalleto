import json
import logging
from core.classes.Tb_galletas import  Galleta, Receta, DetalleReceta
from utils.connectiondb import DatabaseConnector

logger = logging.getLogger(__name__)

class GalletaCRUD:
    
    ATTRIBUTES_GALLETA = ["nombre_galleta", "proteccion_precio", "gramos_galleta", "precio_unitario", "dias_caducidad"]
    ATTRIBUTES_RECETA = ["nombre_receta", "tiempo_horneado", "galletas_producidas"]
    ATTRIBUTES_DETALLE_RECETA = ["insumo_id", "cantidad"]

    @staticmethod
    def _filter_data(data: dict, allowed: list) -> dict:
        """Filtra y retorna solo las claves permitidas."""
        return {k: v for k, v in data.items() if k in allowed}

    @staticmethod
    def _update_attributes(instance, data: dict, allowed: list) -> None:
        """Actualiza los atributos de una instancia con los valores permitidos."""
        for key, value in data.items():
            if key in allowed and key:
                setattr(instance, key, value)

    def create(self, galleta_data: str | dict) -> dict:
        """
        Crea una nueva galleta a partir de datos en JSON o diccionario.
        """
        data = json.loads(galleta_data) if isinstance(galleta_data, str) else galleta_data
        
        if data is None:
            raise ValueError("No se puede crear una galleta con datos vacíos")
        if data.get("receta") is None:
            raise ValueError("No se puede crear una galleta sin receta")
        if data["receta"].get("detalle_receta") is None:
            raise ValueError("No se puede crear una receta sin insumos")

        # Crear la instancia de Galleta y Receta
        galleta = Galleta(**self._filter_data(data, self.ATTRIBUTES_GALLETA))
        receta = Receta(**self._filter_data(data["receta"], self.ATTRIBUTES_RECETA))
        
        # Procesar el detalle: puede venir como lista o como objeto único
        detalles_data = data["receta"]["detalle_receta"]
        detalles = []
        if isinstance(detalles_data, list):
            for det in detalles_data:
                detalle = DetalleReceta(**self._filter_data(det, self.ATTRIBUTES_DETALLE_RECETA))
                detalles.append(detalle)
        elif isinstance(detalles_data, dict):
            detalle = DetalleReceta(**self._filter_data(detalles_data, self.ATTRIBUTES_DETALLE_RECETA))
            detalles.append(detalle)
        else:
            raise ValueError("detalle_receta debe ser un objeto o una lista de objetos")

        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                # Guardar la galleta
                session.add(galleta)
                session.flush()  # Para obtener el id_galleta asignado
                
                # Asignar la FK a la receta y guardar la receta
                receta.galleta_id = galleta.id_galleta
                session.add(receta)
                session.flush()  # Para obtener el id_receta asignado
                
                # Asignar la FK a cada detalle y guardarlos
                for detalle in detalles:
                    detalle.receta_id = receta.id_receta
                    session.add(detalle)
                
                session.commit()
                return {"status": 201, "message": "Success", "id_galleta": galleta.id_galleta}
            except Exception as e:
                session.rollback()
                logger.error("Error al crear la galleta: %s", e)
                raise e

    def update(self, id_galleta: int, galleta_data: str | dict) -> dict:
        """
        Edita una galleta existente junto con su receta y detalles, si se proveen.

        Parámetros:
            id_galleta (int): Identificador de la galleta a actualizar.
            galleta_data (str | dict): Datos en formato JSON o diccionario con los nuevos valores.

        Retorna:
            dict: Resultado de la operación, con mensaje y el id de la galleta.
        """
        # Convertir datos si es una cadena JSON
        data = json.loads(galleta_data) if isinstance(galleta_data, str) else galleta_data

        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                # Consultar la galleta a actualizar
                galleta = session.query(Galleta).filter(Galleta.id_galleta == id_galleta).first()
                if not galleta:
                    raise ValueError("No se encontró la galleta con el id proporcionado")

                # Actualizar atributos de la galleta
                galleta_filtered = self._filter_data(data, self.ATTRIBUTES_GALLETA)
                self._update_attributes(galleta, galleta_filtered, self.ATTRIBUTES_GALLETA)

                # Actualizar la receta si se proporcionan datos
                if "receta" in data:
                    receta_data = data["receta"]
                    # Consultar la receta asociada a la galleta
                    receta = session.query(Receta).filter(Receta.galleta_id == id_galleta).first()
                    if receta:
                        receta_filtered = self._filter_data(receta_data, self.ATTRIBUTES_RECETA)
                        self._update_attributes(receta, receta_filtered, self.ATTRIBUTES_RECETA)
                    else:
                        # Si no existe la receta, se crea una nueva
                        receta = Receta(**self._filter_data(receta_data, self.ATTRIBUTES_RECETA))
                        receta.galleta_id = id_galleta
                        session.add(receta)
                        session.flush()  # Para asignar id_receta

                    # Actualizar los detalles de la receta si se proporcionan
                    if "detalle_receta" in receta_data:
                        # Eliminar los detalles actuales
                        session.query(DetalleReceta).filter(DetalleReceta.receta_id == receta.id_receta).delete()
                        detalles_data = receta_data["detalle_receta"]
                        if isinstance(detalles_data, list):
                            for det in detalles_data:
                                detalle = DetalleReceta(**self._filter_data(det, self.ATTRIBUTES_DETALLE_RECETA))
                                detalle.receta_id = receta.id_receta
                                session.add(detalle)
                        elif isinstance(detalles_data, dict):
                            detalle = DetalleReceta(**self._filter_data(detalles_data, self.ATTRIBUTES_DETALLE_RECETA))
                            detalle.receta_id = receta.id_receta
                            session.add(detalle)
                        else:
                            raise ValueError("detalle_receta debe ser un objeto o una lista de objetos")

                session.commit()
                return {"status": 200, "message": "Galleta actualizada correctamente", "id_galleta": galleta.id_galleta}
            except Exception as e:
                session.rollback()
                logger.error("Error al actualizar la galleta: %s", e)
                raise e
