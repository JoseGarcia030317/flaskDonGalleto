from core.classes.Tb_clientes import Cliente
from core.classes.Tb_usuarios import Modulo, TipoUsuario, TipoUsuarioModulo
import json
import bcrypt
from utils.connectiondb import DatabaseConnector

class ClienteCRUD:
    TIPO_USUARIO_CLIENTE = 7 # EN BASE A CATALOGOS
    ESTADO_ACTIVO = 1

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
            cliente = session.query(
                Cliente
                ).filter_by(
                    id_cliente=id_cliente, estatus=1
                ).first()
            
            modulos = session.query(Modulo).join(
                TipoUsuarioModulo,
                Modulo.id_modulo == TipoUsuarioModulo.id_modulo
            ).join(
                TipoUsuario,
                TipoUsuarioModulo.id_tipo_usuario == TipoUsuario.id_tipo_usuario
            ).filter(
                TipoUsuario.id_tipo_usuario == self.TIPO_USUARIO_CLIENTE
            ).all()

            cliente_dict = self._cliente_to_dict(cliente)
            cliente_dict["modules"] = [{
                "id_modulo": m.id_modulo, 
                "descripcion": m.descripcion, 
                "ruta": m.ruta, 
                "funcion": m.funcion
            } for m in modulos]
            cliente_dict["tipo_usuario"] = "Cliente"

            return cliente_dict

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
            cliente = session.query(Cliente).filter(Cliente.id_cliente==id_cliente).first()
            if cliente:
                for key, value in data.items():
                    if key != 'contrasenia':
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
            cliente = session.query(Cliente).filter(Cliente.id_cliente==id_cliente, Cliente.estatus==self.ESTADO_ACTIVO).first()
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
            clientes = session.query(Cliente).filter(Cliente.estatus==self.ESTADO_ACTIVO).all()
            return [self._cliente_to_dict(c) for c in clientes]

    def authenticate(self, email, plain_password):
        """
        Autentica a un cliente activo.
        Retorna el cliente como dict si la autenticación es correcta, o {} en caso contrario.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            # Se utiliza outerjoin para obtener el cliente aunque el registro en TipoUsuario sea nulo.
            cliente = session.query(Cliente, TipoUsuario).outerjoin(
                TipoUsuario,
                TipoUsuario.id_tipo_usuario == self.TIPO_USUARIO_CLIENTE
            ).filter(
                Cliente.correo == email, 
                Cliente.estatus == self.ESTADO_ACTIVO
            ).first()

            # Verificar que se haya obtenido el cliente
            if not cliente:
                return {}

            # Validar la contraseña
            if not bcrypt.checkpw(plain_password.encode('utf-8'), 
                                cliente.Cliente.contrasenia.encode('utf-8')):
                return {}

            # Consultar los módulos relacionados solo si el cliente es correcto
            modules = session.query(Modulo).join(
                TipoUsuarioModulo,
                Modulo.id_modulo == TipoUsuarioModulo.id_modulo
            ).join(
                TipoUsuario,
                TipoUsuarioModulo.id_tipo_usuario == TipoUsuario.id_tipo_usuario
            ).filter(
                TipoUsuario.id_tipo_usuario == self.TIPO_USUARIO_CLIENTE
            ).all()

            # Convertir el cliente a dict
            cliente_dict = self._cliente_to_dict(cliente.Cliente)
            # Si TipoUsuario es None, se asigna None al campo "tipo_usuario"
            cliente_dict["tipo_usuario"] = cliente.TipoUsuario.nombre if cliente.TipoUsuario else None
            cliente_dict["modules"] = [{
                "id_modulo": m.id_modulo,
                "descripcion": m.descripcion,
                "ruta": m.ruta,
                "funcion": m.funcion
            } for m in modules]

            return cliente_dict
