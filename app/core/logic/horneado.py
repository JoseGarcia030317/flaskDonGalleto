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
        response = crud.get_all_horneados()
        logger.info("Se han obtenido todos los horneados")
        return response
    except Exception as e:
        logger.error("Error al obtener los horneados activos: %s", e)
        raise e from e

def get_horneado_by_id(data: dict) -> dict:
    """
    Obtiene un horneado por su ID.
    """
    try:
        response = crud.get_all_horneados(id_horneado = data.get("id_horneado"), state = data.get("state"))
        logger.info("Se ha obtenido un horneado")
        return response
    except Exception as e:
        logger.error("Error al obtener el horneado por ID: %s", e)
        raise e from e
    
def cancelar_horneado(id_horneado: int) -> dict:
    """
    Cancela un horneado. Solo revierte el consumo de insumos y cambia el estatus a cancelado
    """
    try:
        response = crud.cancelar_horneado(id_horneado)
        logger.info("Se ha cancelado un horneado")
        return response
    except Exception as e:
        logger.error("Error al cancelar el horneado: %s", e)
        raise e from e

def solicitar_horneado(data: dict) -> dict:
    """
        Se crea el horneado sin embargo se queda en estatus de solicitado
        hasta que sea aceptado o rechazado
    """
    try:
        response = crud.solicitar_horneado(data) #se crea en estatus de espera
        logger.info("Se ha solicitado un horneado")
        return response
    except Exception as e:
        logger.error("Error al cambiar el estado del horneado a solicitado: %s", e)
        raise e from e

def terminar_horneado(data: dict) -> dict:
    """
    Cambia el estado de un horneado a terminado se suman galletas al inventario
    """
    try:
        response = crud.terminar_horneado(data.get("id_horneado"))
        logger.info("Se ha terminado un horneado")
        return response
    except Exception as e:
        logger.error("Error al cambiar el estado del horneado a terminado: %s", e)
        raise e from e

def rechazar_horneado(data: dict) -> dict:
    """
    Cambia el estado de un horneado a rechazado
    """
    try:
        response = crud.rechazar_horneado(data.get("id_horneado"))
        logger.info("Se ha rechazado un horneado")
        return response
    except Exception as e:
        logger.error("Error al cambiar el estado del horneado a rechazado: %s", e)
        raise e from e

def preparar_horneado(data):
    """
        Aceptar horneado. Genera cambio de estatus y ejecuta la explotacion del insumo
    """
    try:
        response = crud.preparar_horneado(data.get("id_horneado"))
        logger.info("Se ha aceptado un horneado")
        return response
    except Exception as e:
        logger.error("Error al procesar el horneado: %s", e)
        raise e from e

def crear_horneado(data: dict) -> dict:
    """
    Crea un nuevo horneado.
    """
    try:
        response = crud.crear_horneado(data)
        logger.info("Se ha creado un horneado")
        return response
    except Exception as e:
        logger.error("Error al crear el horneado: %s", e)
        raise e from e