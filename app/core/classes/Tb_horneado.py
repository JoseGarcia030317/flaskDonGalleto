from sqlalchemy import Column, Integer, SmallInteger, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
Base = declarative_base()


base = declarative_base()


class Horneado(Base):
    __tablename__ = 'TB_Horneado'

    id_horneado = Column(Integer, primary_key=True, autoincrement=True)
    lote = Column(String(20), nullable=False)
    receta_id = Column(Integer, nullable=False)
    fecha_horneado = Column(DateTime, nullable=False)
    estatus = Column(Integer, nullable=False)

    def __init__(self, lote, receta_id, fecha_horneado, estatus):
        self.lote = lote
        self.receta_id = receta_id
        self.fecha_horneado = fecha_horneado if fecha_horneado else datetime.now()
        self.estatus = estatus
    
    def __repr__(self):
        return f"<Horneado(id_horneado={self.id_horneado}, lote='{self.lote}', receta_id={self.receta_id}, fecha_horneado={self.fecha_horneado}, estatus={self.estatus})>"
    
    



