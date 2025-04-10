import logging
from sqlalchemy import text
from typing import List
from core.cruds.crud_ventas import VentaCRUD

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

crud = VentaCRUD()

def guardar_venta(data: dict):
    """Guarda una venta en la base de datos"""
    try:    
        response = crud.guardar_venta(data)
        logger.info("Se ha guardado una venta.")
        return response
    except Exception as e:
        logger.error("Error al guardar la venta: %s", e)
        raise e from e

def get_all_tipo_venta():
    """Obtiene todos los tipos de venta de la base de datos"""
    try:
        response = crud.get_all_tipo_venta()
        logger.info("Se han obtenido todos los tipos de venta.")
        return response
    except Exception as e:
        logger.error("Error al obtener los tipos de venta: %s", e)
        raise e from e

def get_all_ventas():
    """Obtiene todas las ventas de la base de datos"""
    try:
        response = crud.get_all_ventas()
        logger.info("Se han obtenido todas las ventas.")
        return response
    except Exception as e:
        logger.error("Error al obtener las ventas: %s", e)
        raise e from e

def get_venta_by_id(data: dict):
    """Obtiene una venta por su ID"""
    try:
        response = crud.get_venta_by_id(data["id_venta"])
        logger.info("Se ha eliminado la venta")
        return response
    except Exception as e:
        logger.error("Error al obtener la venta: %s", e)
        raise e from e

def cancelar_venta(data: dict):
    """Cancela una venta"""
    try:
        response = crud.cancelar_venta(data["id_venta"])
        logger.info("Se ha cancelado la venta")
        return response
    except Exception as e:
        logger.error("Error al cancelar la venta: %s", e)
        raise e from e
    
def get_venta_by_status():
    """
    Obtiene todas las ventas en base al estatus.
    """
    try:
        return crud.list_ventas_all_by_state()
    except Exception as e:
        logger.error("Error al obtener las compras: %s", e)
        raise e from e
    
