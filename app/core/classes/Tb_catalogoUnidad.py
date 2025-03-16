from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Unidad(Base):
    __tablename__ = 'TB_CatalogoUnidad'
    
    id_unidad = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(25), nullable=True)
    simbolo = Column(String(5), nullable=True)
    descripcion = Column(String(100), nullable=True)
    estatus = Column(Integer, nullable=False, default = 1)
    
    def __init__(self, id_unidad, nombre, simbolo, descripcion, estatus = 1):
        self.id_unidad = id_unidad
        self.nombre = nombre
        self.simbolo = simbolo
        self.descripcion = descripcion
        self.estatus = estatus