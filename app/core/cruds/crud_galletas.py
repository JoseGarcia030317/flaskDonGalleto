import json
import logging
from core.classes.Tb_galletas import Galleta, Receta, DetalleReceta, InventarioGalleta
from utils.connectiondb import DatabaseConnector
from sqlalchemy import func, case

logger = logging.getLogger(__name__)

class GalletaCRUD:
    
    ATTRIBUTES_GALLETA = [
        "nombre_galleta", 
        "descripcion_galleta", 
        "proteccion_precio", 
        "gramos_galleta", 
        "precio_unitario", 
        "dias_caducidad"
    ]
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
        Al crearse, la galleta solo podrá tener una receta, la cual se registra como receta base.
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
        receta.receta_base = True  # Registrar como receta base

        # Procesar el detalle (lista o diccionario)
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
                session.add(galleta)
                session.flush()  # Asigna id_galleta
                
                receta.galleta_id = galleta.id_galleta
                session.add(receta)
                session.flush()  # Asigna id_receta

                for detalle in detalles:
                    detalle.receta_id = receta.id_receta
                    session.add(detalle)
                
                session.commit()
                return {
                    "status": 201, 
                    "message": "Galleta y receta base creadas exitosamente", 
                    "id_galleta": galleta.id_galleta
                }
            except Exception as e:
                session.rollback()
                logger.error("Error al crear la galleta: %s", e)
                raise e

    # ---------------- Funciones de actualización separadas ----------------

    def _update_galleta_attributes(self, galleta, data: dict) -> None:
        """Actualiza los atributos de la galleta."""
        galleta_filtered = self._filter_data(data, self.ATTRIBUTES_GALLETA)
        self._update_attributes(galleta, galleta_filtered, self.ATTRIBUTES_GALLETA)

    def _update_recipe_details(self, session, receta, detalles_data) -> None:
        """
        Actualiza los detalles de una receta.
        Elimina los detalles existentes y agrega los nuevos.
        """
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

    def _process_existing_recipe(self, session, rec_data: dict, id_galleta: int, update_ids: set) -> None:
        """
        Actualiza una receta existente (identificada por id_receta) y sus detalles.
        Agrega el id de la receta al conjunto update_ids.
        Se fuerza el casteo a entero para evitar discrepancias en la comparación.
        """
        recipe_id = int(rec_data.get("id_receta"))
        receta = session.query(Receta).filter(
            Receta.id_receta == recipe_id,
            Receta.galleta_id == id_galleta
        ).first()
        if not receta:
            raise ValueError(f"No se encontró la receta con id {recipe_id} para la galleta {id_galleta}")
        update_ids.add(recipe_id)
        receta_filtered = self._filter_data(rec_data, self.ATTRIBUTES_RECETA)
        self._update_attributes(receta, receta_filtered, self.ATTRIBUTES_RECETA)
        if "detalle_receta" in rec_data:
            # Eliminar detalles existentes y actualizar con los nuevos
            session.query(DetalleReceta).filter(
                DetalleReceta.receta_id == receta.id_receta
            ).delete()
            self._update_recipe_details(session, receta, rec_data["detalle_receta"])

    def _process_new_recipe(self, session, rec_data: dict, id_galleta: int, update_ids: set) -> None:
        """
        Crea una nueva receta y sus detalles.
        Agrega el id de la receta creada al conjunto update_ids.
        """
        nueva_receta = Receta(**self._filter_data(rec_data, self.ATTRIBUTES_RECETA))
        nueva_receta.galleta_id = id_galleta
        nueva_receta.receta_base = rec_data.get("receta_base", False)
        session.add(nueva_receta)
        session.flush()  # Asigna id_receta
        update_ids.add(nueva_receta.id_receta)
        if "detalle_receta" in rec_data:
            self._update_recipe_details(session, nueva_receta, rec_data["detalle_receta"])

    def _remove_missing_recipes(self, session, id_galleta: int, update_ids: set) -> None:
        """
        Elimina (baja lógica) aquellas recetas activas que no se hayan incluido
        en el conjunto update_ids, excepto la receta base.
        """
        current_recetas = session.query(Receta).filter(
            Receta.galleta_id == id_galleta,
            Receta.estatus == 1
        ).all()
        for receta in current_recetas:
            if int(receta.id_receta) not in update_ids and not receta.receta_base:
                receta.estatus = 0

    # ---------------- Método update principal ----------------

    def update(self, id_galleta: int, galleta_data: str | dict) -> dict:
        """
        Actualiza una galleta existente, permitiendo actualizar sus atributos
        y administrar las recetas asociadas (actualización, adición o baja lógica).
        
        Las recetas que no se incluyan en el payload se marcarán como eliminadas
        (estatus = 0), salvo la receta base.
        
        Parámetros:
            id_galleta (int): Identificador de la galleta a actualizar.
            galleta_data (str | dict): Datos en formato JSON o diccionario.
        
        Retorna:
            dict: Resultado de la operación, con mensaje e id de la galleta.
        """
        data = json.loads(galleta_data) if isinstance(galleta_data, str) else galleta_data
        Session = DatabaseConnector().get_session

        with Session() as session:
            try:
                galleta = session.query(Galleta).filter(
                    Galleta.id_galleta == id_galleta
                ).first()
                if not galleta:
                    raise ValueError("No se encontró la galleta con el id proporcionado")
                
                self._update_galleta_attributes(galleta, data)

                update_ids = set()
                if "recetas" in data:
                    recetas_data = data["recetas"]
                    if not isinstance(recetas_data, list):
                        raise ValueError("El campo 'recetas' debe ser una lista de recetas")
                    
                    for rec_data in recetas_data:
                        if "id_receta" in rec_data and int(rec_data.get("id_receta", 0)) > 0:
                            self._process_existing_recipe(session, rec_data, id_galleta, update_ids)
                        else:
                            self._process_new_recipe(session, rec_data, id_galleta, update_ids)
                
                self._remove_missing_recipes(session, id_galleta, update_ids)
                
                session.commit()
                return {"status": 200, "message": "Galleta actualizada correctamente", "id_galleta": id_galleta}
            except Exception as e:
                session.rollback()
                logger.error("Error al actualizar la galleta: %s", e)
                raise e

    # ---------------- Funciones de eliminación y consulta ----------------

    def delete(self, id_galleta: int) -> dict:
        """
        Realiza la baja lógica de una galleta y sus recetas activas,
        y elimina físicamente los detalles asociados.
        Se marca la galleta y todas sus recetas (estatus = 0), y se borran los detalles.
        
        Parámetros:
            id_galleta (int): Identificador de la galleta a eliminar.
        
        Retorna:
            dict: Resultado de la operación.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                galleta = session.query(Galleta).filter(
                    Galleta.id_galleta == id_galleta,
                    Galleta.estatus == 1
                ).first()
                if not galleta:
                    raise ValueError("No se encontró la galleta activa con el id proporcionado")
                
                galleta.estatus = 0

                recetas = session.query(Receta).filter(
                    Receta.galleta_id == id_galleta,
                    Receta.estatus == 1
                ).all()
                for receta in recetas:
                    receta.estatus = 0
                    session.query(DetalleReceta).filter(
                        DetalleReceta.receta_id == receta.id_receta
                    ).delete()
                
                session.commit()
                return {"status": 200, "message": "Galleta eliminada correctamente", "id_galleta": id_galleta}
            except Exception as e:
                session.rollback()
                logger.error("Error al eliminar la galleta: %s", e)
                raise e

    def get_by_id(self, id_galleta: int) -> dict:
        """
        Consulta una galleta activa por su ID, incluyendo sus recetas y detalles.
        La respuesta tendrá exactamente la siguiente estructura:

        Parámetros:
            id_galleta (int): Identificador de la galleta a consultar.
        
        Retorna:
            dict: Datos de la galleta con sus recetas y detalles.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            galleta = session.query(Galleta).filter(
                Galleta.id_galleta == id_galleta,
                Galleta.estatus == 1
            ).first()
            if not galleta:
                raise ValueError("No se encontró la galleta activa con el id proporcionado")
            
            recetas = session.query(Receta).filter(
                Receta.galleta_id == id_galleta,
                Receta.estatus == 1
            ).all()
            recetas_list = []
            for rec in recetas:
                detalles = session.query(DetalleReceta).filter(
                    DetalleReceta.receta_id == rec.id_receta,
                ).all()
                recetas_list.append({
                    "id_receta" : rec.id_receta,
                    "nombre_receta": rec.nombre_receta,
                    "tiempo_horneado": rec.tiempo_horneado,
                    "galletas_producidas": rec.galletas_producidas,
                    "receta_base": rec.receta_base,
                    "detalle_receta": [
                        {"insumo_id": det.insumo_id, "cantidad": float(det.cantidad)}
                        for det in detalles
                    ]
                })
            
            return {
                "id_galleta": galleta.id_galleta,
                "nombre_galleta": galleta.nombre_galleta,
                "descripcion_galleta": galleta.descripcion_galleta,
                "proteccion_precio": galleta.proteccion_precio,
                "gramos_galleta": galleta.gramos_galleta,
                "precio_unitario": galleta.precio_unitario,
                "dias_caducidad": galleta.dias_caducidad,
                "recetas": recetas_list
            }

    def get_all_galletas(self) -> list:
        """
        Consulta y retorna todas las galletas activas.
        Cada galleta se retorna con la siguiente estructura:

        Retorna:
            list: Lista de galletas activas.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            # Subconsulta que calcula las existencias netas para cada galleta
            subquery = session.query(
                InventarioGalleta.galleta_id,
                func.sum(
                    case(
                        (InventarioGalleta.tipo_registro == 1, InventarioGalleta.cantidad),
                        else_=-InventarioGalleta.cantidad
                    )
                ).label("existencias")
            ).filter(
                InventarioGalleta.estatus == 1
            ).group_by(InventarioGalleta.galleta_id).subquery()

            # Consulta principal: se hace outer join para incluir todas las galletas activas
            galletas = session.query(
                Galleta,
                subquery.c.existencias
            ).outerjoin(
                subquery, Galleta.id_galleta == subquery.c.galleta_id
            ).filter(Galleta.estatus == 1).all()

            result = []
            for gal, existencias in galletas:
                result.append({
                    "id_galleta": gal.id_galleta,
                    "nombre_galleta": gal.nombre_galleta,
                    "descripcion_galleta": gal.descripcion_galleta,
                    "proteccion_precio": gal.proteccion_precio,
                    "gramos_galleta": gal.gramos_galleta,
                    "precio_unitario": gal.precio_unitario,
                    "dias_caducidad": gal.dias_caducidad,
                    "existencias": existencias if existencias is not None else 0
                })
            return result