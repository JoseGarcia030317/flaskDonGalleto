from flask import Blueprint, render_template
from flask_login import fresh_login_required, login_required

from utils.decorators import modulos_permitidos, role_required


mod_dashboard_bp = Blueprint('mod_dashboard_bp', __name__)
__modulo_name__ = "DASHBOARD"

# Pagina inicial del modulo de Dashboard
@mod_dashboard_bp.route('/dashboard')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def index_dashboard():
    return render_template('modulos/dashboard/index-dashboard.html')

# Pagina inicial del modulo de dashboard con el submodulo de corte de caja
@mod_dashboard_bp.route('/dashboard/corte-caja')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def dashboard_corte_caja():
    return render_template('modulos/dashboard/corte-caja.html')

# Pagina inicial del modulo de dashboard con el submodulo de grafica de producto mas vendidos
@mod_dashboard_bp.route('/dashboard/grafica-productos')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def dashboard_grafica_productos():
    return render_template('modulos/dashboard/grafica-productos.html')

# Pagina inicial del modulo de dashboard con el submodulo de grafica de presentaciones más vendidas
@mod_dashboard_bp.route('/dashboard/grafica-presentaciones')
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def dashboard_grafica_presentaciones():
    return render_template('modulos/dashboard/grafica-presentaciones.html')