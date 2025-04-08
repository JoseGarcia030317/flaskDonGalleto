import logging
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_ventas import Venta, VentaDetalle, TipoVenta
from core.classes.Tb_galletas import Galleta, InventarioGalleta
from sqlalchemy import func


logger = logging.getLogger(__name__)


class VentaCRUD:
    SALIDA = 0;
    ENTRADA = 1;
    VENTA = 1;

    def guardar_venta(self, data: dict) -> dict:
        """
        Guarda una venta en la base de datos.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                venta = Venta(
                    observacion=data["observacion"],
                    descuento=data["descuento"],
                )
                session.add(venta)
                session.flush()
                id_venta = venta.id_venta
                for detalle in data["detalle_venta"]:
                    venta_detalle = VentaDetalle(
                        galleta_id=detalle["galleta_id"],
                        tipo_venta_id=detalle["tipo_venta_id"],
                        factor_venta=detalle["factor_venta"],
                        precio_unitario=detalle["precio_unitario"],
                        id_venta=id_venta
                    )
                    session.add(venta_detalle)
                    self.descontar_galletas(detalle["galleta_id"], detalle["cantidad_galletas"], id_venta, session)
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

    def get_all_ventas(self) -> list:
        """
        Obtiene todas las ventas de la base de datos, incluyendo el total de cada venta.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                # Subconsulta: total por venta (suma de precio_unitario * factor_venta)
                subquery_total = session.query(
                    VentaDetalle.id_venta.label("id_venta"),
                    func.sum(VentaDetalle.precio_unitario * VentaDetalle.factor_venta).label("total_venta")
                ).group_by(VentaDetalle.id_venta).subquery()

                # Consulta principal: unir Venta con la subconsulta para traer el total de cada venta
                ventas_query = session.query(
                    Venta.id_venta,
                    Venta.clave_venta,
                    Venta.observacion,
                    Venta.descuento,
                    Venta.fecha,
                    Venta.estatus,
                    Venta.id_pedido,
                    func.coalesce(subquery_total.c.total_venta, 0).label("total_venta")
                ).outerjoin(
                    subquery_total, Venta.id_venta == subquery_total.c.id_venta
                )

                # Convertir los resultados en una lista de diccionarios
                result = []
                for venta in ventas_query:
                    result.append({
                        "id_venta": venta.id_venta,
                        "clave_venta": venta.clave_venta,
                        "observacion": venta.observacion,
                        "descuento": venta.descuento,
                        "fecha": venta.fecha,
                        "estatus": venta.estatus,
                        "total_venta": float(venta.total_venta),
                        "id_pedido": venta.id_pedido
                    })

                return result

        except Exception as e:
            logger.error("Error al obtener las ventas: %s", e)
            raise e from e
        
    def get_venta_by_id(self, id_venta: int) -> dict:
        """
        Retorna una venta con su detalle completo (galleta, tipo venta, subtotal).
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                # Obtener la venta principal
                venta = session.query(Venta).filter(Venta.id_venta == id_venta).first()
                if not venta:
                    return {}

                # Obtener el detalle con joins para galleta y tipo_venta
                detalles = session.query(
                    VentaDetalle.galleta_id,
                    Galleta.nombre_galleta.label("galleta_nombre"),
                    VentaDetalle.tipo_venta_id,
                    TipoVenta.nombre.label("tipo_venta"),
                    VentaDetalle.factor_venta,
                    VentaDetalle.precio_unitario,
                    (VentaDetalle.precio_unitario * VentaDetalle.factor_venta).label("subtotal")
                ).join(Galleta, Galleta.id_galleta == VentaDetalle.galleta_id
                ).join(TipoVenta, TipoVenta.id_tipo_venta == VentaDetalle.tipo_venta_id
                ).filter(VentaDetalle.id_venta == id_venta).all()

                # Calcular total de la venta
                total_venta = sum([float(det.subtotal) for det in detalles])

                # Construir respuesta
                return {
                    "id_venta": venta.id_venta,
                    "clave_venta": venta.clave_venta,
                    "observacion": venta.observacion,
                    "descuento": float(venta.descuento),
                    "fecha": venta.fecha.strftime("%Y-%m-%d %H:%M:%S"),
                    "estatus": venta.estatus,
                    "total_venta": total_venta,
                    "detalle_venta": [{
                        "galleta_id": det.galleta_id,
                        "galleta_nombre": det.galleta_nombre,
                        "tipo_venta_id": det.tipo_venta_id,
                        "tipo_venta": det.tipo_venta,
                        "factor_venta": float(det.factor_venta),
                        "precio_unitario": float(det.precio_unitario),
                        "subtotal": float(det.subtotal)
                    } for det in detalles]
                }

        except Exception as e:
            logger.error("Error al obtener la venta con detalle: %s", e)
            raise e from e

    def descontar_galletas(self, id_galleta: int, cantidad_galleta: float, id_venta: int, session = None) -> None:
        """
        Descontar galletas de la base de datos.
        """
        try:
            Session = session if session else DatabaseConnector().get_session
            with Session() as session:
                inventario_galleta = InventarioGalleta(
                    galleta_id=id_galleta,
                    cantidad=cantidad_galleta,
                    venta_id=id_venta,
                    tipo_registro=self.SALIDA,
                    tipo_movimiento=self.VENTA
                )
                session.add(inventario_galleta)
        except Exception as e:
            logger.error("Error al descontar galletas: %s", e)
            raise e from e
