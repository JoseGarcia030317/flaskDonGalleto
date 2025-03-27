from core.classes.Tb_clientes import Cliente
import json
import bcrypt
from utils.connectiondb import DatabaseConnector

class ClienteCRUD:
    def _cliente_to_dict(self, cliente):
        """
        Convierte un objeto Cliente en un diccionario.
        Retorna {} si el cliente es None.
        """
        if not cliente:
            return {}
        return {
            "id_cliente": cliente.id_cliente,
            "nombre": cliente.nombre,
            "apellido_pat": cliente.apellido_pat,
            "apellido_mat": cliente.apellido_mat,
            "telefono": cliente.telefono,
            "empresa": cliente.empresa,
            "tipo": cliente.tipo,
            "correo": cliente.correo,
            "contrasenia": cliente.contrasenia,
            "estatus": cliente.estatus
        }
    
    def create(self, cliente_json):
        """
        Crea un nuevo cliente a partir de un JSON.
        La contraseña se encripta automáticamente en el modelo.
        """
        if isinstance(cliente_json, str):
            data = json.loads(cliente_json)
        else:
            data = cliente_json
        
        # El constructor del modelo se encarga de encriptar la contraseña.
        cliente = Cliente(**data)
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(cliente)
                session.commit()
                return self._cliente_to_dict(cliente)
            except Exception as e:
                session.rollback()
                raise e

    def read(self, id_cliente):
        """
        Recupera un cliente activo por su id, retornándolo como dict.
        Si no existe o no está activo, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            cliente = session.query(Cliente).filter_by(id_cliente=id_cliente, estatus=1).first()
            return self._cliente_to_dict(cliente)

    def update(self, id_cliente, cliente_json):
        """
        Actualiza los datos de un cliente activo a partir de un JSON.
        Si se actualiza la contraseña, se vuelve a encriptar.
        Retorna el cliente actualizado como dict o {} si no se encuentra.
        """
        if isinstance(cliente_json, str):
            data = json.loads(cliente_json)
        else:
            data = cliente_json
        
        Session = DatabaseConnector().get_session
        with Session() as session:
            cliente = session.query(Cliente).filter_by(id_cliente=id_cliente, estatus=1).first()
            if cliente:
                for key, value in data.items():
                    if key == 'contrasenia':
                        # Se vuelve a encriptar la contraseña usando el método del modelo.
                        value = cliente.hash_password(value)
                    setattr(cliente, key, value)
                try:
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._cliente_to_dict(cliente)

    def delete(self, id_cliente):
        """
        Realiza una baja lógica de un cliente por su id, cambiando el campo 'estatus' a 0.
        Retorna un dict con la información del cliente actualizado o {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            cliente = session.query(Cliente).filter_by(id_cliente=id_cliente, estatus=1).first()
            if cliente:
                try:
                    cliente.estatus = 0  # Baja lógica
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._cliente_to_dict(cliente)

    def list_all(self):
        """
        Obtiene el listado completo de clientes activos y los retorna como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            clientes = session.query(Cliente).filter_by(estatus=1).all()
            return [self._cliente_to_dict(c) for c in clientes]

    def authenticate(self, email, plain_password):
        """
        Autentica a un usuario activo.
        Retorna el usuario como dict si la autenticación es correcta, o {} en caso contrario.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            cliente = session.query(Cliente).filter_by(correo=email, estatus=1).first()
            
            if not cliente:
                return {}
            
            if not bcrypt.checkpw(plain_password.encode('utf-8'), cliente.contrasenia.encode('utf-8')):
                return {}
            
            return self._cliente_to_dict(cliente)