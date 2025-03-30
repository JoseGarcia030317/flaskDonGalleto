from sqlalchemy import Column, Integer, DateTime, String
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Merma(Base):
    __tablename__ = 'TB_Merma'
    
    id_merma = Column(Integer, primary_key=True, autoincrement=True)
    motivo = Column(Integer, nullable=False)
    tipo_merma = Column(Integer, nullable=False)
    observacion = Column(String, nullable=True)
    fecha = Column(DateTime, nullable=True, default=datetime.datetime.now)
    id_usuario_registro = Column(Integer, nullable=False)
    id_estatus = Column(Integer, nullable=False, default=1)
    
    def __init__(self, motivo, tipo_merma, observacion=None, fecha=None, id_usuario_registro=None, id_estatus=None):
        self.motivo = motivo
        self.tipo_merma = tipo_merma
        self.observacion = observacion
        self.fecha = fecha or datetime.datetime.now()
        self.id_usuario_registro = id_usuario_registro
        self.id_estatus = id_estatus if id_estatus in [1, 0] else 1


class MotivoMerma(Base):
    __tablename__ = 'TB_CatalogoMotivosMerma'
    
    id_motivo_merma = Column(Integer, primary_key=True, autoincrement=True)
    descripcion = Column(String, nullable=False)


class TipoMerma(Base):
    __tablename__ = 'TB_CatalogoTipoMerma'
    
    id_tipo_merma = Column(Integer, primary_key=True, autoincrement=True)
    descripcion = Column(String, nullable=False)


