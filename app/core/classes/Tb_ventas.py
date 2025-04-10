from sqlalchemy import Column, Integer, String, Numeric, DateTime, UniqueConstraint, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from sqlalchemy import event
from sqlalchemy import text


Base = declarative_base()


class Venta(Base):
    __tablename__ = 'TB_Venta'
    
    id_venta = Column(Integer, primary_key=True, autoincrement=True)
    clave_venta = Column(String(65), nullable=False)
    fecha = Column(DateTime, nullable=False)
    observacion = Column(String(65), nullable=False)
    estatus = Column(Integer, nullable=False)
    descuento = Column(Numeric(18, 2), nullable=False)
    id_pedido = Column(Integer, nullable=False)

    def __init__(self, clave_venta = None, fecha = None, observacion = None, estatus = 1, descuento = None, id_pedido = None):
        self.clave_venta = clave_venta
        self.fecha = fecha if fecha else datetime.now()
        self.observacion = observacion 
        self.estatus = estatus 
        self.descuento = descuento if descuento else 0
        self.id_pedido = id_pedido if id_pedido else 0

    def __repr__(self):
        return f"<Venta(id_venta={self.id_venta}, clave_venta={self.clave_venta}, fecha={self.fecha}, observacion={self.observacion}, estatus={self.estatus}, descuento={self.descuento}, id_pedido={self.id_pedido})>"
    
@event.listens_for(Venta, 'before_insert')
def asignar_clave_venta(mapper, connection, target):
    # Si clave_compra ya está asignada se respeta su valor.
    if target.clave_venta is None:
        # Se utiliza text() para convertir la consulta en un objeto ejecutable
        result = connection.execute(
            text("SELECT coalesce(clave_venta,'') FROM TB_Venta ORDER BY id_venta DESC LIMIT 1")
        ).fetchone()
        
        if result is not None:
            try:
                # Se asume que el formato es "V" seguido de un número (por ejemplo, "V0005")
                ultimo_valor = result[0]
                numero_actual = int(ultimo_valor.replace("V", ""))
                siguiente_numero = numero_actual + 1
            except ValueError:
                siguiente_numero = 1  # En caso de que el formato no sea el esperado, se asigna 1
        else:
            siguiente_numero = 1  # Primer registro

        # Se asigna la clave con el formato deseado, por ejemplo "C0001"
        target.clave_venta = f"V{siguiente_numero:04d}"



class VentaDetalle(Base):
    __tablename__ = 'TB_DetalleVenta'

    id_venta = Column(Integer, nullable=False)
    galleta_id = Column(Integer, nullable=False)
    tipo_venta_id = Column(Integer, nullable=False)
    factor_venta = Column(Numeric(18, 2), nullable=False)
    precio_unitario = Column(Numeric(18, 2), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('id_venta', 'galleta_id', name='uq_venta_detalle_id_venta_galleta_id'),
    )

    def __repr__(self):
        return f"<VentaDetalle(id_venta={self.id_venta}, galleta_id={self.galleta_id}, tipo_venta_id={self.tipo_venta_id}, factor_venta={self.factor_venta}, precio_unitario={self.precio_unitario})>"

    def __init__(self, id_venta = None, galleta_id = None, tipo_venta_id = None, factor_venta = None, precio_unitario = None):
        self.id_venta = id_venta
        self.galleta_id = galleta_id
        self.tipo_venta_id = tipo_venta_id
        self.factor_venta = factor_venta
        self.precio_unitario = precio_unitario

class TipoVenta(Base):
    __tablename__ = 'TB_TipoVenta'

    id_tipo_venta = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(100), nullable=False)
    descuento = Column(Numeric(5, 2), nullable=False)

    def __init__(self, id_tipo_venta = None, nombre = None, descripcion = None, descuento = None):
        self.id_tipo_venta = id_tipo_venta
        self.nombre = nombre
        self.descripcion = descripcion
        self.descuento = descuento if descuento else 0



