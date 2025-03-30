from sqlalchemy import Column, Integer, SmallInteger, String, Numeric, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()


class InventarioGalleta(Base):
    __tablename__ = 'TB_InventarioGalleta'
    
    id_inventario_galleta = Column(Integer, primary_key=True, autoincrement=True)
    galleta_id = Column(Integer, nullable=False)
    cantidad = Column(Integer, nullable=True)
    horneado_id = Column(Integer, nullable=True)
    venta_id = Column(Integer, nullable=True)
    merma_id = Column(Integer, nullable=True)
    tipo_registro = Column(SmallInteger, nullable=False)
    tipo_movimiento = Column(SmallInteger, nullable=False)

    def __init__(self, galleta_id = None, tipo_registro = None, cantidad=None, horneado_id=None, venta_id=None, merma_id=None, tipo_movimiento=None):
        """
        Constructor para crear una instancia de InventarioGalleta.
        
        :param galleta_id: ID de la galleta (obligatorio).
        :param tipo_registro: Tipo de registro (obligatorio).
        :param cantidad: Cantidad de galletas (obligatorio).
        :param horneado_id: ID del horneado asociado.
        :param venta_id: ID de la venta asociada.
        :param merma_id: ID de la merma asociada.
        :param tipo_movimiento: Tipo de movimiento.
        """
        self.galleta_id = galleta_id
        self.tipo_registro = tipo_registro
        self.cantidad = cantidad
        self.horneado_id = horneado_id if horneado_id else 0
        self.venta_id = venta_id if venta_id else 0 
        self.merma_id = merma_id if merma_id else 0
        self.tipo_movimiento = tipo_movimiento



class Galleta(Base):
    __tablename__ = 'TB_Galleta'
    
    id_galleta = Column(Integer, primary_key=True, autoincrement=True)
    nombre_galleta = Column(String(50), nullable=True)
    proteccion_precio = Column(Numeric(18, 2), nullable=True)
    gramos_galleta = Column(Numeric(18, 2), nullable=True)
    precio_unitario = Column(Numeric(18, 2), nullable=True)
    dias_caducidad = Column(Integer, nullable=True)
    estatus = Column(Integer, nullable=True)
    
    def __init__(self, nombre_galleta=None, proteccion_precio=None, gramos_galleta=None, precio_unitario=None, dias_caducidad=None, estatus=None):
        self.nombre_galleta = nombre_galleta
        self.proteccion_precio = proteccion_precio
        self.gramos_galleta = gramos_galleta
        self.precio_unitario = precio_unitario
        self.dias_caducidad = dias_caducidad
        self.estatus = estatus if estatus else 1


class Receta(Base):
    __tablename__ = 'TB_Receta'
    
    id_receta = Column(Integer, primary_key=True, autoincrement=True)
    nombre_receta = Column(String(50), nullable=True)
    tiempo_horneado = Column(Integer, nullable=True)
    galletas_producidas = Column(Integer, nullable=True)
    estatus = Column(Integer, nullable=True)
    galleta_id = Column(Integer, nullable=False)
    receta_base = Column(Integer, nullable=False)
    
    
    def __init__(self, nombre_receta=None, tiempo_horneado=None, galletas_producidas=None, estatus=None, galleta_id=None, receta_base=None):
        self.nombre_receta = nombre_receta
        self.tiempo_horneado = tiempo_horneado if tiempo_horneado else 0
        self.galletas_producidas = galletas_producidas
        self.estatus = estatus if estatus else 1
        self.galleta_id = galleta_id
        self.receta_base = receta_base if receta_base else 0


class DetalleReceta(Base):
    __tablename__ = 'TB_DetalleReceta'
    
    receta_id = Column(Integer)
    insumo_id = Column(Integer)
    cantidad = Column(Numeric(18, 2), nullable=True)

    #primary key
    __table_args__ = (
        PrimaryKeyConstraint('receta_id', 'insumo_id'),
    )
    
    
    def __init__(self, insumo_id, cantidad, receta_id=None):
        """
        Constructor para crear una instancia de DetalleReceta.
        
        :param receta_id: ID de la receta (obligatorio).
        :param insumo_id: ID del insumo (obligatorio).
        :param cantidad: Cantidad requerida para la receta.
        """
        self.receta_id = receta_id
        self.insumo_id = insumo_id
        self.cantidad = cantidad