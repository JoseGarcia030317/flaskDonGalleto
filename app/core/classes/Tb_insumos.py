from sqlalchemy import Column, ForeignKey, Integer, String, DOUBLE, SmallInteger, DateTime, Numeric
from sqlalchemy.ext.declarative import declarative_base
import datetime
Base = declarative_base()


class Insumo(Base):
    __tablename__ = 'TB_Insumo'

    id_insumo = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(25), nullable=True)
    descripcion = Column(String(10), nullable=True)
    unidad_id = Column(Integer, nullable=False)
    estatus = Column(Integer, nullable=False, default = 1)
    precio_unitario = Column(DOUBLE, nullable=True)

    def __init__(self, nombre, descripcion, unidad_id, estatus = 1, id_insumo = None, precio_unitario=None):
        self.id_insumo = id_insumo
        self.nombre = nombre
        self.descripcion = descripcion
        self.unidad_id = unidad_id
        self.estatus = estatus
        self.precio_unitario = precio_unitario



class InventarioInsumo(Base):
    __tablename__ = 'TB_InventarioInsumo'
    
    id_inventario_insumo = Column(Integer, primary_key=True, autoincrement=True)
    insumo_id = Column(Integer, nullable=False)
    cantidad = Column(Numeric(18, 2), nullable=True)
    tipo_movimiento = Column(Integer, nullable=True)
    tipo_registro = Column(SmallInteger, nullable=False)
    fecha = Column(DateTime, nullable=True)
    compra_id = Column(Integer, nullable=True)
    merma_id = Column(Integer, nullable=True)
    horneado_id = Column(Integer, nullable=True)
    id_estatus = Column(Integer, nullable=False, default = 1)
    fecha_caducidad = Column(DateTime, nullable=True)
    
    def __init__(self, insumo_id=None, tipo_registro=None, cantidad=None, tipo_movimiento=None, fecha=None, compra_id=None, merma_id=None, horneado_id=None, id_estatus=None, fecha_caducidad=None):
        """
        Constructor para crear una instancia de InventarioInsumo.
        
        :param insumo_id: ID del insumo 
        :param tipo_registro: Tipo de registro
        :param cantidad: Cantidad 
        :param tipo_movimiento: Tipo de movimiento
        :param fecha: Fecha del registro
        :param compra_id: ID de la compra asociada
        :param merma_id: ID de la merma asociada
        :param horneado_id: ID del horneado asociado
        :param fecha_caducidad: Fecha de caducidad
        """
        self.insumo_id = insumo_id
        self.tipo_registro = tipo_registro
        self.cantidad = cantidad
        self.tipo_movimiento = tipo_movimiento
        self.fecha = fecha or datetime.datetime.now()
        self.compra_id = compra_id if compra_id else 0
        self.merma_id = merma_id if merma_id else 0
        self.horneado_id = horneado_id if horneado_id else 0
        self.id_estatus = id_estatus if id_estatus else 1
        self.fecha_caducidad = fecha_caducidad


class Vw_InsumosUltimaCompra(Base):
    __tablename__ = 'Vw_InsumosUltimaCompra'

    id_insumo = Column(Integer, primary_key=True)
    nombre = Column(String(25), nullable=True)
    descripcion = Column(String(10), nullable=True)
    unidad_id = Column(Integer, nullable=False)
    estatus = Column(Integer, nullable=False)
    precio_unitario = Column(DOUBLE, nullable=True)
    fecha_ultima_compra = Column(DateTime, nullable=True)
    unidades_compradas = Column(Integer, nullable=True)
    total_compra_insumo = Column(DOUBLE, nullable=True)
    pre_unit_compra = Column(DOUBLE, nullable=True)

