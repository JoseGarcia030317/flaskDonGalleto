from core.classes.Tb_usuarios import Usuario, TipoUsuario
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
            "contrasenia": usuario.contrasenia,
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
                validation = session.query(Usuario).filter_by(usuario=usuario.usuario, estatus=1).first()
                if validation:
                    return 'El nombre de usuario ya existe'
                else:
                    session.add(usuario)
                    session.commit()
                    return self._usuario_to_dict(usuario)
            except Exception as e:
                session.rollback()
                raise e

    def read(self, id_usuario):
        """
        Recupera un usuario activo por su id, retornándolo como dict.
        Si no existe o no está activo, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuario = session.query(Usuario).filter_by(id_usuario=id_usuario, estatus=1).first()
            return self._usuario_to_dict(usuario)

    def update(self, id_usuario, usuario_json):
        """
        Actualiza los datos de un usuario activo a partir de un JSON.
        Si se actualiza la contraseña, se vuelve a cifrar.
        Retorna el usuario actualizado como dict o {} si no se encuentra.
        """
        if isinstance(usuario_json, str):
            data = json.loads(usuario_json)
        else:
            data = usuario_json
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuario = session.query(Usuario).filter_by(id_usuario=id_usuario, estatus=1).first()
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
        Realiza una baja lógica de un usuario por su id, cambiando el campo 'estatus' a 0.
        Retorna un dict con la información del usuario actualizado o {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuario = session.query(Usuario).filter_by(id_usuario=id_usuario, estatus=1).first()
            if usuario:
                try:
                    usuario.estatus = 0  # Baja lógica
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._usuario_to_dict(usuario)

    def list_all(self):
        """
        Obtiene el listado completo de usuarios activos y los retorna como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuarios = session.query(Usuario).filter_by(estatus=1).all()
            return [self._usuario_to_dict(u) for u in usuarios]

    def authenticate(self, username, plain_password):
        """
        Autentica a un usuario activo.
        Retorna el usuario como dict si la autenticación es correcta, o {} en caso contrario.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            usuario = session.query(Usuario).filter_by(usuario=username, estatus=1).first()
            
            if not usuario:
                return {}
            
            if not bcrypt.checkpw(plain_password.encode('utf-8'), usuario.contrasenia.encode('utf-8')):
                return {}
            
            return self._usuario_to_dict(usuario)

    def list_tipo_usuarios(self):
        """
        Obtiene el listado completo de tipos de usuarios y los retorna como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            tipos_usuarios = session.query(TipoUsuario).all()
            return [self._tipo_usuario_to_dict(t) for t in tipos_usuarios]

    def _tipo_usuario_to_dict(self, tipo_usuario):
        return {
            "id_tipo_usuario": tipo_usuario.id_tipo_usuario,
            "nombre": tipo_usuario.nombre,
            "descripcion": tipo_usuario.descripcion
        }

    def get_tipo_usuario(self, id_tipo_usuario):
        """
        Obtiene un tipo de usuario por su id, retornándolo como dict.
        Si no existe, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            tipo_usuario = session.query(TipoUsuario).filter_by(id_tipo_usuario=id_tipo_usuario).first()
            return self._tipo_usuario_to_dict(tipo_usuario)
