from forms.login_form import LoginForm
from flask import Blueprint, flash, redirect, render_template, url_for, request
from flask_login import current_user, fresh_login_required, login_required, login_user, logout_user
from werkzeug.security import check_password_hash
from extensions import limiter

from core.logic import login as log
from models.DummyUser import DummyUser


auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("10/minute")
def login():
    if current_user.is_authenticated:
        return redirect(url_for("auth_bp.dashboard"))
    form = LoginForm()
    if form.validate_on_submit():
        usuario_valido = "pepe"
        contrasenia = "Pepe_1234"
        
        if usuario_valido == form.usuario.data and contrasenia == form.contrasenia.data:
            dummy_user = DummyUser(1,usuario_valido, 1)
            login_user(dummy_user, remember=form.remember_me.data)
            if dummy_user.tipo_usuario == 1:
                return redirect(url_for("main_page_bp.mp_admin"))
            elif dummy_user.tipo_usuario == 2:
                return redirect(url_for("main_page_bp.mp_vendedor"))
            elif dummy_user.tipo_usuario == 3:
                return redirect(url_for("main_page_bp.mp_cliente"))
        else:
            flash("Usuario o contraseña incorrectos", "danger")
    elif form.form_errors:
        flash("Hubo un error en el formulario, por favor intente de nuevo", "danger")
        
                # session = get_session()
        # try:
        #     user = session.query(TbUsuario).filter_by(usuario=form.usuario.data).first()
            
        #     if user and check_password_hash(user.contrasenia, form.contrasenia.data):
        #         login_user(user, remember=form.remember_me.data)
        #         return redirect(url_for('inicio'))
        #     else:
        #         flash('Usuario o contraseña incorrectos', 'danger')
        # except Exception as e:
        #     flash('Error al procesar la solicitud', 'danger')
        # finally:
        #     session.close()

    return render_template("auth/login.html", form=form)

@auth_bp.route("/dashboard", methods=['GET','POST'])
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