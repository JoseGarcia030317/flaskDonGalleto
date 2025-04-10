import logging
from sqlalchemy import text
from core.cruds.crud_clientes import ClienteCRUD



logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_all_clients():
    """Obtiene todos los usuarios de la base de datos."""
    crud = ClienteCRUD()
    response = crud.list_all()
    logger.info("Se han obtenido todos los cliente")
    return response

def get_client_by_id(id_client):
    """Obtiene un usuario por su id."""
    crud = ClienteCRUD()
    response = crud.read(id_client)
    logger.info("Se ha obtenido un cliente")
    return response

def autenticar_client(email, pwd):
    """Verifica las credenciales de un usuario."""
    crud = ClienteCRUD()
    cliente = crud.authenticate(email, pwd)
    if cliente:
        logger.info("Se ha autenticado un cliente")
        return cliente
    return {}

def create_client(data):
    """Crea un nuevo usuario."""
    crud = ClienteCRUD()
    response = crud.create(data)
    logger.info("Se ha creado un cliente")
    return response

def update_client(id_client, data):
    """Actualiza los datos de un usuario."""
    crud = ClienteCRUD()
    response = crud.update(id_client, data)
    logger.info("Se ha actualizado un cliente")
    return response

def delete_client(id_client):
    """Elimina un usuario."""
    crud = ClienteCRUD()
    response = crud.delete(id_client)
    logger.info("Se ha eliminado un cliente")
    return response