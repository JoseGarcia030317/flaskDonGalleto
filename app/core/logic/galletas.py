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
