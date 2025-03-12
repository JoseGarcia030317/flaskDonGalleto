from functools import wraps
from flask import abort
from flask_login import current_user

def role_required(required_role):
    """
    Verifica que el usuario autenticado tenga el rol requerido.
    Por ejemplo, para administrador required_role = 1, para vendedor = 2, para cliente = 3.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated or current_user.tipo_usuario != required_role:
                abort(403)  # O puedes redirigir a una página de error personalizada
            return f(*args, **kwargs)
        return decorated_function
    return decorator