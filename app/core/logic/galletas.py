import logging
from core.cruds.crud_galletas import GalletaCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def create_galleta(galleta_data: str | dict) -> dict:
    """
    Crea una nueva galleta a partir de datos en JSON o diccionario.
    """
    try:
        crud = GalletaCRUD()
        return crud.create_galleta(galleta_data)
    except Exception as e:
        logger.error("Error al crear la galleta: %s", e)
        raise e


