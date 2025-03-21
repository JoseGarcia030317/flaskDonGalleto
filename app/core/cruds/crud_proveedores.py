from core.classes.Tb_proveedores import Proveedor
import json
from utils.connectiondb import DatabaseConnector 

class ProveedorCRUD:
    def _proveedor_to_dict(self, proveedor):
        """
        Convierte un objeto Proveedor en un diccionario.
        Retorna {} si el proveedor es None.
        """
        if not proveedor:
            return {}
        return {
            "id_proveedor": proveedor.id_proveedor,
            "nombre": proveedor.nombre,
            "telefono": proveedor.telefono,
            "contacto": proveedor.contacto,
            "correo_electronico": proveedor.correo_electronico,
            "descripcion_servicio": proveedor.descripcion_servicio,
            "estatus": proveedor.estatus
        }
    
    def create(self, proveedor_json):
        """Crea un nuevo proveedor a partir de un JSON."""
        if isinstance(proveedor_json, str):
            data = json.loads(proveedor_json)
        else:
            data = proveedor_json
        
        proveedor = Proveedor(**data)
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(proveedor)
                session.commit()
                return self._proveedor_to_dict(proveedor)
            except Exception as e:
                session.rollback()
                raise e

    def read(self, id_proveedor):
        """
        Recupera un proveedor activo por su id, retornándolo como dict.
        Si no existe o el proveedor no está activo, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            proveedor = session.query(Proveedor).filter_by(id_proveedor=id_proveedor, estatus=1).first()
            return self._proveedor_to_dict(proveedor)

    def update(self, id_proveedor, proveedor_json):
        """
        Actualiza los datos del proveedor a partir de un JSON.
        Retorna el proveedor actualizado como dict o {} si no se encuentra.
        """
        if isinstance(proveedor_json, str):
            data = json.loads(proveedor_json)
        else:
            data = proveedor_json
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            proveedor = session.query(Proveedor).filter_by(id_proveedor=id_proveedor).first()
            if proveedor:
                for key, value in data.items():
                    setattr(proveedor, key, value)
                try:
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._proveedor_to_dict(proveedor)

    def delete(self, id_proveedor):
        """
        Realiza una baja lógica cambiando el campo 'estatus' a 0.
        Retorna un dict con la información del proveedor actualizado o {} si no existe.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            proveedor = session.query(Proveedor).filter_by(id_proveedor=id_proveedor).first()
            if proveedor:
                try:
                    proveedor.estatus = 0
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._proveedor_to_dict(proveedor)

    def list_all(self):
        """
        Obtiene el listado completo de proveedores activos y los retorna como lista de dicts.
        Si no hay registros activos, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            proveedores = session.query(Proveedor).filter_by(estatus=1).all()
            return [self._proveedor_to_dict(p) for p in proveedores]
