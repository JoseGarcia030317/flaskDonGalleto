from flask import Blueprint, render_template
from flask_login import fresh_login_required, login_required

from utils.decorators import role_required


mod_horneados_bp = Blueprint('mod_horneados_bp', __name__)

# Pagina inicial del modulo de horneados
@mod_horneados_bp.route('/horneados')
@login_required
@fresh_login_required
@role_required(4)
def index_horneados():
    return render_template('modulos/horneados/index-horneados.html')

# Pagina inicial del modulo de horneados con el submodulo de inventario de galletas
@mod_horneados_bp.route('/horneados/inventario-galletas')
@login_required
@fresh_login_required
@role_required(4)
def horneados_inventario_galletas():
    return render_template('modulos/horneados/inventario-galletas.html')

# Pagina inicial del modulo de horneados con el submodulo de produccion
@mod_horneados_bp.route('/horneados/produccion')
@login_required
@fresh_login_required
@role_required(4)
def horneados_produccion():
    return render_template('modulos/horneados/produccion.html')