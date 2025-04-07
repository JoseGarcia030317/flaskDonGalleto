from core.classes.Tb_catalogoUnidad import Unidad
from core.classes.Tb_insumos import Insumo, InventarioInsumo
import json
from utils.connectiondb import DatabaseConnector
from core.cruds.crud_unidad import UnidadCRUD
from sqlalchemy import func, case

class InsumoCRUD:
    ACTIVO = 1
    INACTIVO = 0

    def _insumo_unidad_to_dict(self, insumo, unidad):
        """
        Convierte un objeto de Insumo en un diccionario.
        El diccionario ya tiene incluido el diccionario de unidad de medida.
        Retorna {} si el insumo es None.
        """
        if not insumo:
            return {}
        crud_unidad = UnidadCRUD()
        return {
            "id_insumo": insumo.id_insumo,
            "nombre": insumo.nombre,
            "descripcion": insumo.descripcion,
            "unidad_id": insumo.unidad_id,
            "estatus": insumo.estatus,
            "precio_unitario": insumo.precio_unitario,
            "unidad": crud_unidad._unidad_to_dict(unidad) if unidad else {}
        }

    def _insumo_to_dict(self, insumo):
        """
        Convierte un objeto de Insumo en un diccionario.
        Retorna {} si el insumo es None.
        """
        if not insumo:
            return {}
        return {
            "id_insumo": insumo.id_insumo,
            "nombre": insumo.nombre,
            "descripcion": insumo.descripcion,
            "unidad_id": insumo.unidad_id,
            "estatus": insumo.estatus,
            "precio_unitario": insumo.precio_unitario
        }

    def create(self, insumo_json):
        """Crea un nuevo insumo a partir de un JSON"""
        if isinstance(insumo_json, str):
            data = json.loads(insumo_json)
        else:
            data = insumo_json

        insumo = Insumo(**data)

        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(insumo)
                session.commit()
                return self._insumo_to_dict(insumo)
            except Exception as e:
                session.rollback()
                raise e

    def readWithUnidad(self, id_insumo):
        """
        Recupera un insumo activo por su id, retornándolo como dict.
        Incluye el diccionario de unidad si existe.
        Si no se encuentra o no está activo, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            insumo = session.query(Insumo).filter_by(id_insumo=id_insumo, estatus=1).first()
            if not insumo:
                return {}
            unidad = session.query(Unidad).filter_by(id_unidad=insumo.unidad_id, estatus=1).first()
            return self._insumo_unidad_to_dict(insumo, unidad)

    def read(self, id_insumo):
        """
        Recupera un insumo activo por su id, retornándolo como dict.
        Si no existe o no está activo, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            insumo = session.query(Insumo).filter_by(id_insumo=id_insumo, estatus=1).first()
            return self._insumo_to_dict(insumo)

    def update(self, id_insumo, insumo_json):
        """
        Actualiza los datos de un insumo activo a partir de un JSON.
        Retorna el insumo actualizado como dict o {} si no se encuentra.
        """
        if isinstance(insumo_json, str):
            data = json.loads(insumo_json)
        else:
            data = insumo_json

        Session = DatabaseConnector().get_session
        with Session() as session:
            # Solo se actualizan insumos activos
            insumo = session.query(Insumo).filter_by(id_insumo=id_insumo, estatus=1).first()
            if insumo:
                for key, value in data.items():
                    setattr(insumo, key, value)
                try:
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._insumo_to_dict(insumo)

    def delete(self, id_insumo):
        """
        Realiza una baja lógica de un insumo por su id, cambiando el campo 'estatus' a 0.
        Retorna un dict con el insumo actualizado o {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            # Solo se considera el insumo si está activo
            insumo = session.query(Insumo).filter_by(id_insumo=id_insumo, estatus=1).first()
            if insumo:
                try:
                    insumo.estatus = 0  # Baja lógica
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._insumo_to_dict(insumo)

    def list_all(self):
        """
        Obtiene el listado completo de insumos activos y los retorna como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            subquery = session.query(
                InventarioInsumo.insumo_id,
                func.sum(
                    case(
                        (InventarioInsumo.tipo_registro == 1, InventarioInsumo.cantidad),
                        else_=-InventarioInsumo.cantidad
                    )
                ).label("existencias")
            ).group_by(InventarioInsumo.insumo_id).subquery()

            insumos = session.query(
                Insumo,
                subquery.c.existencias
            ).outerjoin(
                subquery, Insumo.id_insumo == subquery.c.insumo_id
            ).filter(Insumo.estatus == 1).all()

            result = []
            for insumo, existencias in insumos:
                result.append({
                    "id_insumo": insumo.id_insumo,
                    "nombre": insumo.nombre,
                    "descripcion": insumo.descripcion,
                    "existencias": existencias if existencias is not None else 0
                })
            return result
            

    def list_all_insumo_unidad(self):
        """
        Obtiene el listado completo de insumos activos y su respectiva unidad,
        retornándolos como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            subquery = session.query(
                InventarioInsumo.insumo_id,
                func.sum(
                    case(
                        (InventarioInsumo.tipo_registro == 1, InventarioInsumo.cantidad),
                        else_=-InventarioInsumo.cantidad
                    )
                ).label("existencias")
            ).group_by(InventarioInsumo.insumo_id).subquery()

            insumos = session.query(
                Insumo,
                Unidad,
                subquery.c.existencias
            ).join(
                Unidad, Insumo.unidad_id == Unidad.id_unidad
            ).outerjoin(
                subquery, Insumo.id_insumo == subquery.c.insumo_id
            ).filter(Insumo.estatus == self.ACTIVO).all()

            result = []
            for insumo in insumos:
                result.append({
                    "id_insumo": insumo.Insumo.id_insumo,
                    "nombre": insumo.Insumo.nombre,
                    "descripcion": insumo.Insumo.descripcion,
                    "existencias": insumo.existencias if insumo.existencias is not None else 0,
                    "precio_unitario" : insumo.Insumo.precio_unitario,
                    "unidad_id": insumo.Unidad.id_unidad,
                    "unidad": insumo.Unidad.nombre,
                    "simbolo": insumo.Unidad.simbolo
                })
            return result