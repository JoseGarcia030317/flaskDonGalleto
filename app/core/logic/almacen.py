import logging
from core.cruds.crud_almacen import AlmacenCRUD
from core.cruds.crud_compras import CompraCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = AlmacenCRUD()


def list_compras_almacen() -> list:
    """
    Obtiene todas las compras activas.
    """
    try:
        crudCompras = CompraCRUD()
        return crudCompras.list_all_by_state(estatus=1)
    except Exception as e:
        logger.error("Error al obtener las compras activas: %s", e)
        raise e from e

def guardar_inventario(data: dict) -> dict:
    """
    Guarda el inventario de una compra.
    """
    try:
        return crud.guardar_inventario(data["id_compra"], data)
    except Exception as e:
        logger.error("Error al guardar el inventario: %s", e)