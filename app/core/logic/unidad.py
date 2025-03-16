import logging
from sqlalchemy import text
from core.cruds.crud_unidad import UnidadCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def get_all_unidades():
    """Obtiene todos las unidades de la base de datos"""
    crud = UnidadCRUD()
    return crud.list_all()

def get_unidad(id):
    """Obtiene una unidad de la base de datos por id"""
    crud = UnidadCRUD()
    return crud.read(id)

def create_unidad(data):
    """Crea una nueva unidad en la base de datos"""
    crud = UnidadCRUD()
    return crud.create(data)

def delete_unidad(id_unidad):
    """Elimina una unidad de la base de datos en base a su id"""
    crud = UnidadCRUD()
    return crud.delete(id_unidad)

def update_unidad(id_unidad, data):
    """Actualiza una unidad de la base de datos en base a su id_unidad"""
    crud = UnidadCRUD()
    return crud.update(id_unidad=data)