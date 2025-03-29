import logging
from sqlalchemy import text
from core.cruds.crud_usuarios import UsuarioCRUD
from core.cruds.crud_clientes import ClienteCRUD



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
