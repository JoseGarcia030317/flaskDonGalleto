from flask import Blueprint, render_template 
from flask_login import fresh_login_required, login_required

from utils.decorators import role_required

compras_bp = Blueprint("compras_bp", __name__)

# Pagina inicial del modulo de compras
@compras_bp.route("/compras")
@login_required
@fresh_login_required
@role_required(1)
def compras_index():
    return render_template("modulos/compras/index-compra.html")

# Pagina inicial del modulo de compras con el submodulo de proveedores renderizado
@compras_bp.route("/compras/proveedores")
@login_required
@fresh_login_required
@role_required(1)
def compras_proveedores():
    return render_template("modulos/compras/proveedores.html")

# Pagina inicial del modulo de compras con el submodulo de insumos renderizado
@compras_bp.route("/compras/insumos")
@login_required
@fresh_login_required
@role_required(1)
def compras_insumos():
    return render_template("modulos/compras/insumos.html")

# Pagina inicial del modulo de compras con el submodulo de almacen renderizado
@compras_bp.route("/compras/almacen")
@login_required
@fresh_login_required
@role_required(1)
def compras_almacen():
    return render_template("modulos/compras/almacen.html")

# Pagina inicial del modulo de compras con el submodulo de compras renderizado
@compras_bp.route("/compras/compras")
@login_required
@fresh_login_required
@role_required(1)
def compras_compras():
    return render_template("modulos/compras/compras.html")