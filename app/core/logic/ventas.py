import logging
from sqlalchemy import text
from core.cruds.crud_ventas import VentaCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = VentaCRUD()

def guardar_venta(data: dict):
    """Guarda una venta en la base de datos"""
    try:    
        return crud.guardar_venta(data)
    except Exception as e:
        logger.error("Error al guardar la venta: %s", e)
        raise e from e

def get_all_tipo_venta():
    """Obtiene todos los tipos de venta de la base de datos"""
    try:
        return crud.get_all_tipo_venta()
    except Exception as e:
        logger.error("Error al obtener los tipos de venta: %s", e)
        raise e from e

def get_all_ventas():
    """Obtiene todas las ventas de la base de datos"""
    try:
        return crud.get_all_ventas()
    except Exception as e:
        logger.error("Error al obtener las ventas: %s", e)
        raise e from e

def get_venta_by_id(data: dict):
    """Obtiene una venta por su ID"""
    try:
        return crud.get_venta_by_id(data["id_venta"])
    except Exception as e:
        logger.error("Error al obtener la venta: %s", e)
        raise e from e

def cancelar_venta(data: dict):
    """Cancela una venta"""
    try:
        return crud.cancelar_venta(data["id_venta"])
    except Exception as e:
        logger.error("Error al cancelar la venta: %s", e)
        raise e from e
    
