from flask import Flask, jsonify, redirect, request, session, url_for
from flask_cors import CORS
from extensions import limiter
from flask_login import LoginManager, current_user
from flask_talisman import Talisman
from flask_wtf.csrf import CSRFProtect
from config import Config
from flasgger import Swagger
from models.DummyUser import DummyUser

# Blueprints
from app.routes.auth import auth_bp
from routes.proveedores_bp import prov_bp
from routes.compras_bp import compras_bp
from routes.main_page_bp import main_page_bp
from app.routes.auth import auth_bp

# Inicializar extensiones de Flask
# db = SQLAlchemy()
login_manager = LoginManager()
csrf = CSRFProtect()
swagger = Swagger()
# jwt = JWTManager()
cors = CORS()

# Inicializar la aplicacion con las configuraciones de .env
app = Flask(__name__)
app.config.from_object(Config)

# db.init_app(app)
login_manager.init_app(app)
csrf.init_app(app)
swagger.init_app(app)
# jwt.init_app(app)
cors.init_app(app)
limiter.init_app(app)

# Definición de ruta para usuario no autenticados, cuando se inicia la aplicacion
login_manager.login_view = "auth_bp.login"
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

# Registro de blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(main_page_bp)
app.register_blueprint(prov_bp)
app.register_blueprint(compras_bp)

# Ruta raíz de la aplicacion
@app.route("/")
def inicio():
    if not current_user.is_authenticated:
        return redirect(url_for('auth_bp.login'))
    else:
        if current_user.tipo_usuario == 1:
            return redirect(url_for("main_page_bp.mp_admin"))
        if current_user.tipo_usuario == 2:
            return redirect(url_for("main_page_bp.mp_vendedor"))
        if current_user.tipo_usuario == 3:
            return redirect(url_for("main_page_bp.mp_cliente"))

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
    if user_id == "1":
        return DummyUser(1, "pepe", 1)
    # session = get_session()
    # try:
    #     user = session.query(TbUsuario).get(int(user_id))
    #     return user
    # except Exception as e:
    #     return None
    # finally:
    #     session.close() 

# Manejo de errores personalizados
@app.errorhandler(404)
def handle_404(error):
    """Manejo de error 404 - Recurso no encontrado."""
    return jsonify({"code": 404, "error": "Resource not found"}), 404

@app.errorhandler(500)
def handle_500(error):
    """Manejo de error 500 - Error interno del servidor."""
    return jsonify({"code": 500, "error": "Internal server error"}), 500

@app.errorhandler(403)
def ratelimit_error(e):
    return jsonify({"error": "No puedes acceder a esa ruta, mejor vuelve."}), 403

@app.errorhandler(429)
def ratelimit_error(e):
    return jsonify({"error": "Demasiados intentos, intenta mas tarde."}), 429

# @jwt.unauthorized_loader
# def unauthorized_response(callback):
#     return jsonify({
#         "error": "Token de autorización no proporcionado o inválido",
#         "mensaje": "Por favor, proporciona un token válido para acceder a este recurso."
#     }), 401

if __name__ == '__main__':
    app.run(debug=True)
