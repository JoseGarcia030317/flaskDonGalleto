from flask import Blueprint, render_template
from flask_login import fresh_login_required, login_required

from utils.decorators import modulos_permitidos, role_required


mod_horneados_bp = Blueprint('mod_horneados_bp', __name__)
__modulo_name__ = "HORNEADOS"

# Pagina inicial del modulo de horneados
@mod_horneados_bp.route('/horneados')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def index_horneados():
    return render_template('modulos/horneados/index-horneados.html')

# Pagina inicial del modulo de horneados con el submodulo de inventario de galletas
@mod_horneados_bp.route('/horneados/inventario-galletas')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def horneados_inventario_galletas():
    return render_template('modulos/horneados/inventario-galletas.html')

# Pagina inicial del modulo de horneados con el submodulo de produccion
@mod_horneados_bp.route('/horneados/produccion')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def horneados_produccion():
    return render_template('modulos/horneados/produccion.html')

@mod_horneados_bp.route('/horneados/solicitudes')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def horneados_solicitudes():
    return render_template('modulos/horneados/solicitudes.html')