from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Proveedor(Base):
    __tablename__ = 'TB_Proveedor'
    
    id_proveedor = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(25), nullable=False)
    telefono = Column(String(10), nullable=False)
    contacto = Column(String(50))
    correo_electronico = Column(String(50))
    descripcion_servicio = Column(String(100))
    estatus = Column(Integer, nullable=False, default=1)

    def __init__(self, nombre, telefono, contacto=None, correo_electronico=None, descripcion_servicio=None, estatus=1):
        self.nombre = nombre
        self.telefono = telefono
        self.contacto = contacto
        self.correo_electronico = correo_electronico
        self.descripcion_servicio = descripcion_servicio
        self.estatus = estatus
