import logging
from core.cruds.crud_galletas import GalletaCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = GalletaCRUD()


def create_galleta(galleta_data: str | dict) -> dict:
    """
    Crea una nueva galleta a partir de datos en JSON o diccionario.
    """
    try:
        return crud.create(galleta_data)
    except Exception as e:
        logger.error("Error al crear la galleta: %s", e)
        raise e

def update_galleta(id_galleta: int, galleta_data: str | dict) -> dict:
    """
    Actualiza una galleta existente a partir de datos en JSON o diccionario.
    """
    try:
        return crud.update(id_galleta, galleta_data)
    except Exception as e:
        logger.error("Error al actualizar la galleta: %s", e)
        raise e

def get_all_galletas() -> dict:
    """
    Obtiene todas las galletas existentes.
    """
    try:
        return crud.get_all()
    except Exception as e:
        logger.error("Error al obtener todas las galletas: %s", e)
        raise e

def get_galleta_by_id(id_galleta: int) -> dict:
    """
    Obtiene una galleta existente a partir de su ID.    
    """
    try:
        return crud.get_by_id(id_galleta)
    except Exception as e:
        logger.error("Error al obtener la galleta: %s", e)
        raise e     

def delete_galleta(id_galleta: int) -> dict:
    """
    Elimina una galleta existente a partir de su ID.
    """
    try:
        return crud.delete(id_galleta)
    except Exception as e:
        logger.error("Error al eliminar la galleta: %s", e)
        raise e

