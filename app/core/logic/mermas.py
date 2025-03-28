import logging
from core.cruds.crud_mermas import MermaCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Instancia global del CRUD para reutilización
crud = MermaCRUD()

def get_all_mermas() -> list:
    """Obtiene todas las mermas de la base de datos."""
    try:
        result = crud.list_all()
        logger.info("Se han obtenido todas las mermas correctamente.")
        return result
    except Exception as e:
        logger.error("Error al obtener todas las mermas: %s", e)
        raise

def get_all_mermas_insumos() -> list:
    """Obtiene todas las mermas de insumos de la base de datos."""
    try:
        result = crud.list_all_insumos()
        logger.info("Se han obtenido todas las mermas de insumos correctamente.")
        return result
    except Exception as e:
        logger.error("Error al obtener mermas de insumos: %s", e)
        raise

def get_all_mermas_galletas() -> list:
    """Obtiene todas las mermas de galletas de la base de datos."""
    try:
        result = crud.list_all_galletas()
        logger.info("Se han obtenido todas las mermas de galletas correctamente.")
        return result
    except Exception as e:
        logger.error("Error al obtener mermas de galletas: %s", e)
        raise

def get_merma(merma_id: int) -> dict:
    """Obtiene una merma de la base de datos en base al ID."""
    try:
        result = crud.read_merma(merma_id)
        logger.info("Se ha obtenido la merma con id %d correctamente.", merma_id)
        return result
    except Exception as e:
        logger.error("Error al obtener la merma con id %d: %s", merma_id, e)
        raise

def create_merma_insumo(data: dict) -> dict:
    """Crea una nueva merma de insumo en la base de datos."""
    try:
        result = crud.create_merma_insumo(data)
        logger.info("Se ha creado la merma de insumo correctamente.")
        return result
    except Exception as e:
        logger.error("Error al crear la merma de insumo: %s", e)
        raise

def create_merma_galleta(data: dict) -> dict:
    """Crea una nueva merma de galleta en la base de datos."""
    try:
        result = crud.create_merma_galleta(data)
        logger.info("Se ha creado la merma de galleta correctamente.")
        return result
    except Exception as e:
        logger.error("Error al crear la merma de galleta: %s", e)
        raise

def create_merma(data: dict) -> dict:
    """
    Crea una nueva merma, determinando el tipo (insumo o galleta)
    según la presencia de las claves 'insumo_id' o 'galleta_id'.
    Solo se permite que esté presente uno de los dos.
    """
    try:
        insumo_present = "insumo_id" in data and data.get("insumo_id") is not None
        galleta_present = "galleta_id" in data and data.get("galleta_id") is not None

        if insumo_present and galleta_present:
            message = "Solo se debe incluir uno de los dos: insumo_id o galleta_id."
            logger.error(message)
            return {"status": 400, "message": message}
        elif insumo_present:
            return create_merma_insumo(data)
        elif galleta_present:
            return create_merma_galleta(data)
        else:
            message = "Debe incluirse alguno de los atributos: insumo_id o galleta_id."
            logger.error(message)
            return {"status": 400, "message": message}
    except Exception as e:
        logger.error("Error al crear la merma: %s", e)
        raise

def delete_merma(merma_id: int) -> dict:
    """Elimina (lógicamente) una merma de la base de datos."""
    try:
        result = crud.delete(merma_id)
        logger.info("Se ha eliminado la merma con id %d correctamente.", merma_id)
        return result
    except Exception as e:
        logger.error("Error al eliminar la merma con id %d: %s", merma_id, e)
        raise

def update_merma_insumo(merma_id: int, data: dict) -> dict:
    """Actualiza una merma de insumo en la base de datos."""
    try:
        result = crud.update_merma_insumo(merma_id, data)
        logger.info("Se ha actualizado la merma de insumo con id %d correctamente.", merma_id)
        return result
    except Exception as e:
        logger.error("Error al actualizar la merma de insumo con id %d: %s", merma_id, e)
        raise

def update_merma_galleta(merma_id: int, data: dict) -> dict:
    """Actualiza una merma de galleta en la base de datos."""
    try:
        result = crud.update_merma_galleta(merma_id, data)
        logger.info("Se ha actualizado la merma de galleta con id %d correctamente.", merma_id)
        return result
    except Exception as e:
        logger.error("Error al actualizar la merma de galleta con id %d: %s", merma_id, e)
        raise

def update_merma(merma_id: int, data: dict) -> dict:
    """
    Actualiza una merma, determinando el tipo (insumo o galleta)
    según la presencia de las claves 'insumo_id' o 'galleta_id'.
    Solo se permite que esté presente uno de los dos.
    """
    try:
        insumo_present = "insumo_id" in data and data.get("insumo_id") is not None
        galleta_present = "galleta_id" in data and data.get("galleta_id") is not None

        if insumo_present and galleta_present:
            message = "Solo se debe incluir uno de los dos: insumo_id o galleta_id."
            logger.error(message)
            return {"status": 400, "message": message}
        elif insumo_present:
            return update_merma_insumo(merma_id, data)
        elif galleta_present:
            return update_merma_galleta(merma_id, data)
        else:
            message = "Debe incluirse alguno de los atributos: insumo_id o galleta_id."
            logger.error(message)
            return {"status": 400, "message": message}
    except Exception as e:
        logger.error("Error al actualizar la merma: %s", e)
        raise
