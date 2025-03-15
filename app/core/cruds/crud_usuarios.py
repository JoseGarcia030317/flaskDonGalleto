from core.classes.Tb_usuarios import Usuario
import json
import bcrypt
from utils.connectiondb import DatabaseConnector 

class UsuarioCRUD:
    def _usuario_to_dict(self, usuario):
        """
        Convierte un objeto Usuario en un diccionario.
        Retorna un diccionario vacío si el usuario es None.
        """
        if not usuario:
            return {}
        
        return {
            "id_usuario": usuario.id_usuario,
            "nombre": usuario.nombre,
            "apellido_pat": usuario.apellido_pat,
            "apellido_mat": usuario.apellido_mat,
            "telefono": usuario.telefono,
            "tipo": usuario.tipo,
            "usuario": usuario.usuario,
            # No se retorna la contraseña para mayor seguridad.
            "estatus": usuario.estatus
        }

    def create(self, usuario_json):
        """Crea un nuevo usuario a partir de un JSON."""
        if isinstance(usuario_json, str):
            usuario_data = json.loads(usuario_json)
        else:
            usuario_data = usuario_json
        
        usuario = Usuario(**usuario_data)
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(usuario)
                session.commit()
                return self._usuario_to_dict(usuario)
            except Exception as e:
                session.rollback()
                raise e

    def read(self, id_usuario):
        """Recupera un usuario por su id, retornándolo como dict. Si no existe, retorna {}."""
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuario = session.query(Usuario).filter_by(id_usuario=id_usuario).first()
            return self._usuario_to_dict(usuario)

    def update(self, id_usuario, usuario_json):
        """
        Actualiza los datos del usuario a partir de un JSON.
        Si se actualiza la contraseña, se vuelve a cifrar.
        Retorna el usuario actualizado como dict o {} si no se encuentra.
        """
        if isinstance(usuario_json, str):
            data = json.loads(usuario_json)
        else:
            data = usuario_json
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuario = session.query(Usuario).filter_by(id_usuario=id_usuario).first()
            if usuario:
                for key, value in data.items():
                    if key == 'contrasenia':
                        value = usuario.hash_password(value)
                    setattr(usuario, key, value)
                try:
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._usuario_to_dict(usuario)

    def delete(self, id_usuario):
        """
        Elimina un usuario por su id.
        Retorna un dict con la información del usuario eliminado, o {} si no existe.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuario = session.query(Usuario).filter_by(id_usuario=id_usuario).first()
            if usuario:
                try:
                    session.delete(usuario)
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._usuario_to_dict(usuario)

    def list_all(self):
        """
        Obtiene el listado completo de usuarios y los retorna como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuarios = session.query(Usuario).all()
            return [self._usuario_to_dict(u) for u in usuarios]

    def authenticate(self, username, plain_password):
        """
        Autentica a un usuario.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuario = session.query(Usuario).filter_by(usuario=username).first()
            
            # Verificar que el usuario exista y que tenga estatus activo
            if not usuario or usuario.estatus != 1:
                return {}
            
            # Verificar la contraseña
            if not bcrypt.checkpw(plain_password.encode('utf-8'), usuario.contrasenia.encode('utf-8')):
                return {}
            
            return self._usuario_to_dict(usuario)
