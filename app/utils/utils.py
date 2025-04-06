from flask_login import current_user

def get_user_role():
    """
    Devuelve el rol del usuario actual.
    """
    if current_user.is_authenticated:
        roles = []
        for module in current_user.modules:
            r = module.get("roles", [])
            if isinstance(r, list):
                roles.extend(r)
            elif isinstance(r, int):
                roles.append(r)
        # Eliminar duplicados
        roles = list(set(roles))
        return roles
    return None