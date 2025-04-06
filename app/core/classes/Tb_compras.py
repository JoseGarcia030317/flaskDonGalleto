from sqlalchemy import Column, Integer, String, DateTime, Numeric, PrimaryKeyConstraint, event, text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

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
        self.clave_compra = clave_compra
        self.fecha_compra = fecha_compra if fecha_compra else datetime.now()
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


@event.listens_for(Compra, 'before_insert')
def asignar_clave_compra(mapper, connection, target):
    # Si clave_compra ya está asignada se respeta su valor.
    if target.clave_compra is None:
        # Se utiliza text() para convertir la consulta en un objeto ejecutable
        result = connection.execute(
            text("SELECT clave_compra FROM TB_Compra ORDER BY id_compra DESC LIMIT 1")
        ).fetchone()
        
        if result is not None:
            try:
                # Se asume que el formato es "C" seguido de un número (por ejemplo, "C0005")
                ultimo_valor = result[0]
                numero_actual = int(ultimo_valor.replace("C", ""))
                siguiente_numero = numero_actual + 1
            except ValueError:
                siguiente_numero = 1  # En caso de que el formato no sea el esperado, se asigna 1
        else:
            siguiente_numero = 1  # Primer registro

        # Se asigna la clave con el formato deseado, por ejemplo "C0001"
        target.clave_compra = f"C{siguiente_numero:04d}"