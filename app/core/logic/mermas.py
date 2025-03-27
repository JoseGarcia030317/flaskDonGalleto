import logging
from core.cruds.crud_mermas import MermaCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def get_all_mermas():
    """Obtiene todos los mermas de la base de datos"""
    crud = MermaCRUD()
    return crud.list_all()

def get_merma(id):
    """Obtiene una merma de la base de datos en base al id"""
    crud = MermaCRUD()
    return crud.read(id)

def create_merma(data):
    """Crea una nueva merma en la base de datos"""
    crud = MermaCRUD()
    return crud.create(data)

def delete_merma(id):
    """Elimina una merma de la base datos"""
    crud = MermaCRUD()
    return crud.delete(id)

def update_merma(id, data):
    """Actualiza una merma de la base de datos"""
    crud = MermaCRUD()
    return crud.update(id, data)