from flask_login import UserMixin
from sqlalchemy import Column, Integer, String, UniqueConstraint, PrimaryKeyConstraint, DateTime
from sqlalchemy.ext.declarative import declarative_base
import bcrypt
from datetime import datetime


Base = declarative_base()


class Usuario(UserMixin, Base):
    __tablename__ = 'Tb_usuario'
    __table_args__ = (UniqueConstraint('usuario', name='uq_usuario'),)

    id_usuario   = Column(Integer, primary_key=True, autoincrement=True)
    nombre       = Column(String(65), nullable=False)
    apellido_pat = Column(String(65), nullable=False)
    apellido_mat = Column(String(65), nullable=False)
    telefono     = Column(String(10), nullable=False)
    tipo         = Column(Integer, nullable=False)
    usuario      = Column(String(65), nullable=False, unique=True)
    contrasenia  = Column(String(65), nullable=False)
    estatus      = Column(Integer, nullable=False, default=1)

    def __init__(self, nombre, apellido_pat, apellido_mat, telefono, tipo, usuario, contrasenia, estatus=1, id_usuario=None):
        self.nombre = nombre
        self.apellido_pat = apellido_pat
        self.apellido_mat = apellido_mat
        self.telefono = telefono
        self.tipo = tipo
        self.usuario = usuario
        self.contrasenia = self.hash_password(contrasenia)
        self.estatus = estatus
        self.id_usuario = id_usuario

    def hash_password(self, password):
        """Cifra la contraseña usando bcrypt."""
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        return hashed.decode('utf-8')
    
    def get_id(self):
        return str(f'usuario: {self.id_usuario}')


class TipoUsuario(Base):
    __tablename__ = 'Tb_catalogo_tipo_usuario'

    id_tipo_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(65), nullable=False)
    descripcion = Column(String(250), nullable=False)

    def __init__(self, nombre, descripcion, id_tipo_usuario=None):
        self.nombre = nombre
        self.descripcion = descripcion
        self.id_tipo_usuario = id_tipo_usuario

class TipoUsuarioModulo(Base):
    __tablename__ = 'Tb_tipo_usuario_modulo'

    id_tipo_usuario = Column(Integer, nullable=False)
    id_modulo = Column(Integer, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('id_tipo_usuario', 'id_modulo', name='pk_tipo_usuario_modulo'),
    )

    def __init__(self, id_tipo_usuario, id_modulo):
        self.id_tipo_usuario = id_tipo_usuario
        self.id_modulo = id_modulo

    def __repr__(self):
        return f"<TipoUsuarioModulo(id_tipo_usuario={self.id_tipo_usuario}, id_modulo={self.id_modulo})>"

class Modulo(Base):
    __tablename__ = 'Tb_catalogo_modulos'

    id_modulo = Column(Integer, primary_key=True, autoincrement=True)
    descripcion = Column(String(250), nullable=False)
    ruta = Column(String(500), nullable=False)
    funcion = Column(String(500), nullable=False)
    estatus = Column(Integer, nullable=False, default=1)

    def __init__(self, descripcion, ruta, funcion, estatus=1, id_modulo=None):
        self.descripcion = descripcion
        self.ruta = ruta
        self.funcion = funcion
        self.estatus = estatus
        self.id_modulo = id_modulo

    def __repr__(self):
        return f"<Modulo(id_modulo={self.id_modulo}, descripcion={self.descripcion}, ruta={self.ruta}, funcion={self.funcion}, estatus={self.estatus})>"


class TbLoginBloqueos(Base):
    __tablename__ = 'Tb_login_bloqueos'
    
    id_bloqueo = Column(Integer, primary_key=True, autoincrement=True)
    id_cliente = Column(Integer, nullable=True)
    id_usuario = Column(Integer, nullable=True)
    fecha_bloqueo = Column(DateTime, nullable=True)
    message = Column(String(50), nullable=True)

    def __init__(self, id_cliente=None, id_usuario=None, message=None):
        self.id_cliente = id_cliente
        self.id_usuario = id_usuario
        # Asignamos la fecha actual como objeto datetime para que coincida con el tipo DateTime
        self.fecha_bloqueo = datetime.now()
        self.message = message if message else 'Usuario bloqueado por 5 minutos'

    def __repr__(self):
        return (f"<TbLoginBloqueos(id_cliente={self.id_cliente}, "
                f"id_usuario={self.id_usuario}, "
                f"fecha_bloqueo={self.fecha_bloqueo}, "
                f"message='{self.message}')>")