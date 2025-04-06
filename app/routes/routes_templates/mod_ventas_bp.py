from flask import Blueprint, render_template
from flask_login import fresh_login_required, login_required

from utils.decorators import role_required


mod_ventas_bp = Blueprint('mod_ventas_bp', __name__)

# Pagina inicial para el modulo de ventas
@mod_ventas_bp.route('/ventas')
@login_required
@fresh_login_required
@role_required(2)
def index_ventas():
    return render_template('modulos/ventas/index-ventas.html')

# Pagina inicial para el modulo de ventas con el submodulo de registro de ventas
@mod_ventas_bp.route('/ventas/registro-ventas')
@login_required
@fresh_login_required
@role_required(2)
def ventas_registro_venta():
    return render_template('modulos/ventas/registro-venta.html')

# Pagina inicial para el modulo de ventas con el submodulo de listado de ventas
@mod_ventas_bp.route('/ventas/listado-ventas')
@login_required
@fresh_login_required
@role_required(2)
def ventas_listado_ventas():
    return render_template('modulos/ventas/listado-ventas.html')

# Pagina inicial para el modulo de ventas con el submodulo de listado de pedidos
@mod_ventas_bp.route('/ventas/listado-pedidos')
@login_required
@fresh_login_required
@role_required(2)
def ventas_listado_venta():
    return render_template('modulos/ventas/listado-pedidos.html')

# Pagina inicial para el modulo de ventas con el submodulo de corte caja
@mod_ventas_bp.route('/ventas/corte-caja')
@login_required
@fresh_login_required
@role_required(2)
def ventas_corte_caja():
    return render_template('modulos/ventas/corte-caja.html')

# Pagina inicial para el modulo de ventas con el submodulo de solicitud de produccion
@mod_ventas_bp.route('/ventas/solicitud-produccion')
@login_required
@fresh_login_required
@role_required(2)
def ventas_solicitud_produccion():
    return render_template('modulos/ventas/solicitud-produccion.html')