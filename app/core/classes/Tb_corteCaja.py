from sqlalchemy import Column, Integer, DateTime, Numeric, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from flask_login import current_user
from datetime import datetime


Base = declarative_base()

class CorteCaja(Base):
    __tablename__ = 'TB_CorteCaja'

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
        
class DetalleCorte(Base):
    __tablename__ = 'TB_CorteCajaDetalle'
    
    id_corte = Column(Integer, primary_key=True)
    tipo_registro = Column(Integer)
    id_venta = Column(Integer)
    monto_venta = Column(DECIMAL(18, 2))
    id_compra = Column(Integer)
    monto_compra = Column(DECIMAL(18, 2))

    def __init__(self, id_corte=None, tipo_registro=None, id_venta=None, monto_venta=None, id_compra=None, monto_compra=None):
        self.id_corte = id_corte
        self.tipo_registro = tipo_registro
        self.id_venta = id_venta
        self.monto_venta = monto_venta
        self.id_compra = id_compra
        self.monto_compra = monto_compra

    def __repr__(self):
        return f"<CorteCajaDetalle(id_corte={self.id_corte}, tipo_registro={self.tipo_registro}, " \
               f"id_venta={self.id_venta}, monto_venta={self.monto_venta}, " \
               f"id_compra={self.id_compra}, monto_compra={self.monto_compra})>"