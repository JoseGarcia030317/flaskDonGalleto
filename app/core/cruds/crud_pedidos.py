import logging
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_pedidos import Pedido, PedidoDetalle
from core.classes.Tb_clientes import Cliente
from core.classes.Tb_galletas import Galleta
from core.classes.Tb_ventas import TipoVenta
from flask import current_app
from sqlalchemy import func, and_

logger = logging.getLogger(__name__)

class PedidosCRUD:
    def guardar_pedido(self, data: dict) -> dict:
        """
        Guarda un pedido y sus detalles en la base de datos.
        """
        Session = DatabaseConnector().get_session
        try:
            with Session() as session:
                # Crear el pedido
                pedido = Pedido(id_cliente=data["id_cliente"])
                session.add(pedido)

                # Hacer flush para obtener id_pedido (clave se asignará en after_insert)
                session.flush()

                # Crear detalles
                detalles = [
                    PedidoDetalle(
                        id_pedido=pedido.id_pedido,
                        galleta_id=detalle["galleta_id"],
                        tipo_venta_id=detalle["tipo_venta_id"],
                        factor_venta=detalle["factor_venta"],
                        precio_unitario=detalle["precio_unitario"]
                    )
                    for detalle in data["detalle"]
                ]
                session.add_all(detalles)

                # Confirmar transacción
                session.commit()

                return {
                    "message": "Pedido guardado correctamente",
                    "clave_pedido": pedido.clave_pedido
                }

        except Exception as e:
            logger.error(f"Error al guardar el pedido: {e}", exc_info=True)
            raise

    def consultar_historial_pedidos(self, id_cliente: int) -> dict:
        """
        Consulta el historial de pedidos de un cliente.
        """
        Session = DatabaseConnector().get_session
        try:
            with Session() as session:
                # Se incluye Pedido en la consulta para poder acceder a la fecha
                pedido_detalles = session.query(
                    PedidoDetalle,
                    Pedido,
                    Galleta,
                    TipoVenta
                ).join(
                    Pedido, PedidoDetalle.id_pedido == Pedido.id_pedido
                ).join(
                    Galleta, PedidoDetalle.galleta_id == Galleta.id_galleta
                ).join(
                    TipoVenta, PedidoDetalle.tipo_venta_id == TipoVenta.id_tipo_venta
                ).filter(
                    Pedido.id_cliente == id_cliente
                ).all()
                
                data = []
                # Desempaquetamos cada tupla en sus componentes
                for detalle, pedido, galleta, tipo_venta in pedido_detalles:
                    data.append({
                        "id_pedido": detalle.id_pedido,
                        "fecha": pedido.fecha,
                        "galleta": galleta.nombre_galleta,
                        "tipo_venta": tipo_venta.nombre,
                        "precio_unitario": detalle.precio_unitario,
                        "factor_venta": detalle.factor_venta,
                        "estado": pedido.estatus
                    })
                
                # Devolvemos un diccionario que encapsula la lista de pedidos
                return {"pedidos": data}

        except Exception as e:
            logger.error(f"Error al consultar el historial de pedidos: {e}", exc_info=True)
            raise

    def get_all_pedidos(self) -> dict:
        """
        Obtiene todos los pedidos de la base de datos. con la suma de su total de detalle
        """
        Session = DatabaseConnector().get_session
        try:
            with Session() as session:
                pedidos = session.query(Pedido).join(Cliente, Pedido.id_cliente == Cliente.id_cliente).all()
                for pedido in pedidos:
                    pedido.total = sum(detalle.precio_unitario * detalle.factor_venta for detalle in pedido.detalle)
                return {"pedidos": pedidos}
        except Exception as e:
            logger.error(f"Error al obtener todos los pedidos: {e}", exc_info=True)
            raise
