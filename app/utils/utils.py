from flask_login import current_user
from flask import session

def get_roles_modules(modulo_name):
    """
    Devuelve los roles a los que el modulo les puede dar acceso.
    """
    if current_user.is_authenticated:
        for module in session["modules"]:
            if modulo_name.upper() == "PORTAL CLIENTE":
                return [3]

            if module["descripcion"].upper() == modulo_name.upper():
                return module["roles"]
    return None