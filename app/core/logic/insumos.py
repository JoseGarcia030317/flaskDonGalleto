import logging
from core.cruds.crud_insumos import InsumoCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def get_all_insumos():
    """Obtiene todos los insumos de la base de datos"""
    crud = InsumoCRUD()
    response = crud.list_all()
    logger.info("Se han obtenido todos los insumos")
    return response

def get_all_insumos_unidad():
    """Obtiene todos los insumos con su respectiva unidad de la base de datos"""
    crud = InsumoCRUD()
    response = crud.list_all_insumo_unidad()
    logger.info("Se han obtenido todos los insumos con unidad")
    return response

def get_insumo(id):
    """Obtiene un insumo de la base de datos en base al id"""
    crud = InsumoCRUD()
    response = crud.read(id)
    logger.info("Se ha obtenido un insumo")
    return response

def get_insumo_unidad(id):
    """Obtiene un insumo y su respectiva unidad de la base de datos en base al id"""
    crud = InsumoCRUD()
    response = crud.readWithUnidad(id)
    logger.info("Se ha obtenido un insumo con unidad")
    return response

def create_insumo(data):
    """Crea un nuevo insumo en la base de datos"""
    crud = InsumoCRUD()
    response = crud.create(data)
    logger.info("Se ha creado un insumo")
    return response

def delete_insumo(id):
    """Elimina un insumo de la base datos"""
    crud = InsumoCRUD()
    response = crud.delete(id)
    logger.info("Se ha eliminado un insumo")
    return response

def update_insumo(id, data):
    """Actualiza un insumo de la base de datos"""
    crud = InsumoCRUD()
    response =  crud.update(id, data)
    logger.info("Se ha actualizado un insumo")
    return response