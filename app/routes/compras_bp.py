from flask import Blueprint, redirect, render_template, url_for
from flask_login import fresh_login_required, login_required

from forms.proveedor_form import ProveedorForm
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
    form = ProveedorForm()
    return render_template("modulos/compras/proveedores.html", form=form)

@compras_bp.route('/guardar_proveedor', methods=['POST'])
def guardar_proveedor():
    form = ProveedorForm()
    
    if form.validate_on_submit():
        # Lógica para guardar en la base de datos
        print(form.nombre.data)
        # return redirect(url_for('proveedores'))
    
    # Si hay errores, recarga la misma página
    # return render_template('modulos/compras/proveedores.html', form=form)
    return redirect(url_for('compras_bp.compras_index'))

# Pagina inicial del modulo de compras con el submodulo de insumos renderizado
@compras_bp.route("/compras/insumos")
@login_required
@fresh_login_required
def compras_insumos():
    return render_template("modulos/compras/insumos.html")

# Pagina inicial del modulo de compras con el submodulo de almacen renderizado
@compras_bp.route("/compras/almacen")
@login_required
@fresh_login_required
def compras_almacen():
    return render_template("modulos/compras/almacen.html")

# Pagina inicial del modulo de compras con el submodulo de compras renderizado
@compras_bp.route("/compras/compras")
@login_required
@fresh_login_required
def compras_compras():
    return render_template("modulos/compras/compras.html")