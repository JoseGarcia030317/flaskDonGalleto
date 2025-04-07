import logging
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_ventas import Venta, VentaDetalle, TipoVenta


logger = logging.getLogger(__name__)


class VentaCRUD:
    def guardar_venta(self, data: dict) -> dict:
        """
        Guarda una venta en la base de datos.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                venta = Venta(
                    observacion=data["observacion"],
                    descuento=data["descuento"]
                )
                session.add(venta)
                session.commit()
                return {"message": "Venta guardada correctamente"}
        except Exception as e:
            logger.error("Error al guardar la venta: %s", e)
            raise e from e
        
    def get_all_tipo_venta(self) -> list:
        """
        Obtiene todos los tipos de venta de la base de datos.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                tipos_venta = session.query(TipoVenta).all()
                return [{
                    "id_tipo_venta": tipo_venta.id_tipo_venta,
                    "nombre": tipo_venta.nombre,
                    "descripcion": tipo_venta.descripcion,
                    "descuento": tipo_venta.descuento
                } for tipo_venta in tipos_venta]
        except Exception as e:
            logger.error("Error al obtener los tipos de venta: %s", e)
            raise e from e


