import logging
from typing import List
from core.cruds.crud_compras import CompraCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = CompraCRUD()


def create_compra(compra_data: str | dict) -> dict:
    """
    Crea una nueva compra a partir de datos en JSON o diccionario.
    """
    try:
        return crud.create_compra(compra_data)
    except Exception as e:
        logger.error("Error al crear la compra: %s", e)
        raise e from e

def update_compra(compra_data: str | dict) -> dict:
    """
    Actualiza una compra existente a partir de datos en JSON o diccionario.
    """
    try:
        return crud.update_compra(compra_data["id_compra"], compra_data)
    except Exception as e:
        logger.error("Error al actualizar la compra: %s", e)
        raise e from e

def delete_compra(id_compra: int) -> dict:
    """
    Elimina una compra existente.
    """
    try:
        return crud.delete(id_compra)
    except Exception as e:
        logger.error("Error al eliminar la compra: %s", e)
        raise e from e

def list_compras() -> list:
    """
    Obtiene todas las compras.
    """
    try:
        return crud.list_all() 
    except Exception as e:
        logger.error("Error al obtener las compras: %s", e)
        raise e from e
    
def list_compras_by_estatus(estatus: List[int] = None, filtrar_por_fecha_actual: bool = False) -> list:
    """
    Obtiene todas las compras en base al estatus.
    """
    try:
        return crud.list_all_by_state(estatus, filtrar_por_fecha_actual)
    except Exception as e:
        logger.error("Error al obtener las compras: %s", e)
        raise e from e

def get_compra(id_compra: int) -> dict:
    """
    Obtiene una compra específica.
    """
    try:   
        return crud.read_compra(id_compra)
    except Exception as e:
        logger.error("Error al obtener la compra: %s", e)
        raise e from e

