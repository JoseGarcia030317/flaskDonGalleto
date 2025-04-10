import logging
from core.cruds.crud_pedidos import PedidosCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = PedidosCRUD()

def crear_pedido(data: dict) -> dict:
    """Crea un nuevo pedido en la base de datos"""
    try:
        return crud.guardar_pedido(data)
    except Exception as e:
        logger.error(f"Error al crear el pedido: {e}")
        raise e

def consultar_historial_pedidos(id_cliente: int) -> dict:
    """Consulta el historial de pedidos de un cliente"""
    try:
        return crud.consultar_historial_pedidos(id_cliente)
    except Exception as e:
        logger.error(f"Error al consultar el historial de pedidos: {e}")
        raise e

def get_all_pedidos() -> dict:
    """Obtiene todos los pedidos de la base de datos"""
    try:
        return crud.get_all_pedidos()
    except Exception as e:
        logger.error(f"Error al obtener todos los pedidos: {e}")
        raise e
    
def get_pedidos_by_id(id_pedido):
    """Obtiene el pedido por ID"""
    try:
        return crud.get_pedidos_by_id(id_pedido)
    except Exception as e:
        logger.error(f"Error al obtener el pedido: {e}")
        raise e
    
