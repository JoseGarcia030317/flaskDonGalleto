from core.classes.Tb_usuarios import Usuario, TipoUsuario, Modulo, TipoUsuarioModulo
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
            usuario = session.query(Usuario, TipoUsuario).join(
                TipoUsuario,
                Usuario.tipo == TipoUsuario.id_tipo_usuario
            ).filter(Usuario.id_usuario==id_usuario, Usuario.estatus==1).first()
            
            modulos = session.query(Modulo).join(
                TipoUsuarioModulo,
                Modulo.id_modulo == TipoUsuarioModulo.id_modulo
            ).join(
                TipoUsuario,
                TipoUsuarioModulo.id_tipo_usuario == TipoUsuario.id_tipo_usuario
            ).filter(
                TipoUsuario.id_tipo_usuario == usuario.Usuario.tipo
            ).all()
            
            
            user = self._usuario_to_dict(usuario.Usuario)
            user["modules"] = [{"id_modulo": m.id_modulo, 
                                "descripcion": m.descripcion, 
                                "ruta": m.ruta, 
                                "funcion": m.funcion
                                } for m in modulos]
            user["tipo_usuario"] = usuario.TipoUsuario.nombre
            return user

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
            usuarios = session.query(Usuario, TipoUsuario).join(
                TipoUsuario,
                Usuario.tipo == TipoUsuario.id_tipo_usuario).filter(Usuario.estatus == 1).all()
            return [{
                "id_usuario": s.Usuario.id_usuario,
                "nombre": s.Usuario.nombre,
                "apellido_pat": s.Usuario.apellido_pat,
                "apellido_mat": s.Usuario.apellido_mat,
                "telefono": s.Usuario.telefono,
                "usuario": s.Usuario.usuario,
                "tipo_usuario": s.TipoUsuario.nombre
            } for s in usuarios]

    def authenticate(self, username, plain_password):
        """
        Autentica a un usuario activo.
        Retorna el usuario como dict si la autenticación es correcta, o {} en caso contrario.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            # Se utiliza outerjoin para garantizar que se devuelva el usuario aun si no hay registro en TipoUsuario.
            usuario = session.query(Usuario, TipoUsuario).outerjoin(
                TipoUsuario,
                Usuario.tipo == TipoUsuario.id_tipo_usuario
            ).filter(
                Usuario.usuario == username, 
                Usuario.estatus == 1
            ).first()

            # Verifica que se haya obtenido un resultado.
            if not usuario:
                return {}

            # Comprueba que la contraseña coincida.
            if not bcrypt.checkpw(plain_password.encode('utf-8'), usuario.Usuario.contrasenia.encode('utf-8')):
                return {}

            # Consulta de módulos, que depende del campo usuario.Usuario.tipo.
            modules = session.query(Modulo).join(
                TipoUsuarioModulo,
                Modulo.id_modulo == TipoUsuarioModulo.id_modulo
            ).join(
                TipoUsuario,
                TipoUsuarioModulo.id_tipo_usuario == TipoUsuario.id_tipo_usuario
            ).filter(
                TipoUsuario.id_tipo_usuario == usuario.Usuario.tipo
            ).all()

            return {
                "id_usuario": usuario.Usuario.id_usuario,
                "nombre": usuario.Usuario.nombre,
                "apellido_pat": usuario.Usuario.apellido_pat,
                "apellido_mat": usuario.Usuario.apellido_mat,
                "telefono": usuario.Usuario.telefono,
                "tipo": usuario.Usuario.tipo,
                "usuario": usuario.Usuario.usuario,
                "contrasenia": usuario.Usuario.contrasenia,
                "estatus": usuario.Usuario.estatus,
                "tipo_usuario": usuario.TipoUsuario.nombre if usuario.TipoUsuario else None,
                "modules": [{
                    "id_modulo": m.id_modulo,
                    "descripcion": m.descripcion,
                    "ruta": m.ruta,
                    "funcion": m.funcion
                } for m in modules]
            }



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

    def get_tipo_usuario(self, id):
        """
        Obtiene un tipo de usuario por su id, retornándolo como dict.
        Si no existe, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            tipo_usuario = session.query(TipoUsuario).filter_by(id_tipo_usuario=id).first()
            if not tipo_usuario:
                return {}
            return self._tipo_usuario_to_dict(tipo_usuario)

    def get_modules(self):
        """
        Obtiene el listado completo de módulos y los retorna como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                modulos = session.query(Modulo).all()
                roles = session.query(Modulo, TipoUsuarioModulo).join(
                    TipoUsuarioModulo,
                    Modulo.id_modulo == TipoUsuarioModulo.id_modulo
                ).all()

                return [{
                        "id_modulo": m.id_modulo, 
                        "descripcion": m.descripcion, 
                        "ruta": m.ruta, 
                        "funcion": m.funcion, 
                        "roles": [r.TipoUsuarioModulo.id_tipo_usuario for r in roles if r.Modulo.id_modulo == m.id_modulo]
                    } for m in modulos]
            except Exception as e:
                session.rollback()
                raise e

