from flask import Blueprint, render_template
from flask_login import current_user, fresh_login_required, login_required

from utils.decorators import role_required

main_page_bp = Blueprint("main_page_bp", __name__)

@main_page_bp.route("/admin", methods=['GET'])
@login_required
@fresh_login_required
@role_required(1)
def mp_admin():
    return render_template("main-page/main-page-admin.html", tipo_user='Administrador: ', user=current_user.usuario)

@main_page_bp.route("/vendedor",  methods=['GET'])
@login_required
@fresh_login_required
@role_required(2)
def mp_vendedor():
    return render_template("main-page/main-page-vendedor.html", tipo_user='Vendedor: ', user=current_user.usuario)

@main_page_bp.route("/cliente",  methods=['GET'])
@login_required
@fresh_login_required
@role_required(3)
def mp_cliente():
    return render_template("main-page/main-page-cliente.html", tipo_user='Cliente: ', user=current_user.correo)

@main_page_bp.route("/cocinero",  methods=['GET'])
@login_required
@fresh_login_required
@role_required(4)
def mp_cocinero():
    return render_template("main-page/main-page-cocinero.html", tipo_user='Cocinero: ', user=current_user.usuario)

@main_page_bp.route("/almacenista",  methods=['GET'])
@login_required
@fresh_login_required
@role_required(5)
def mp_almacenista():
    return render_template("main-page/main-page-almacenista.html", tipo_user='Almacenista: ', user=current_user.usuario)

@main_page_bp.route('/inicio', methods=['GET'])
@login_required
@fresh_login_required
def mp_usuario():
    modulos_usuario = current_user.modulos if hasattr(current_user, 'modulos') else []
    tipo_usuario = current_user.tipo if hasattr(current_user, 'tipo') else 'Usuario'
    return render_template("main-page/main-page-usuario.html", modulos = modulos_usuario, user={'tipo_usuario': tipo_usuario, 'nombre': current_user.usuario if hasattr(current_user, 'usuario') else current_user.correo})