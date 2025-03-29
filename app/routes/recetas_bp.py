from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user
from utils.decorators import role_required
from core.logic import recetas

recetas_bp = Blueprint('recetas_bp', __name__)

@recetas_bp.route("/recetas/get_all_recetas", methods=['GET'])
def get_all_recetas():
    try:
        result = recetas.get_all_recetas()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@recetas_bp.route("/recetas/get_all_recetas_galletas", methods=['GET'])
def get_all_recetas_galletas():
    try:
        result = recetas.get_all_recetas_galletas()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@recetas_bp.route("/recetas/get_receta_insumo", methods=['POST'])
def get_receta_insumo():
    data = request.get_json()
    receta_id = data.get("id_receta")
    try:
        result = recetas.get_receta_insumo(receta_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@recetas_bp.route("/recetas/get_receta_galleta", methods=['POST'])
def get_receta_galleta():
    data = request.get_json()
    receta_id = data.get("id_receta")
    try:
        result = recetas.get_receta_galleta(receta_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@recetas_bp.route("/recetas/create_receta", methods=['POST'])
def create_receta():
    """
    Crea una nueva receta.
    Valida que en el JSON se incluya solo uno de los atributos insumo_id o galleta_id.
    """
    data = request.get_json()
    # Asigna el id del usuario actual; en producción se reemplaza current_user.id_usuario
    data["id_usuario_registro"] = 1  # current_user.id_usuario
    try:
        result = recetas.create_receta(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@recetas_bp.route("/recetas/update_receta", methods=['POST'])
def update_receta():
    """
    Actualiza una receta.
    Valida que en el JSON se incluya solo uno de los atributos insumo_id o galleta_id.
    """
    data = request.get_json()
    data["id_usuario_registro"] = 1  # current_user.id_usuario
    receta_id = data.get("id_receta")
    try:
        result = recetas.update_receta(receta_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@recetas_bp.route("/recetas/delete_receta", methods=['POST'])
#@swag_from('../docs/mermas/delete_mermas.yaml')
def delete_receta():
    data = request.get_json()
    data["id_usuario_registro"] = 1  # current_user.id_usuario
    receta_id = data.get("id_receta")
    try:
        result = recetas.delete_receta(receta_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
