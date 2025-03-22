from flask_login import UserMixin


class DummyUser(UserMixin):
    def __init__(self, id, username, tipo_usuario):
        self.id = id
        self.username = username
        self.tipo_usuario = tipo_usuario