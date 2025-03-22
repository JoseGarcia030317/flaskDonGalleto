from core.classes.Tb_catalogoUnidad import Unidad
from core.classes.Tb_insumos import Insumo
import json
from utils.connectiondb import DatabaseConnector
from core.cruds.crud_unidad import UnidadCRUD


class InsumoCRUD:
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
            insumos = session.query(Insumo).filter_by(estatus=1).all()
            return [self._insumo_to_dict(i) for i in insumos]

    def list_all_insumo_unidad(self):
        """
        Obtiene el listado completo de insumos activos y su respectiva unidad,
        retornándolos como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            insumos = session.query(Insumo).filter_by(estatus=1).all()
            # Asumiendo que la unidad también tiene campo 'estatus'
            unidades = session.query(Unidad).filter_by(estatus=1).all()
            unidades_dict = {unidad.id_unidad: unidad for unidad in unidades}

            listado = []
            for insumo in insumos:
                unidad = unidades_dict.get(insumo.unidad_id)
                listado.append(self._insumo_unidad_to_dict(insumo, unidad))
            return listado
