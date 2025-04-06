from flask import Flask, flash, jsonify, redirect, render_template, request, session, url_for
from flask_cors import CORS
from forms.login_form import LoginForm
from extensions import limiter
from flask_login import LoginManager, current_user, logout_user
from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect, CSRF, CSRFError
from config import Config
from flasgger import Swagger
from core.logic import login
from core.classes.Tb_usuarios import Usuario
from core.classes.Tb_clientes import Cliente

# Blueprints para renderizar HTML
from routes.routes_templates.auth import auth_bp
from routes.routes_templates.main_page_bp import main_page_bp
from routes.routes_templates.mod_compras_bp import mod_compras_bp
from routes.routes_templates.mod_dashboard_bp import mod_dashboard_bp
from routes.routes_templates.mod_galletas_bp import mod_galletas_bp
from routes.routes_templates.mod_horneados_bp import mod_horneados_bp
from routes.routes_templates.mod_mermas_bp import mod_mermas_bp
from routes.routes_templates.mod_portalCliente_bp import mod_portalCliente_bp
from routes.routes_templates.mod_seguridad_bp import mod_seguridad_bp
from routes.routes_templates.mod_ventas_bp import mod_ventas_bp
from routes.routes_templates.mod_landingpage_bp import mod_landingpage_bp

# Blueprints para comunicarse con la BD
from routes.proveedores_bp import prov_bp
from routes.insumos_bp import insumos_bp
from routes.unidad_bp import unidad_bp
from routes.clientes_bp import clientes_bp
from routes.mermas_bp import mermas_bp
from routes.dashboard_bp import dashboard_bp
from routes.galletas_bp import galletas_bp
from routes.compras_bp import compras_bp
from routes.usuario_bp import usuario_bp
from routes.almacen_bp import almacen_bp
from routes.horneado_bp import horneado_bp

# Inicializar extensiones de Flask
# db = SQLAlchemy()
login_manager = LoginManager()
# csrf = CSRFProtect()
swagger = Swagger()
# jwt = JWTManager()
cors = CORS()

# Inicializar la aplicacion con las configuraciones de .env
app = Flask(__name__)
app.config.from_object(Config)

# db.init_app(app)
login_manager.init_app(app)
# csrf.init_app(app)
swagger.init_app(app)
# jwt.init_app(app)
cors.init_app(app)
limiter.init_app(app)

# Definición de ruta para usuario no autenticados, cuando se inicia la aplicacion
login_manager.login_view = "mod_landingpage_bp.landing_page"
login_manager.session_protection = "strong"

# Headers de seguridad, restringue recursos externos, en
# este caso solo permite recursos de la aplicacion y
# los de Tailwind (CDN)
# Talisman(
#     app,
#     content_security_policy={
#         'default-src': "'self'",
#         'script-src': ["'self'", "https://cdn.tailwindcss.com"],
#         'style-src': ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"]
#     },
#     force_https=False
# )

# Registro de blueprints para renderizar HTML
app.register_blueprint(auth_bp)
app.register_blueprint(main_page_bp)
app.register_blueprint(mod_compras_bp)
app.register_blueprint(mod_dashboard_bp)
app.register_blueprint(mod_galletas_bp)
app.register_blueprint(mod_horneados_bp)
app.register_blueprint(mod_mermas_bp)
app.register_blueprint(mod_portalCliente_bp)
app.register_blueprint(mod_seguridad_bp)
app.register_blueprint(mod_ventas_bp)
app.register_blueprint(mod_landingpage_bp)

# Registro de blueprints para comunicarse con la BD
app.register_blueprint(prov_bp)
app.register_blueprint(insumos_bp)
app.register_blueprint(unidad_bp)
app.register_blueprint(clientes_bp)
app.register_blueprint(mermas_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(galletas_bp)
app.register_blueprint(compras_bp)
app.register_blueprint(usuario_bp)
app.register_blueprint(almacen_bp)
app.register_blueprint(horneado_bp)

# Ruta raíz de la aplicacion
@app.route("/")
def inicio():
    if not current_user.is_authenticated:
        return redirect(url_for('mod_landingpage_bp.landing_page'))
    else:
        if current_user.tipo == 1:
            return redirect(url_for("main_page_bp.mp_admin"))
        if current_user.tipo == 2:
            return redirect(url_for("main_page_bp.mp_vendedor"))
        if current_user.tipo == 3:
            return redirect(url_for("main_page_bp.mp_cliente"))
        if current_user.tipo == 4:
            return redirect(url_for("main_page_bp.mp_cocinero"))
        if current_user.tipo == 5:
            return redirect(url_for("main_page_bp.mp_almacenista"))

@app.before_request
def make_session_permanent():
    session.permanent = True

# Redirigir a login si no está autenticado
# @app.before_request
def check_authentication():
    if not current_user.is_authenticated and request.endpoint != login_manager.login_view and not request.path.startswith("/static"):
        return redirect(url_for(login_manager.login_view))

# Configurar Flask-Login
@login_manager.user_loader
def load_user(user_id):
    if user_id:
        user = None
        if user_id.startswith("usuario:"):
            user = Usuario(**login.get_user_by_id(user_id.split(":")[1]))
        elif user_id.startswith("cliente:"):
            user = Cliente(**login.get_cliente_by_id(user_id.split(":")[1]))
            user.tipo = 3
        return user
    return None

# Manejo de errores personalizados
# @app.errorhandler(CSRFError)
# def handle_csrf_error(e):
#     """Manejo de error CSRFError - Recurso no encontrado."""
#     return jsonify({"error": "Token CSRF inválido", "detalle": str(e)}), 400

@app.errorhandler(404)
def handle_404(error):
    """Manejo de error 404 - Recurso no encontrado."""
    return render_template('errores/404.html'), 404

@app.errorhandler(500)
def handle_500(error):
    """Manejo de error 500 - Error interno del servidor."""
    return jsonify({"code": 500, "error": "Internal server error"}), 500

@app.errorhandler(403)
def forbidden_error(e):
    logout_user()

    # Si el cliente pide algun JSON, devuelve JSON para que puedar una respuesta en el frontend
    if request.accept_mimetypes.accept_json:
        return jsonify({
            "error": "Acceso denegado",
            "message": "No tienes permisos para este recurso",
        }), 403

    # Si no, es una ruta normal que ha solicitado HTML
    flash("Tu sesión ha expirado o no tienes permisos. Vuelve a ingresar", "danger")
    return redirect(url_for('auth_bp.login'))
    # return jsonify({"error": "No puedes acceder a esa ruta, mejor vuelve."}), 403

@app.errorhandler(429)
def ratelimit_error(e):
    # Verificar si el error ocurrió en la ruta de login
    if request.path == url_for('auth_bp.login'):
        # Mostrar mensaje directamente sin redirección
        return render_template("errores/429.html"), 429
    else:
        # Cerrar sesión y redirigir al login si es otra ruta
        flash("Vuelve a iniciar sesión en unos momentos por favor", "danger")
        logout_user()
        return redirect(url_for('auth_bp.login'))

# @jwt.unauthorized_loader
# def unauthorized_response(callback):
#     return jsonify({
#         "error": "Token de autorización no proporcionado o inválido",
#         "mensaje": "Por favor, proporciona un token válido para acceder a este recurso."
#     }), 401

if __name__ == '__main__':
    app.run(debug=True)