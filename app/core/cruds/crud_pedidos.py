import logging
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_pedidos import Pedido, PedidoDetalle

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
