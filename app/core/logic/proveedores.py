import logging
from sqlalchemy import text
from core.cruds.crud_proveedores import ProveedorCRUD



logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_all_proveedores():
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    response = crud.list_all()
    logger.info("Se han obtenido todos los proveedores")
    return response

def get_proveedor(id):
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    response = crud.read(id)
    logger.info("Se ha obtenido un proveedor")
    return response

def create_proveedor(data):
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    response = crud.create(data)
    logger.info("Se ha obtenido un proveedor")
    return response

def detele_proveedor(id_proveedor):
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    response = crud.delete(id_proveedor)
    logger.info("Se ha eliminado un proveedor")
    return response

def update_proveedor(id_proveedor, data):
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    response = crud.update(id_proveedor, data)
    logger.info("Se ha actualizado un proveedor")
    return response