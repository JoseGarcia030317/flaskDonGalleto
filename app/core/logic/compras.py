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
        response = crud.create_compra(compra_data)
        logger.info("Se ha creado una compra")
        return response
    except Exception as e:
        logger.error("Error al crear la compra: %s", e)
        raise e from e

def update_compra(compra_data: str | dict) -> dict:
    """
    Actualiza una compra existente a partir de datos en JSON o diccionario.
    """
    try:
        response = crud.update_compra(compra_data["id_compra"], compra_data)
        logger.info("Se ha actualizado una compra")
        return response
    except Exception as e:
        logger.error("Error al actualizar la compra: %s", e)
        raise e from e

def delete_compra(id_compra: int) -> dict:
    """
    Elimina una compra existente.
    """
    try:
        response = crud.delete(id_compra)
        logger.info("Se ha eliminado una compra")
        return response
    except Exception as e:
        logger.error("Error al eliminar la compra: %s", e)
        raise e from e

def list_compras() -> list:
    """
    Obtiene todas las compras.
    """
    try:
        response = crud.list_all()
        logger.info("Se han obtenido todas las compras")
        return response
    except Exception as e:
        logger.error("Error al obtener las compras: %s", e)
        raise e from e
    
def list_compras_by_estatus(estatus: List[int] = None, filtrar_por_fecha_actual: bool = False) -> list:
    """
    Obtiene todas las compras en base al estatus.
    """
    try:
        response = crud.list_all_by_state(estatus, filtrar_por_fecha_actual)
        logger.info("Se ha obtenido una compra por estatus")
        return response
    except Exception as e:
        logger.error("Error al obtener las compras: %s", e)
        raise e from e

def get_compra(id_compra: int) -> dict:
    """
    Obtiene una compra específica.
    """
    try:   
        response = crud.read_compra(id_compra)
        logger.info("Se ha obtenido una compra")
        return response
    except Exception as e:
        logger.error("Error al obtener la compra: %s", e)
        raise e from e

