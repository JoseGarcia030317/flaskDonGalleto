from forms.login_form import LoginForm
from flask import Blueprint, flash, redirect, render_template, url_for, request
from flask_login import current_user, fresh_login_required, login_required, login_user, logout_user
from extensions import limiter
import copy
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
        autentication = log.autenticar_usuario(form.usuario.data, form.contrasenia.data)
        user_data = copy.deepcopy(autentication)
        user_data.pop("modules")
        user_data.pop("tipo_usuario")
        
        user = None
        # Se instancia el usuario como Cliente o Usuario según la presencia de "id_cliente"
        if user_data.get("id_cliente") is not None:
            user = Cliente(**user_data)
            user.tipo_usuario = autentication.get("tipo_usuario")
            user.modules = autentication.get("modules")
            endpoint = retornarUsuario(3) # main_page_bp.mp_cliente
        elif user_data.get("id_usuario") is not None:
            user = Usuario(**user_data)
            user.tipo_usuario = autentication.get("tipo_usuario")
            user.modules = autentication.get("modules")
            endpoint = retornarUsuario(user.tipo)

        if user:
            login_user(user, remember=form.remember_me.data)
            return redirect(url_for(endpoint))
            # return redirect(url_for('main_page_bp.mp_usuario'))
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
