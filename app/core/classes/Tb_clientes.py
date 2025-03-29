from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from flask_login import UserMixin
import bcrypt


Base = declarative_base()


class Cliente(UserMixin, Base):
    __tablename__ = 'Tb_Clientes'
    
    id_cliente = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(65), nullable=True)
    apellido_pat = Column(String(65), nullable=True)
    apellido_mat = Column(String(65), nullable=True)
    telefono = Column(String(15), nullable=False)
    empresa = Column(String(250), nullable=True)
    tipo = Column(Integer, nullable=False)
    correo = Column(String(65), nullable=False)
    contrasenia = Column(String(65), nullable=False)
    estatus = Column(Integer, nullable=False, default=1)
    
    def __init__(self, nombre, apellido_pat, apellido_mat, telefono, empresa, tipo, correo, contrasenia, estatus=1, id_cliente=None):
        self.nombre = nombre
        self.apellido_pat = apellido_pat
        self.apellido_mat = apellido_mat
        self.telefono = telefono
        self.empresa = empresa
        self.tipo = tipo
        self.correo = correo
        self.contrasenia = self.hash_password(contrasenia)
        self.estatus = estatus
        self.id_cliente = id_cliente

    def hash_password(self, password):
        """
        Encripta la contraseña utilizando bcrypt y retorna el hash en formato string.
        """
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        return hashed.decode('utf-8')
    
    def check_password(self, password):
        """
        Verifica si la contraseña en texto plano coincide con la contraseña encriptada almacenada.
        """
        return bcrypt.checkpw(password.encode('utf-8'), self.contrasenia.encode('utf-8'))

    def get_id(self):
        return str(self.id_cliente)