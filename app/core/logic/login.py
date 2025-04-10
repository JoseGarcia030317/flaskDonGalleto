import logging
from sqlalchemy import text
from core.cruds.crud_usuarios import UsuarioCRUD
from core.cruds.crud_clientes import ClienteCRUD


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_all_users():
    """Obtiene todos los usuarios de la base de datos."""
    crud = UsuarioCRUD()
    response = crud.list_all()
    logger.info("Se han obtenido todos los usuarios")
    return response

def get_user_by_id(id_usuario):
    """Obtiene un usuario por su id."""
    crud = UsuarioCRUD()
    response =  crud.read(id_usuario)
    logger.info("Se ha obtenido un usuario")
    return response

def get_cliente_by_id(id_cliente):
    """Obtiene un cliente por su id."""
    crud = ClienteCRUD()
    response = crud.read(id_cliente)
    logger.info("Se ha obtenido un cliente")
    return response

def autenticar_usuario(usr, pwd):
    """Verifica las credenciales de un usuario. 
    Si el usuario es un cliente (tiene un arroba("@") en el usuario), se le da acceso a la pagina de cliente.
    Si el usuario es un usuario normal (no tiene un arroba("@") en el usuario), se le da acceso a la pagina de usuario.
    """

    if "@" in usr:
        crud = ClienteCRUD()
        usuario = crud.authenticate(usr, pwd)
        logger.info("Se ha autenticado un cliente")
    else:
        crud = UsuarioCRUD()
        usuario = crud.authenticate(usr, pwd)
        logger.info("Se ha obtenido un usuario")
    if usuario:
        return usuario
    return {}

def create_user(data):
    """Crea un nuevo usuario."""
    crud = UsuarioCRUD()
    response = crud.create(data)
    logger.info("Se ha creado un usuario")
    return response
