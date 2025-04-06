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

def get_horneado_by_id(data: dict) -> dict:
    """
    Obtiene un horneado por su ID.
    """
    try:
        return crud.get_all_horneados(id_horneado = data.get("id_horneado"), state = data.get("state"))
    except Exception as e:
        logger.error("Error al obtener el horneado por ID: %s", e)
        raise e from e
    
def crear_horneado(json_horneado: dict) -> dict:
    """
    Crea un nuevo horneado.
    """
    try:
        return crud.crear_horneado(json_horneado, state = 1)
    except Exception as e:
        logger.error("Error al crear el horneado: %s", e)
        raise e from e

def cancelar_horneado(id_horneado: int) -> dict:
    """
    Cancela un horneado.
    """
    try:
        return crud.cancelar_horneado(id_horneado)
    except Exception as e:
        logger.error("Error al cancelar el horneado: %s", e)
        raise e from e

def solicitar_horneado(data: dict) -> dict:
    """
    Cambia el estado de un horneado a solicitado.
    """
    try:
        return crud.crear_horneado(data, state = 4)
    except Exception as e:
        logger.error("Error al cambiar el estado del horneado a solicitado: %s", e)
        raise e from e

def terminar_horneado(data: dict) -> dict:
    """
    Cambia el estado de un horneado a terminado.
    """
    try:
        return crud.update_horneado(data, state = 2)
    except Exception as e:
        logger.error("Error al cambiar el estado del horneado a terminado: %s", e)
        raise e from e

