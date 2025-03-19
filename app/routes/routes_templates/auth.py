from forms.login_form import LoginForm
from flask import Blueprint, flash, redirect, render_template, url_for, request
from flask_login import current_user, fresh_login_required, login_required, login_user, logout_user
from extensions import limiter

from core.logic import login as log
from core.classes.Tb_usuarios import Usuario


auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("10/minute")
def login():
    if current_user.is_authenticated:
        endpoint = retornarUsuario(current_user.tipo)
        return redirect(url_for(endpoint))

    form = LoginForm()
    if request.method == 'POST' and form.validate_on_submit():
        user_data = log.autenticar_usuario(
            form.usuario.data, form.contrasenia.data)
        if user_data.get('id_usuario') and user_data.get('usuario'):

            user = Usuario(**user_data)
            login_user(user, remember=form.remember_me.data)

            endpoint = retornarUsuario(user.tipo)
            return redirect(url_for(endpoint))
        else:
            flash("Usuario y/o contraseña incorrectos", "danger")

    if request.method == 'POST' and not form.validate_on_submit():
        flash("Hubo un error en el formulario, por favor intente de nuevo", "danger")

    return render_template("modulos/auth/login.html", form=form)

@auth_bp.route("/logout", methods=['GET'])
@login_required
@fresh_login_required
def logout():
    logout_user()
    return redirect(url_for('auth_bp.login'))


# funcion para autenticar usuario
@auth_bp.route("/test", methods=['POST'])
def test():
    data = request.get_json()
    return log.autenticar_usuario(data['usuario'], data['contrasenia'])


def retornarUsuario(tipo_usuario):
    if tipo_usuario == 1:
       return "main_page_bp.mp_admin"
    if tipo_usuario == 2:
       return "main_page_bp.mp_vendedor"
    if tipo_usuario == 3:
       return "main_page_bp.mp_cliente"
    if tipo_usuario == 4:
        return "main_page_bp.mp_cocinero"
    if tipo_usuario == 5:
        return "main_page_bp.mp_almacenista"