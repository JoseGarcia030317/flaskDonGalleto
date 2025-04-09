from sqlalchemy import Column, Integer, DateTime, Numeric
from sqlalchemy.ext.declarative import declarative_base
from flask_login import current_user
from datetime import datetime


Base = declarative_base()

class CorteCaja(Base):
    __tablename__ = 'TB_CorteCaja'
    __table_args__ = {'schema': 'DB_DONGALLETO'}  # Define el esquema de la tabla

    id_corte = Column(Integer, primary_key=True, autoincrement=True)
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime)
    saldo_inicial = Column(Numeric(18, 2))
    saldo_final = Column(Numeric(18, 2))
    saldo_real = Column(Numeric(18, 2))
    saldo_diferencia = Column(Numeric(18, 2))
    id_usuario_inicio = Column(Integer)
    id_usuario_cierre = Column(Integer)
    estatus = Column(Integer)

    def __init__(self, fecha_inicio=None, fecha_fin=None, saldo_inicial=None, saldo_final=None,
                 saldo_real=None, saldo_diferencia=None, id_usuario_inicio=None, id_usuario_cierre=None,
                 estatus=1):
        self.fecha_inicio = fecha_inicio if fecha_inicio else datetime.now()
        self.fecha_fin = fecha_fin
        self.saldo_inicial = saldo_inicial
        self.saldo_final = saldo_final
        self.saldo_real = saldo_real
        self.saldo_diferencia = saldo_diferencia
        self.id_usuario_inicio = id_usuario_inicio
        self.id_usuario_cierre = id_usuario_cierre
        self.estatus = estatus