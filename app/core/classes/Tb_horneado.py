from sqlalchemy import Column, Integer, String, DateTime, event, text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Horneado(Base):
    __tablename__ = 'TB_Horneado'

    id_horneado = Column(Integer, primary_key=True, autoincrement=True)
    lote = Column(String(20), nullable=False)
    receta_id = Column(Integer, nullable=False)
    fecha_horneado = Column(DateTime, nullable=False)
    estatus = Column(Integer, nullable=False)
    fecha_cancelacion = Column(DateTime, nullable=True)

    def __init__(self, receta_id, fecha_horneado=None, fecha_cancelacion=None, estatus=1):
        self.receta_id = receta_id
        self.fecha_horneado = fecha_horneado if fecha_horneado else datetime.now()
        self.estatus = estatus
        self.fecha_cancelacion = fecha_cancelacion if fecha_cancelacion else None

    def __repr__(self):
        return (f"<Horneado(id_horneado={self.id_horneado}, lote='{self.lote}', "
                f"receta_id={self.receta_id}, fecha_horneado={self.fecha_horneado}, estatus={self.estatus}, fecha_cancelacion={self.fecha_cancelacion})>")

@event.listens_for(Horneado, 'before_insert')
def asignar_lote(mapper, connection, target):
    result = connection.execute(
        text("SELECT lote FROM TB_Horneado ORDER BY id_horneado DESC LIMIT 1")
    ).fetchone()
    
    if result is not None:
        try:
            ultimo_lote = result[0]
            numero_actual = int(ultimo_lote.replace("Lote", ""))
            siguiente_numero = numero_actual + 1
        except ValueError:
            siguiente_numero = 1
    else:
        siguiente_numero = 1 

    target.lote = f"Lote{siguiente_numero:03d}"
