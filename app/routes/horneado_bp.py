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
    
@horneado_bp.route("/horneado/get_horneado_by_id", methods=['GET'])
def get_horneado_by_id():
    """
    Obtiene un horneado por su ID.
    """
    try:
        data = request.get_json()
        return jsonify(horneado.get_horneado_by_id(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@horneado_bp.route("/horneado/crear_horneado", methods=['POST'])
def crear_horneado():
    """
    Crea un nuevo horneado.
    """
    try:
        data = request.get_json()
        return jsonify(horneado.crear_horneado(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@horneado_bp.route("/horneado/cancelar_horneado", methods=['POST'])
def cancelar_horneado():
    """
    Cancela un horneado.
    """
    try:
        data = request.get_json()
        return jsonify(horneado.cancelar_horneado(data.get("id_horneado")))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@horneado_bp.route("/horneado/solicitar_horneado", methods=['POST'])
def solicitar_horneado():
    """
    Cambia el estado de un horneado a solicitado.
    """
    try:
        data = request.get_json()
        return jsonify(horneado.solicitar_horneado(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@horneado_bp.route("/horneado/terminar_horneado", methods=['POST'])
def terminar_horneado():
    """
    Cambia el estado de un horneado a terminado.
    """
    try:
        data = request.get_json()
        return jsonify(horneado.terminar_horneado(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@horneado_bp.route("/horneado/rechazar_horneado", methods=['POST'])
def rechazar_horneado():
    """
    Rechaza un horneado.
    """
    try:
        data = request.get_json()
        return jsonify(horneado.rechazar_horneado(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500