from flask import Blueprint, render_template
from flask_login import fresh_login_required, login_required

from utils.decorators import role_required


mod_seguridad_bp = Blueprint('mod_seguridad_bp', __name__)

# Pagina inicial del modulo de seguridad
@mod_seguridad_bp.route('/seguridad')
@login_required
@fresh_login_required
@role_required(1)
def index_seguridad():
    return render_template('modulos/seguridad/index-seguridad.html')

# Pagina inicial del modulo de seguridad con el submodulo de usuarios
@mod_seguridad_bp.route('/seguridad/usuarios')
@login_required
@fresh_login_required
@role_required(1)
def seguridad_usuarios():
    return render_template('modulos/seguridad/usuarios.html')

@mod_seguridad_bp.route('/seguridad/clientes')
@login_required
@fresh_login_required
@role_required(1)
def seguridad_clientes():
    return render_template('modulos/seguridad/clientes.html')