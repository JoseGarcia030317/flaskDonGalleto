from forms.login_form import LoginForm
from flask import Blueprint, flash, redirect, render_template, url_for, request
from flask_login import current_user, fresh_login_required, login_required, login_user, logout_user
from extensions import limiter

from core.logic import login as log
from core.classes.Tb_usuarios import Usuario
from core.classes.Tb_clientes import Cliente

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("10/minute")
def login():
    if current_user.is_authenticated:
        endpoint = retornarUsuario(current_user.tipo)   
        return redirect(url_for(endpoint))

    form = LoginForm()
    if request.method == 'POST' and form.validate_on_submit():
        user_data = log.autenticar_usuario(form.usuario.data, form.contrasenia.data)
        
        # Se instancia el usuario como Cliente o Usuario según la presencia de "id_cliente"
        if user_data.get("id_cliente") is not None:
            user = Cliente(**user_data)
            endpoint = retornarUsuario(3) # main_page_bp.mp_cliente
        else:
            user = Usuario(**user_data)
            endpoint = retornarUsuario(user.tipo)

        if user:
            login_user(user, remember=form.remember_me.data)
            return redirect(url_for(endpoint))
        else:
            flash("Usuario y/o contraseña incorrectos", "danger")
    
    elif request.method == 'POST':  # Caso en el que el formulario no pasa la validación
        flash("Hubo un error en el formulario, por favor intente de nuevo", "danger")

    return render_template("modulos/auth/login.html", form=form)


@auth_bp.route("/logout", methods=['GET'])
@login_required
@fresh_login_required
def logout():
    logout_user()
    return redirect(url_for('auth_bp.login'))


@auth_bp.route("/test", methods=['POST'])
def test():
    data = request.get_json()
    return log.autenticar_usuario(data['usuario'], data['contrasenia'])


def retornarUsuario(tipo_usuario):
    if tipo_usuario == 1:
        return "main_page_bp.mp_admin"
    elif tipo_usuario == 2:
        return "main_page_bp.mp_vendedor"
    elif tipo_usuario == 3:
        return "main_page_bp.mp_cliente"
    elif tipo_usuario == 4:
        return "main_page_bp.mp_cocinero"
    elif tipo_usuario == 5:
        return "main_page_bp.mp_almacenista"
