import logging
from sqlalchemy import text
from core.cruds.crud_unidad import UnidadCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def get_all_unidades():
    """Obtiene todos las unidades de la base de datos"""
    crud = UnidadCRUD()
    response = crud.list_all()
    logger.info("Se han obtenido las unidades de medida.")
    return response

def get_unidad(id):
    """Obtiene una unidad de la base de datos por id"""
    crud = UnidadCRUD()
    response = crud.read(id)
    logger.info("Se ha obtenido una unidad de medida.")
    return response

def create_unidad(data):
    """Crea una nueva unidad en la base de datos"""
    crud = UnidadCRUD()
    response = crud.create(data)
    logger.info("Se ha creado una unidad.")
    return response

def delete_unidad(id_unidad):
    """Elimina una unidad de la base de datos en base a su id"""
    crud = UnidadCRUD()
    response = crud.delete(id_unidad)
    logger.info("Se ha eliminado una unidad.")
    return response

def update_unidad(id_unidad, data):
    """Actualiza una unidad de la base de datos en base a su id_unidad"""
    crud = UnidadCRUD()
    response = crud.update(id_unidad=data)
    logger.info("Se ha actualizado una unidad.")
    return response