import logging
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
