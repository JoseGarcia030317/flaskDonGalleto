import logging
from sqlalchemy import text
from core.cruds.crud_usuarios import UsuarioCRUD
from core.cruds.crud_clientes import ClienteCRUD
from core.cruds.crud_usuarios import TipoUsuarioCRUD


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_all_users():
    """Obtiene todos los usuarios de la base de datos."""
    crud = UsuarioCRUD()
    return crud.list_all()

def get_user_by_id(id_usuario):
    """Obtiene un usuario por su id."""
    crud = UsuarioCRUD()
    return crud.read(id_usuario)

def get_cliente_by_id(id_cliente):
    """Obtiene un cliente por su id."""
    crud = ClienteCRUD()
    return crud.read(id_cliente)

def autenticar_usuario(usr, pwd):
    """Verifica las credenciales de un usuario. 
    Si el usuario es un cliente (tiene un arroba("@") en el usuario), se le da acceso a la pagina de cliente.
    Si el usuario es un usuario normal (no tiene un arroba("@") en el usuario), se le da acceso a la pagina de usuario.
    """

    if "@" in usr:
        crud = ClienteCRUD()
        usuario = crud.authenticate(usr, pwd)
    else:
        crud = UsuarioCRUD()
        usuario = crud.authenticate(usr, pwd)

    if usuario:
        return usuario
    return {}

def create_user(data):
    """Crea un nuevo usuario."""
    crud = UsuarioCRUD()
    return crud.create(data)

def get_all_tipo_usuarios():
    """Obtiene todos los tipos de usuarios."""
    crud = UsuarioCRUD()
    return crud.list_tipo_usuarios()

def get_tipo_usuario_by_id(id_tipo_usuario):
    """Obtiene un tipo de usuario por su id."""
    crud = UsuarioCRUD()
    return crud.get_tipo_usuario(id_tipo_usuario)



