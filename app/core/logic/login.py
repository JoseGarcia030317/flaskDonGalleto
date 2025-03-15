import logging
from sqlalchemy import text
from core.cruds.crud_usuarios import UsuarioCRUD



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
    """Verifica las credenciales de un usuario."""
    crud = UsuarioCRUD()
    usuario = crud.authenticate(usr, pwd)
    if usuario:
        return usuario
    return {}

def create_user(data):
    """Crea un nuevo usuario."""
    crud = UsuarioCRUD()
    return crud.create(data)
