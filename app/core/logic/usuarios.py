import logging
from core.cruds.crud_usuarios import UsuarioCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = UsuarioCRUD()

def create_user(user_data: str | dict) -> dict:
    """
    Crea un nuevo usuario a partir de datos en JSON o diccionario.
    """
    try:
        return crud.create(user_data)
    except Exception as e:
        logger.error("Error al crear el usuario: %s", e)
        raise e from e
    
def get_user_all() -> list:
    """Obtiene todos los usuarios de la base de datos."""
    try:
        result = crud.list_all()
        logger.info("Se han obtenido todos los usuarios.")
        return result
    except Exception as e:
        logger.error("Error al obtener los usuarios: %s", e)
        raise

def delete_user(uduario_id: int) -> dict:
    """Elimina (lógicamente) una merma de la base de datos."""
    try:
        result = crud.delete(uduario_id)
        logger.info("Se ha eliminado el usuario con id %d correctamente.", uduario_id)
        return result
    except Exception as e:
        logger.error("Error al eliminar el usuario con id %d: %s", uduario_id, e)
        raise
