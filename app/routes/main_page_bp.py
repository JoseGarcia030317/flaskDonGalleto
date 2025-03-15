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
    return render_template("main-page/main-page-cliente.html", tipo_user='Cliente: ', user=current_user.usuario)