from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, ForeignKey, relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime
Base = declarative_base()

class Receta(Base):
    __tablename__ = 'TB_Receta'
    
    id_receta = Column(Integer, primary_key=True, autoincrement=True)
    nombre_receta = Column(String(50), nullable=True)
    tiempo_horneado = Column(TIMESTAMP, nullable=True)
    galletas_producidas = Column(Integer, nullable=True)
    estatus = Column(Integer, nullable=True)
    galleta_id = Column(Integer, nullable=False)
    

    
    def __init__(self, nombre_receta=None, tiempo_horneado=None, galletas_producidas=None, estatus=None, galleta_id=None):
        self.nombre_receta = nombre_receta
        self.tiempo_horneado = tiempo_horneado
        self.galletas_producidas = galletas_producidas
        self.estatus = estatus
        self.galleta_id = galleta_id


class DetalleReceta(Base):
    __tablename__ = 'TB_DetalleReceta'
    
    receta_id = Column(Integer, ForeignKey('TB_Receta.id_receta'), primary_key=True)
    insumo_id = Column(Integer, ForeignKey('TB_Insumo.id_insumo'), primary_key=True)
    cantidad = Column(Numeric(18, 2), nullable=True)
    
    # Relaciones con las tablas Receta e Insumo
    receta = relationship("Receta", backref="detalles_receta")
    insumo = relationship("Insumo", backref="detalles_receta")
    
    def __init__(self, receta_id, insumo_id, cantidad=None):
        """
        Constructor para crear una instancia de DetalleReceta.
        
        :param receta_id: ID de la receta (obligatorio).
        :param insumo_id: ID del insumo (obligatorio).
        :param cantidad: Cantidad requerida para la receta (opcional).
        """
        self.receta_id = receta_id
        self.insumo_id = insumo_id
        self.cantidad = cantidad