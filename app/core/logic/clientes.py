import logging
from sqlalchemy import text
from core.cruds.crud_clientes import ClienteCRUD



logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_all_clients():
    """Obtiene todos los usuarios de la base de datos."""
    crud = ClienteCRUD()
    return crud.list_all()

def get_client_by_id(id_client):
    """Obtiene un usuario por su id."""
    crud = ClienteCRUD()
    return crud.read(id_client)

def autenticar_client(email, pwd):
    """Verifica las credenciales de un usuario."""
    crud = ClienteCRUD()
    cliente = crud.authenticate(email, pwd)
    if cliente:
        return cliente
    return {}

def create_client(data):
    """Crea un nuevo usuario."""
    crud = ClienteCRUD()
    return crud.create(data)

def update_client(id_client, data):
    """Actualiza los datos de un usuario."""
    crud = ClienteCRUD()
    return crud.update(id_client, data)

def delete_client(id_client):
    """Elimina un usuario."""
    crud = ClienteCRUD()
    return crud.delete(id_client)