from flask import Blueprint, render_template 
from flask_login import fresh_login_required, login_required
from flask_wtf.csrf import generate_csrf

from utils.decorators import role_required

compras_bp = Blueprint("compras_bp", __name__)

# Pagina inicial del modulo de compras
@compras_bp.route("/compras")
@login_required
@fresh_login_required
def compras_index():
    return render_template("modulos/compras/index-compra.html")

# Pagina inicial del modulo de compras con el submodulo de proveedores renderizado
@compras_bp.route("/compras/proveedores")
@login_required
@fresh_login_required
def compras_proveedores():
    return render_template("modulos/compras/proveedores.html")

# Pagina inicial del modulo de compras con el submodulo de insumos renderizado
@compras_bp.route("/compras/insumos")
@login_required
@fresh_login_required
def compras_insumos():
    csrf_token = generate_csrf()
    return render_template("modulos/compras/insumos.html", csrf_token=csrf_token)

# Pagina inicial del modulo de compras con el submodulo de almacen renderizado
@compras_bp.route("/compras/almacen")
@login_required
@fresh_login_required
def compras_almacen():
    csrf_token = generate_csrf()
    return render_template("modulos/compras/almacen.html", csrf_token=csrf_token)

# Pagina inicial del modulo de compras con el submodulo de compras renderizado
@compras_bp.route("/compras/compras")
@login_required
@fresh_login_required
def compras_compras():
    csrf_token = generate_csrf()
    return render_template("modulos/compras/compras.html", csrf_token=csrf_token)