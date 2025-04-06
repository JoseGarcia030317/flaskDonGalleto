from flask_login import UserMixin
from sqlalchemy import create_engine, Column, Integer, String, UniqueConstraint, func
from sqlalchemy.ext.declarative import declarative_base
import bcrypt


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
    