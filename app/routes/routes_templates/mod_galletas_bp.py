from flask import Blueprint, render_template
from flask_login import fresh_login_required, login_required

from utils.decorators import modulos_permitidos, role_required


mod_galletas_bp = Blueprint('mod_galletas_bp', __name__)
__modulo_name__ = "GALLETAS"

# Pagina inicial del modulo de galletas
@mod_galletas_bp.route('/galletas')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def index_galletas():
    return render_template('modulos/galletas/index-galletas.html')

# Pagina inicial del modulo de galletas con el submodulo de productos
@mod_galletas_bp.route('/galletas/productos')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def galletas_productos():
    return render_template('modulos/galletas/productos.html')

# Pagina inicial del modulo de galletas con el submodulo de recetas
@mod_galletas_bp.route('/galletas/recetas')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def galletas_recetas():
    return render_template('modulos/galletas/recetas.html')