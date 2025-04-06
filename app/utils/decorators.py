from functools import wraps
from flask import abort
from flask_login import current_user
from utils.utils import get_user_role

def role_required(*required_roles):
    """
    Verifica que el usuario autenticado tenga el rol requerido.
    Por ejemplo, para administrador required_role = 1, para vendedor = 2, para cliente = 3, para cocinero = 4, para vendedor = 5.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or current_user.tipo not in required_roles:
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def modulos_permitidos():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                abort(403)
            if current_user.tipo not in get_user_role():
                abort(403)
            return f(*args, **kwargs)
        return decorated_function
    return decorator