from forms.login_form import LoginForm
from flask import Blueprint, flash, redirect, render_template, url_for, request
from flask_login import current_user, fresh_login_required, login_required, login_user, logout_user
from werkzeug.security import check_password_hash
from extensions import limiter

from core.logic import login as log
from core.classes.Tb_usuarios import Usuario
from models.DummyUser import DummyUser


auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("10/minute")
def login():
    if current_user.is_authenticated:
        return redirect(url_for("auth_bp.dashboard"))
    form = LoginForm()
    if request.method == 'POST' and form.validate_on_submit():
        user_data = log.autenticar_usuario(
            form.usuario.data, form.contrasenia.data)
        if user_data.get('usuario') and user_data.get('contrasenia'):
            user = Usuario(
                nombre=user_data['nombre'],
                apellido_pat=user_data['apellido_pat'],
                apellido_mat=user_data['apellido_mat'],
                telefono=user_data['telefono'],
                tipo=user_data['tipo'],
                usuario=user_data['usuario'],
                contrasenia=user_data['contrasenia'],
                estatus=user_data.get('estatus', 1),
                id_usuario=user_data['id_usuario']
            )
            login_user(user, remember=form.remember_me.data)
            if user.tipo == 1:
                return redirect(url_for("main_page_bp.mp_admin"))
            elif user.tipo == 2:
                return redirect(url_for("main_page_bp.mp_vendedor"))
            elif user.tipo == 3:
                return redirect(url_for("main_page_bp.mp_cliente"))
        else:
            flash("Usuario y/o contraseña incorrectos", "danger")
    elif form.form_errors:
        flash("Hubo un error en el formulario, por favor intente de nuevo", "danger")

    return render_template("modulos/auth/login.html", form=form)

@auth_bp.route("/dashboard", methods=['GET', 'POST'])
@login_required
@fresh_login_required
def dashboard():
    return "<h1>ya estas dentro</h1>"


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
