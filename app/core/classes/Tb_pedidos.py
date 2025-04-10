from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, DECIMAL, event, text
from datetime import datetime

Base = declarative_base()

class Pedido(Base):
    __tablename__ = 'TB_Pedido'

    id_pedido = Column(Integer, primary_key=True, autoincrement=True)
    clave_pedido = Column(String(65), nullable=False, unique=True)
    fecha = Column(DateTime, default=datetime.now)
    estatus = Column(Integer, default=1)
    id_cliente = Column(Integer)

    def __init__(self, clave_pedido=None, fecha=None, estatus=1, id_cliente=None):
        self.clave_pedido = clave_pedido
        self.fecha = fecha or datetime.now()
        self.estatus = estatus
        self.id_cliente = id_cliente

# Evento seguro para asignar clave después del insert (evita conflictos con identity map)
@event.listens_for(Pedido, 'after_insert')
def generar_clave_pedido(mapper, connection, target):
    clave_generada = f'P{target.id_pedido:04d}'
    connection.execute(
        text("""
            UPDATE DB_DONGALLETO.TB_Pedido
            SET clave_pedido = :clave
            WHERE id_pedido = :id
        """),
        {"clave": clave_generada, "id": target.id_pedido}
    )
    target.clave_pedido = clave_generada  # También lo actualizamos en memoria


class PedidoDetalle(Base):
    __tablename__ = 'TB_PedidoDetalle'

    id_pedido = Column(Integer, primary_key=True)
    galleta_id = Column(Integer, primary_key=True)
    tipo_venta_id = Column(Integer, primary_key=True)
    factor_venta = Column(DECIMAL(18, 2))
    precio_unitario = Column(DECIMAL(18, 2))

    def __init__(self, id_pedido=None, galleta_id=None, tipo_venta_id=None,
                 factor_venta=None, precio_unitario=None):
        self.id_pedido = id_pedido
        self.galleta_id = galleta_id
        self.tipo_venta_id = tipo_venta_id
        self.factor_venta = factor_venta
        self.precio_unitario = precio_unitario
