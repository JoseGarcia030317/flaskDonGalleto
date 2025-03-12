import bcrypt
from flask_login import UserMixin
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class TbTiposUsuario(Base):
    __tablename__ = 'Tb_Tipos_usuario'
    __table_args__ = {'schema': 'SEGURIDAD'}

    id_tipo_usuario = Column(Integer, primary_key=True, autoincrement=True)
    tipo_usuario = Column(String(25), nullable=True)
    fecha_actualiza = Column(DateTime, nullable=True)
    estatus = Column(Integer, nullable=True)

    usuarios = relationship("TbUsuario", back_populates="tipo_usuario")

    def __repr__(self):
        return f"<TbTiposUsuario(id_tipo_usuario={self.id_tipo_usuario}, tipo_usuario='{self.tipo_usuario}', estatus={self.estatus})>"

class TbUsuariosEstatus(Base):
    __tablename__ = 'Tb_Usuarios_estatus'
    __table_args__ = {'schema': 'SEGURIDAD'}

    id_usuario_estatus = Column(Integer, primary_key=True, autoincrement=True)
    nombre_estatus = Column(String(25), nullable=True)
    descripcion_estatus = Column(String(100), nullable=True)
    fecha = Column(DateTime, nullable=True)
    estatus = Column(Integer, nullable=True)

    usuarios = relationship("TbUsuario", back_populates="estatus_usuario")

    def __repr__(self):
        return f"<TbUsuariosEstatus(id_usuario_estatus={self.id_usuario_estatus}, nombre_estatus='{self.nombre_estatus}', descripcion_estatus='{self.descripcion_estatus}', estatus={self.estatus})>"

class TbUsuario(UserMixin, Base):
    __tablename__ = 'Tb_usuario'
    __table_args__ = {'schema': 'SEGURIDAD'}

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(65), nullable=False)
    apellido_pat = Column(String(65), nullable=False)
    apellido_mat = Column(String(65), nullable=False)
    telefono = Column(String(10), nullable=False)
    tipo = Column(Integer, ForeignKey('SEGURIDAD.Tb_Tipos_usuario.id_tipo_usuario'), nullable=False)
    usuario = Column(String(65), unique=True, nullable=False)
    contrasenia = Column(String, nullable=True)
    ultimo_token = Column(String, nullable=True)
    fecha_token = Column(DateTime, nullable=True)
    estatus = Column(Integer, ForeignKey('SEGURIDAD.Tb_Usuarios_estatus.id_usuario_estatus'), default=1, nullable=False)

    tipo_usuario = relationship("TbTiposUsuario", back_populates="usuarios")
    estatus_usuario = relationship("TbUsuariosEstatus", back_populates="usuarios")

    def __repr__(self):
        return f"<TbUsuario(id_usuario={self.id_usuario}, nombre='{self.nombre}', usuario='{self.usuario}', estatus={self.estatus})>"
    
    # Método para verificar contraseñas (ejemplo con bcrypt)
    def check_password(self, password):
        return bcrypt.checkpw(password.encode(), self.password_hash.encode())
    
    # Retorno del id de usuario para Flask-Login
    def get_id(self):
        return str(self.id_usuario)