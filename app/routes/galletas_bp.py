from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user
from utils.decorators import role_required
from core.logic import galletas

galletas_bp = Blueprint('galletas_bp', __name__)

@galletas_bp.route("/galletas/create_galleta", methods=['POST'])
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
def update_galleta():
    """
    Actualiza una galleta existente a partir de datos en JSON o diccionario.
    """
    try:
        data = request.get_json()
        return jsonify(galletas.update_galleta(data["id_galleta"], data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

