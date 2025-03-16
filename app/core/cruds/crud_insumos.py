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
        crud_unidad = UnidadCRUD()
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
        Recupera un proveedor por su id, retornandolo como dict. Si no existe, retorna {}.
        Tambien incluye su dict de unidad
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            insumo = session.query(Insumo).filter_by(
                id_insumo=id_insumo).first()
            unidad = session.query(Unidad).filter_by(
                id_unidad=insumo.unidad_id).first()

            return self._insumo_unidad_to_dict(insumo, unidad)

    def read(self, id_insumo):
        """
        Recupera un proveedor por su id, retornandolo como dict. Si no existe, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            insumo = session.query(Insumo).filter_by(
                id_insumo=id_insumo).first()

            return self._insumo_to_dict(insumo)

    def update(self, id_insumo, insumo_json):
        """
        Actualiza los datos de un insumo a pastir de un JSON.
        Retorna el proveedor actualizado como dict o {} si no se encuentra
        """
        if isinstance(insumo_json, str):
            data = json.loads(insumo_json)
        else:
            data = insumo_json

        Session = DatabaseConnector().get_session
        with Session() as session:
            insumo = session.query(Insumo).filter_by(
                id_insumo=id_insumo).first()
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
        Elimina un insumo por su id
        Retorna un dict con el insumo eliminado o {} si no existe
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            insumo = session.query(Insumo).filter_by(
                id_insumo=id_insumo).first()
            if insumo:
                try:
                    session.delete(insumo)
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._insumo_to_dict(insumo)

    def list_all(self):
        """
        Obtiene el listado completo de insumos y los retorna como lista de dicts.
        Si nohay registros, retorna una lista vacia
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            insumos = session.query(Insumo).all()
            return [self._insumo_to_dict(i) for i in insumos]

    def list_all_insumo_unidad(self):
        """
        Obtiene el listado completo de insumos y su respectiva unidad y los retorna como lista de dicts.
        si no hay registros, retorna una lista vacia
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            insumos = session.query(Insumo).all()
            unidades = session.query(Unidad).all()
            unidades_dict = {unidad.id_unidad: unidad for unidad in unidades}

            listado = []
            for insumo in insumos:
                unidad = unidades_dict.get(insumo.unidad_id)
                listado.append(self._insumo_unidad_to_dict(insumo, unidad))
            return listado
