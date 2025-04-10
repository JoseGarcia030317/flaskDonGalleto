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
                pedidos = session.query(
                        Pedido.id_pedido,
                        Pedido.clave_pedido,
                        Pedido.fecha,
                        Pedido.estatus, 
                        func.concat(
                                Cliente.nombre, " ", Cliente.apellido_pat, " ", Cliente.apellido_mat
                                ).label("cliente"),
                        func.sum(PedidoDetalle.factor_venta * PedidoDetalle.precio_unitario).label("total")
                    ).join(
                        PedidoDetalle, PedidoDetalle.id_pedido == Pedido.id_pedido
                    ).join(
                        Cliente, Pedido.id_cliente == Cliente.id_cliente
                    ).filter(Pedido.estatus == 1).group_by(Pedido.id_pedido)
                
                pedidos = pedidos.all()

                result = [];
                for obj in pedidos:
                    row_dict  = {
                        "id_pedido": obj.id_pedido,
                        "clave_pedido": obj.clave_pedido,
                        "fecha": obj.fecha.strftime('%Y-%m-%d %H:%M:%S'),
                        "estatus": obj.estatus,
                        "nombre_cliente": obj.cliente,
                        "total_pedido": obj.total
                    }
                    result.append(row_dict )
                return result
        except Exception as e:
            logger.error(f"Error al obtener todos los pedidos: {e}", exc_info=True)
            raise
    

    def get_pedidos_by_id(self, id_pedido):
        """
        Obtiene pedido por ID 
        """
        Session = DatabaseConnector().get_session
        try:
            with Session() as session:
                 
                subuery = session.query(
                        Galleta.id_galleta,
                        PedidoDetalle.factor_venta,
                        Galleta.nombre_galleta,
                        Galleta.precio_unitario,
                        func.sum(PedidoDetalle.factor_venta * PedidoDetalle.precio_unitario).label("total_pedido"),
                        PedidoDetalle.tipo_venta_id,
                        TipoVenta.nombre.label("tipo_venta_nombre")
                    ).join(
                        PedidoDetalle, PedidoDetalle.galleta_id == Galleta.id_galleta
                    ).join(
                        TipoVenta, TipoVenta.id_tipo_venta == PedidoDetalle.tipo_venta_id
                    ).filter(
                        PedidoDetalle.id_pedido == id_pedido
                    ).group_by(
                        Galleta.id_galleta,
                        PedidoDetalle.factor_venta,
                        Galleta.nombre_galleta,
                        Galleta.precio_unitario,
                        PedidoDetalle.tipo_venta_id,
                        TipoVenta.nombre
                    ).all()
                
                query = session.query(
                        Pedido.id_pedido,
                        Pedido.clave_pedido,
                        Pedido.fecha,
                        Pedido.estatus, 
                        func.concat(
                                Cliente.nombre, " ", Cliente.apellido_pat, " ", Cliente.apellido_mat
                                ).label("cliente"),
                        func.sum(PedidoDetalle.factor_venta * PedidoDetalle.precio_unitario).label("total")
                    ).join(
                        PedidoDetalle, PedidoDetalle.id_pedido == Pedido.id_pedido
                    ).join(
                        Cliente, Pedido.id_cliente == Cliente.id_cliente
                    ).filter(Pedido.id_pedido == id_pedido).group_by(Pedido.id_pedido).first()

                if query:
                    result = {
                        "id_pedido": query.id_pedido,
                        "clave_pedido": query.clave_pedido,
                        "fecha": query.fecha.strftime('%Y-%m-%d'),
                        "estatus": query.estatus,
                        "nombre_cliente": query.cliente,
                        "total_pedido": float(query.total),
                        "detalles": [
                            {
                                "factor_venta": d.factor_venta,
                                "galleta_id": d.id_galleta,
                                "galleta_nombre": d.nombre_galleta,
                                "precio_unitario": float(d.precio_unitario),
                                "subtotal": float(d.total_pedido),
                                "tipo_venta": d.tipo_venta_nombre,
                                "tipo_venta_id": d.tipo_venta_id
                            } for d in subuery
                        ]
                    }
                else:
                    result = {}

                return result 

        except Exception as e:
            logger.error(f"Error al obtener el pedido: {e}", exc_info=True)
            raise

    def cancelar_pedido(self, id_pedido):
        """
        Realiza una baja lógica de un pedido por su id, cambiando el campo 'estatus' a 3.
        Retorna un dict con el insumo actualizado o {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            pedido = session.query(Pedido).filter_by(id_pedido=id_pedido, estatus=1).first()
            if pedido:
                try:
                    pedido.estatus = 3
                    session.commit()

                    return {
                        "status": 200,
                        "message": "Pedido cancelado correctamente.",
                        "pedido": {
                            "id_pedido": pedido.id_pedido,
                            "clave_pedido": pedido.clave_pedido,
                            "fecha": str(pedido.fecha), 
                            "estatus": pedido.estatus
                        }
                    }
                except Exception as e:
                    session.rollback()
                    raise e
            return {
                "status": 404,
                "message": "Pedido no encontrado o ya cancelado.",
                "pedido": {}
            }