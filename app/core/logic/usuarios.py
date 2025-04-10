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
        response = crud.create(user_data)
        logger.info(f"Se ha registrado el usuario")
        return response
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

def get_user_by_id(usuario_id: int) -> dict:
    """Obtiene el usuario por ID de la base de datos."""
    try:
        result = crud.read(usuario_id)
        logger.info("Se ha obtenido el usuarios.")
        return result
    except Exception as e:
        logger.error("Error al obtener el usuario: %s", e)
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

def update_user(usuario_id: int, data) -> dict:
    """Elimina (lógicamente) una merma de la base de datos."""
    try:
        result = crud.update(usuario_id, data)
        logger.info("Se ha actualizado el usuario con id %d correctamente.", usuario_id)
        return result
    except Exception as e:
        logger.error("Error al actualizado el usuario con id %d: %s", usuario_id, e)
        raise

def get_all_tipo_usuarios() -> list:
    """Obtiene todos los tipos de usuarios de la base de datos."""
    try:
        result = crud.list_tipo_usuarios()
        logger.info("Se han obtenido todos los tipos de usuarios.")
        return result
    except Exception as e:
        logger.error("Error al obtener los tipos de usuarios: %s", e)
        raise

def get_tipo_usuario_by_id(id_tipo_usuario: int) -> dict:
    """Obtiene un tipo de usuario por su id de la base de datos."""
    try:
        result = crud.get_tipo_usuario(id_tipo_usuario)
        logger.info("Se ha obtenido el tipo de usuario con id %d.", id_tipo_usuario)
        return result
    except Exception as e:
        logger.error("Error al obtener el tipo de usuario con id %d: %s", id_tipo_usuario, e)
        raise

