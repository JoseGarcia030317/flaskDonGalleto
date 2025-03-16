from core.classes.Tb_catalogoUnidad import Unidad
import json
from utils.connectiondb import DatabaseConnector

class UnidadCRUD:
    def _unidad_to_dict(self, unidad):
        """
        Convierte un objeto Unidad en un diccionario.
        Retorna {} si la unidad es None
        """
        if not unidad:
            return {}
        return {
            "id_unidad" : unidad.id_unidad,
            "nombre" : unidad.nombre,
            "simbolo" : unidad.simbolo,
            "descripcion" : unidad.descripcion,
            "estatus" : unidad.estatus
        }
        
    def create(self, unidad_json):
        """Crea una nueva unidad a partir de un JSON"""
        if isinstance(unidad_json, str):
            data = json.loads(unidad_json)
        else:
            data = unidad_json
            
        unidad = Unidad(**data)
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(unidad)
                session.commit()
                return self._unidad_to_dict(unidad)
            except Exception as e:
                session.rollback()
                raise e
            
    def read(self, id_unidad):
        """Recupera una unidad por su id_unidad, retornandolo como dict. Si no existe, retorna {}"""
        Session = DatabaseConnector().get_session
        with Session() as session:
            unidad = session.query(Unidad).filter_by(id_unidad=id_unidad).first()
            return self._unidad_to_dict(unidad)
        
    def update(self, id_unidad, unidad_json):
        """
        Actualiza los datos de la unidad a partir de un JSON.
        Retorna la unidad como dict o {} si no se encuentra
        """
        if isinstance(unidad_json, str):
            data = json.loads(unidad_json)
        else:
            data = unidad_json
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            unidad = session.query(Unidad).filter_by(id_unidad=id_unidad).first()
            if unidad:
                for key, value in data.items():
                    setattr(unidad, key, value)
                    try:
                        session.commit()
                    except Exception as e:
                        session.rollback()
                        raise e
            return self._unidad_to_dict(unidad)
        
    def delete(self, id_unidad):
        """
        Elimina una unidad por su id.
        Retorna un dict con la informacion de la unidad eliminada o {} si no exite"""
        Session = DatabaseConnector().get_session
        with Session() as session:
            unidad = session.query(Unidad).filter_by(id_unidad=id_unidad).first()
            if unidad:
                try:
                    session.delete(unidad)
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._unidad_to_dict(unidad)
        
    def list_all(self):
        """
        Obtiene el listado completo de unidades y los retorna como lista de dicts.
        Si nohay registros, retorna una lista vacia
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            unidades = session.query(Unidad).all()
            return [self._unidad_to_dict(n) for n in unidades]