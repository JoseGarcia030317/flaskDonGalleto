from flask import Blueprint, render_template
from flask_login import current_user, fresh_login_required, login_required

from utils.decorators import modulos_permitidos, role_required

main_page_bp = Blueprint("main_page_bp", __name__)
__modulo_name__ = "MAIN PAGE"

# @main_page_bp.route("/admin", methods=['GET'])
# @login_required
# @fresh_login_required
# @modulos_permitidos(__modulo_name__)
# def mp_admin():
#     return render_template("main-page/main-page-admin.html", tipo_user='Administrador: ', user=current_user.usuario)

# @main_page_bp.route("/vendedor",  methods=['GET'])
# @login_required
# @fresh_login_required
# @modulos_permitidos(__modulo_name__)
# def mp_vendedor():
#     return render_template("main-page/main-page-vendedor.html", tipo_user='Vendedor: ', user=current_user.usuario)

# @main_page_bp.route("/cliente",  methods=['GET'])
# @login_required
# @fresh_login_required
# @modulos_permitidos(__modulo_name__)
# def mp_cliente():
#     return render_template("main-page/main-page-cliente.html", tipo_user='Cliente: ', user=current_user.correo)

# @main_page_bp.route("/cocinero",  methods=['GET'])
# @login_required
# @fresh_login_required
# @modulos_permitidos(__modulo_name__)
# def mp_cocinero():
#     return render_template("main-page/main-page-cocinero.html", tipo_user='Cocinero: ', user=current_user.usuario)

# @main_page_bp.route("/almacenista",  methods=['GET'])
# @login_required
# @fresh_login_required
# @modulos_permitidos(__modulo_name__)
# def mp_almacenista():
#     return render_template("main-page/main-page-almacenista.html", tipo_user='Almacenista: ', user=current_user.usuario)

@main_page_bp.route('/inicio', methods=['GET'])
@login_required
@fresh_login_required
def mp_usuario():
    print(f'\n {current_user.__dict__}')
    modulos_usuario = current_user.modules if hasattr(current_user, 'modules') else []
    tipo_usuario = current_user.tipo_usuario if hasattr(current_user, 'tipo_usuario') else 'Usuario'
    usuario = current_user.usuario if hasattr(current_user, 'usuario') else 'usuario'
    return render_template("main-page/main-page-usuario.html", modulos = modulos_usuario, user=tipo_usuario + ': ' + usuario)