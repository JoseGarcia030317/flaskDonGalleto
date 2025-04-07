from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user
from utils.decorators import modulos_permitidos
from core.logic import galletas

galletas_bp = Blueprint('galletas_bp', __name__)
__modulo_name__ = "GALLETAS"


@galletas_bp.route("/galletas/create_galleta", methods=['POST'])
#@modulos_permitidos(__modulo_name__)
def create_galleta():
    """
    Crea una nueva galleta a partir de datos en JSON o diccionario.
    """
    try:
        data = request.get_json()
        return jsonify(galletas.create_galleta(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    
@galletas_bp.route("/galletas/update_galleta", methods=['POST'])
#@modulos_permitidos(__modulo_name__)
def update_galleta():
    """
    Actualiza una galleta existente a partir de datos en JSON o diccionario.
    """
    try:
        data = request.get_json()
        return jsonify(galletas.update_galleta(data["id_galleta"], data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@galletas_bp.route("/galletas/get_all_galletas", methods=['GET'])
#@modulos_permitidos(__modulo_name__)
def get_all_galletas():
    """
    Obtiene todas las galletas existentes.
    """
    try:
        return jsonify(galletas.get_all_galletas())
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@galletas_bp.route("/galletas/get_galleta_by_id", methods=['POST'])
#@modulos_permitidos(__modulo_name__)
def get_galleta_by_id():
    """
    Obtiene una galleta existente a partir de su ID.
    """
    try:
        data = request.get_json()
        return jsonify(galletas.get_galleta_by_id(data["id_galleta"]))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@galletas_bp.route("/galletas/delete_galleta", methods=['POST'])    
#@modulos_permitidos(__modulo_name__)
def delete_galleta():
    """
    Elimina una galleta existente a partir de su ID.
    """
    try:
        data = request.get_json()
        return jsonify(galletas.delete_galleta(data["id_galleta"]))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

