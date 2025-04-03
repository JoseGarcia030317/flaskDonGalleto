from flask import Blueprint, render_template
from flask_login import fresh_login_required, login_required

from utils.decorators import role_required


mod_portalCliente_bp = Blueprint('mod_portalCliente_bp', __name__)

# Pagina inicial del modulo portal del cliente
@mod_portalCliente_bp.route('/portalInicio')
@login_required
@fresh_login_required
@role_required(3)
def index_portal_cliente():
    return render_template('modulos/portalCliente/portal-inicio.html')

# Pagina inicial del modulo portal del cliente con el submodulo de pedidos
@mod_portalCliente_bp.route('/carrito')
@login_required
@fresh_login_required
@role_required(3)
def portal_cliente_pedidos():
    return render_template('modulos/portalCliente/carrito.html')

# Pagina inicial del modulo portal del cliente con el submodulo de historial de pedidos
@mod_portalCliente_bp.route('/historial-pedidos')
@login_required
@fresh_login_required
@role_required(3)
def portal_cliente_historial_pedidos():
    return render_template('modulos/portalCliente/historial-pedidos.html')