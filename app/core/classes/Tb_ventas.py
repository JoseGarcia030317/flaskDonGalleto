from sqlalchemy import Column, Integer, String, Numeric, DateTime, UniqueConstraint, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

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
        self.id_pedido = id_pedido

class VentaDetalle(Base):
    __tablename__ = 'TB_DetalleVenta'

    id_venta = Column(Integer, nullable=False)
    galleta_id = Column(Integer, nullable=False)
    tipo_venta_id = Column(Integer, nullable=False)
    factor_venta = Column(Numeric(18, 2), nullable=False)
    precio_unitario = Column(Numeric(18, 2), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('id_venta', 'galleta_id', name='uq_venta_detalle_id_venta_galleta_id'),
        {'schema': 'DB_DONGALLETO'}
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



