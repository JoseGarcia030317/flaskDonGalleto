import logging
from sqlalchemy import text
from datetime import datetime
import json
from utils.connectiondb import DatabaseConnector
from datetime import date, datetime

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

def get_daily_sales():
    """Obtiene las ventas diarias del sistema desde BD."""
    Session = DatabaseConnector().get_session 
    try:
        with Session() as session:
            # Obtener la fecha actual en el formato adecuado (YYYY-MM-DD)
            today_date = datetime.now().strftime('%Y-%m-%d')
            
            # Llamar al procedimiento con el parámetro de fecha
            result = session.execute(
                text("CALL SP_SalesDaily(:fecha)"), 
                {"fecha": today_date}  # Pasar la fecha como parámetro
            )
            rows = result.fetchall()

            # Convertir las filas a diccionarios
            rows_dict = []
            for row in rows:
                # Convertimos el campo 'resultado' que es un JSON string a un diccionario
                row_dict = row._asdict()
                if isinstance(row_dict['resultado'], str):
                    # Si 'resultado' es una cadena JSON, la convertimos en un diccionario
                    row_dict['resultado'] = json.loads(row_dict['resultado'])
                rows_dict.append(row_dict)

            logger.info("Se han obtenido las ventas diarias.")
            return rows_dict
    except Exception as e:
        logger.error("Error al obtener las ventas diarias: %s", e)
        raise


def best_selling_product():
    """Obtiene los productos más vendidos del sistema desde BD."""
    Session = DatabaseConnector().get_session 
    try:
        with Session() as session:

            result = session.execute(text("CALL SP_BestSellingProducts"))
            rows = result.fetchall()
            
            data = [
                {
                    "product_name": row.nombre_producto,
                    "quantity": row.cantidad,
                    "amount": row.monto
                }
                for row in rows
            ]
            
            logger.info("Se han obtenido los datos de los productos más vendidos.")
            return data
    except Exception as e:
        logger.error("Error al obtener los productos más vendidos: %s", e)
        raise

def best_selling_presentations():
    """Obtiene las presentaciones más vendidas del sistema desde BD."""
    Session = DatabaseConnector().get_session 
    try:
        with Session() as session:

            result = session.execute(text("CALL SP_BestSellingPresentation"))
            rows = result.fetchall()
            
            data = [
                {
                    "presentation_name": row.nombre,
                    "quantity": row.cantidad,
                    "quantity_cookie": row.cantidad_galleta,
                    "amount": row.monto
                }
                for row in rows
            ]
            
            logger.info("Se han obtenido los datos de las presentaciones más vendidas.")
            return data
    except Exception as e:
        logger.error("Error al obtener las presentaciones más vendidas: %s", e)
        raise

def cost_per_cookie():
    """Obtiene costo por galletas del sistema desde BD."""
    Session = DatabaseConnector().get_session 
    try:
        with Session() as session:

            result = session.execute(text("CALL SP_CostPerCookie"))
            rows = result.fetchall()
            
            data = [
                {
                    "cookie_name": row.nombre_galleta,
                    "amount": row.costo_por_galleta,
                    "unit_price": row.precio_unitario
                }
                for row in rows
            ]
            
            logger.info("Se han obtenido los datos de los costo por galletas.")
            return data
    except Exception as e:
        logger.error("Error al obtener los costo por galletas: %s", e)
        raise


def profit_margin():
    """Obtiene el margen por cada galleta sistema desde BD."""
    Session = DatabaseConnector().get_session 
    try:
        with Session() as session:

            result = session.execute(text("CALL SP_ProfitMargin"))
            rows = result.fetchall()
            
            data = [
                {
                    "cookie_name": row.nombre_galleta,
                    "amount": row.precio_unitario,
                    "margin":row.margen_utilidad,
                    "stock":row.existencias_aproximadas
                }
                for row in rows
            ]
            
            logger.info("Se han obtenido los datos de los costo por galletas.")
            return data
    except Exception as e:
        logger.error("Error al obtener los costo por galletas: %s", e)
        raise

def weekly_sales():
    """Obtiene el ventas de la semana por cada galleta sistema desde BD."""
    Session = DatabaseConnector().get_session 
    try:
        with Session() as session:

            result = session.execute(text("CALL SP_WeeklySales"))
            rows = result.fetchall()
            
            data = [
                {
                    "date": row.fecha.strftime("%Y-%m-%d") if isinstance(row.fecha, (date, datetime)) else row.fecha,
                    "sales": float(row.ventas),
                    "total": row.total
                }
                for row in rows
            ]
            
            logger.info("Se han obtenido los datos de las ventas semanales .")
            return data
    except Exception as e:
        logger.error("Error al obtener las ventas semanales: %s", e)
        raise

