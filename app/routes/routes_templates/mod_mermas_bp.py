from flask import Blueprint, render_template
from flask_login import fresh_login_required, login_required

from utils.decorators import role_required


mod_mermas_bp = Blueprint('mod_mermas_bp', __name__)

# Pagina inicial del modulo de mermas
@mod_mermas_bp.route('/mermas')
@login_required
@fresh_login_required
@role_required(4,5)
def index_mermas():
    return render_template('modulos/mermas/index-mermas.html')

# Pagina inicial del modulo de mermas con el submodulo de mermas de producto
@mod_mermas_bp.route('/mermas/merma-producto')
@login_required
@fresh_login_required
@role_required(4,5)
def merma_producto():
    return render_template('modulos/mermas/merma-producto.html')

# Pagina inicial del modulo de mermas con el submodulo de mermas de insumo
@mod_mermas_bp.route('/mermas/merma-insumo')
@login_required
@fresh_login_required
@role_required(4,5)
def merma_insumo():
    return render_template('modulos/mermas/merma-insumo.html')