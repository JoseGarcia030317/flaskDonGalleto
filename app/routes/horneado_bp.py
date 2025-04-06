from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user
from utils.decorators import role_required
from core.logic import horneado

horneado_bp = Blueprint('horneado_bp', __name__)

@horneado_bp.route("/horneado/list_horneados", methods=['GET'])
def list_horneados():
    """
    Obtiene todos los horneados activos.
    """
    try:
        return jsonify(horneado.list_horneados())
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500