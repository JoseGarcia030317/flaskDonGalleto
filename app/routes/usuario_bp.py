from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user, fresh_login_required, login_required
from utils.decorators import role_required
from core.logic import usuarios

usuario_bp = Blueprint('usuario_bp', __name__)

@usuario_bp.route("/usuarios/create_user", methods=['POST'])
def create_user():
    """
    Crea una nuevo usuario a partir de datos en JSON o diccionario.
    """
    try:
        data = request.get_json()
        return jsonify(usuarios.create_user(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    
@usuario_bp.route("/usuarios/get_user_all", methods=['GET'])
def get_user_all():
    try:
        result = usuarios.get_user_all()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    
@usuario_bp.route("/usuarios/delete_user", methods=['POST'])
def delete_user():
    data = request.get_json()
    data["id_usuario_registro"] = 1  # current_user.id_usuario
    uduario_id = data.get("id_usuario")
    try:
        result = usuarios.delete_user(uduario_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    
@usuario_bp.route("/usuarios/get_all_tipo_usuarios", methods=['GET'])
def get_all_tipo_usuarios():
    try:
        result = usuarios.get_all_tipo_usuarios()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500 
    
@usuario_bp.route("/usuarios/get_tipo_usuario_by_id", methods=['POST'])
def get_tipo_usuario_by_id():
    data = request.get_json()
    id_tipo_usuario = data.get("id_tipo_usuario")
    return jsonify(usuarios.get_tipo_usuario_by_id(id_tipo_usuario))    
