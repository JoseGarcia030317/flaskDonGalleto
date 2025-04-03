from sqlalchemy import Column, Integer, String, DateTime, Numeric, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class Compra(Base):
    __tablename__ = 'TB_Compra'
    
    id_compra = Column(Integer, primary_key=True, autoincrement=True)
    clave_compra = Column(String(65))
    fecha_compra = Column(DateTime)
    observacion = Column(String(65))
    estatus = Column(Integer)
    proveedor_id = Column(Integer, nullable=False)
    
    def __init__(self, clave_compra=None, fecha_compra=None, observacion=None, estatus=1, proveedor_id=None):
        """
        Constructor para crear una instancia de Compra.
        
        :param clave_compra: Clave de la compra (opcional).
        :param fecha_compra: Fecha de la compra.
        :param observacion: Observación de la compra.
        :param estatus: Estatus de la compra (por defecto 1).
        :param proveedor_id: ID del proveedor (obligatorio).
        """
        self.clave_compra = str(uuid.uuid4())[0:6] if clave_compra is None else clave_compra
        self.fecha_compra = fecha_compra
        self.observacion = observacion
        self.estatus = estatus if estatus is not None else 1
        self.proveedor_id = proveedor_id

    def __repr__(self):
        return f"<Compra(id_compra={self.id_compra}, clave_compra='{self.clave_compra}', fecha_compra={self.fecha_compra})>"


class CompraDetalle(Base):
    __tablename__ = 'TB_CompraDetalle'

    compra_id = Column(Integer, nullable=False)
    insumo_id = Column(Integer, nullable=False)
    presentacion = Column(String(50))
    precio_unitario = Column(Numeric(18, 2), nullable=False)
    cantidad = Column(Integer, nullable=False)
    
    __table_args__ = (
        PrimaryKeyConstraint('compra_id', 'insumo_id', name='PK_CompraDetalle'),
        {'schema': 'DB_DONGALLETO'}
    )

    def __init__(self, compra_id=None, insumo_id=None, presentacion=None, precio_unitario=None, cantidad=None):
        """
        Constructor para crear una instancia de CompraDetalle.
        
        :param compra_id: ID de la compra (obligatorio).
        :param insumo_id: ID del insumo (obligatorio).
        :param presentacion: Presentación del insumo.
        :param precio_unitario: Precio unitario (obligatorio).
        :param cantidad: Cantidad (obligatorio).
        """
        self.compra_id = compra_id
        self.insumo_id = insumo_id
        self.presentacion = presentacion
        self.precio_unitario = precio_unitario
        self.cantidad = cantidad


    def __repr__(self):
        return f"<CompraDetalle(compra_id={self.compra_id}, insumo_id={self.insumo_id}, precio_unitario={self.precio_unitario})>"
