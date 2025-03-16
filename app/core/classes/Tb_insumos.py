from sqlalchemy import Column, ForeignKey, Integer, String, DOUBLE
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Insumo(Base):
    __tablename__ = 'TB_Insumo'

    id_insumo = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(25), nullable=True)
    descripcion = Column(String(10), nullable=True)
    unidad_id = Column(Integer, ForeignKey(
        'TB_CatalogoUnidad.id_unidad'), nullable=False)
    estatus = Column(Integer, nullable=False, default = 1)
    precio_unitario = Column(DOUBLE, nullable=True)

    def __init__(self, id_insumo, nombre, descripcion, unidad_id, estatus = 1, precio_unitario=None):
        self.id_insumo = id_insumo
        self.nombre = nombre
        self.descripcion = descripcion
        self.unidad_id = unidad_id
        self.estatus = estatus
        self.precio_unitario = precio_unitario
