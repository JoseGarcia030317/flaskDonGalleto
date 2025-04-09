import logging
from core.cruds.crud_corte_caja import CorteCajaCrud

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = CorteCajaCrud()

def iniciar_corte_caja(data: dict) -> dict:
    """
    Inicia un corte de caja.
    """

    try:
        return crud.iniciar_corte_caja(data)
    except Exception as e:
        logger.error("Error al iniciar el corte de caja: %s", e)
        raise e from e
    
def cerrar_corte_caja(data: dict) -> dict:
    """
    Cierra un corte de caja.
    """
    try:
        return crud.cerrar_corte_caja(data)
    except Exception as e:
        logger.error("Error al cerrar el corte de caja: %s", e)
        raise e from e

