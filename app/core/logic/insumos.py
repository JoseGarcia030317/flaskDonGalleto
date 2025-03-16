import logging
from core.cruds.crud_insumos import InsumoCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def get_all_insumos():
    """Obtiene todos los insumos de la base de datos"""
    crud = InsumoCRUD()
    return crud.list_all()

def get_all_insumos_unidad():
    """Obtiene todos los insumos con su respectiva unidad de la base de datos"""
    crud = InsumoCRUD()
    return crud.list_all_insumo_unidad()

def get_insumo(id):
    """Obtiene un insumo de la base de datos en base al id"""
    crud = InsumoCRUD()
    return crud.read(id)

def get_insumo_unidad(id):
    """Obtiene un insumo y su respectiva unidad de la base de datos en base al id"""
    crud = InsumoCRUD()
    return crud.readWithUnidad(id)

def create_insumo(data):
    """Crea un nuevo insumo en la base de datos"""
    crud = InsumoCRUD()
    return crud.create(data)

def delete_insumo(id):
    """Elimina un insumo de la base datos"""
    crud = InsumoCRUD()
    return crud.delete(id)

def update_insumo(id, data):
    """Actualiza un insumo de la base de datos"""
    crud = InsumoCRUD()
    return crud.update(id, data)