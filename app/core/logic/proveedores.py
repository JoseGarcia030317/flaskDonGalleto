import logging
from sqlalchemy import text
from core.cruds.crud_proveedores import ProveedorCRUD



logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def get_all_proveedores():
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    return crud.list_all()

def get_proveedor(id):
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    return crud.read(id)

def create_proveedor(data):
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    return crud.create(data)

def detele_proveedor(id_proveedor):
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    return crud.delete(id_proveedor)

def update_proveedor(id_proveedor, data):
    """Obtiene todos los proveedores de la base de datos."""
    crud = ProveedorCRUD()
    return crud.update(id_proveedor, data)