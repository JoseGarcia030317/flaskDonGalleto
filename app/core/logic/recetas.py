import logging
from core.cruds.crud_recetas import RecetaCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Instancia global del CRUD para reutilización
crud = RecetaCRUD()

def get_all_recetas() -> list:
    """Obtiene todas las recetas de la base de datos."""
    try:
        result = crud.list_all_recetas()
        logger.info("Se han obtenido todas las mermas correctamente.")
        return result
    except Exception as e:
        logger.error("Error al obtener todas las mermas: %s", e)
        raise

def create_receta(data: dict) -> dict:
    """Crea una nueva receta."""
    try:
        result = crud.create_receta(data)
        logger.info("Se ha creado la receta correctamente.")
        return result
    except Exception as e:
        logger.error("Error al crear la receta: %s", e)
        raise

