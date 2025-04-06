import logging
from core.cruds.crud_horneado import HorneadoCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = HorneadoCRUD()


def list_horneados() -> list:
    """
    Obtiene todos los horneados activos.
    """
    try:
        return crud.get_all_horneados()
    except Exception as e:
        logger.error("Error al obtener los horneados activos: %s", e)
        raise e from e
