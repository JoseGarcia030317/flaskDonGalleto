import logging
from core.cruds.crud_pedidos import PedidosCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = PedidosCRUD()

def crear_pedido(data: dict) -> dict:
    """Crea un nuevo pedido en la base de datos"""
    try:
        response = crud.guardar_pedido(data)
        logger.info("Se ha creado un pedido")
        return response
    except Exception as e:
        logger.error(f"Error al crear el pedido: {e}")
        raise e



