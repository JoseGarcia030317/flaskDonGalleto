from flask import Blueprint, render_template 
from flask_login import fresh_login_required, login_required

from utils.decorators import modulos_permitidos, role_required

mod_compras_bp = Blueprint("mod_compras_bp", __name__)
__modulo_name__ = "COMPRAS"

# Pagina inicial del modulo de compras
@mod_compras_bp.route("/compras")
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def compras_index():
    return render_template("modulos/compras/index-compra.html")

# Pagina inicial del modulo de compras con el submodulo de proveedores renderizado
@mod_compras_bp.route("/compras/proveedores")
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def compras_proveedores():
    return render_template("modulos/compras/proveedores.html")

# Pagina inicial del modulo de compras con el submodulo de insumos renderizado
@mod_compras_bp.route("/compras/insumos")
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def compras_insumos():
    return render_template("modulos/compras/insumos.html")

# Pagina inicial del modulo de compras con el submodulo de almacen renderizado
@mod_compras_bp.route("/compras/almacen")
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def compras_almacen():
    return render_template("modulos/compras/almacen.html")

# Pagina inicial del modulo de compras con el submodulo de compras renderizado
@mod_compras_bp.route("/compras/compras")
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def compras_compras():
    return render_template("modulos/compras/compras.html")