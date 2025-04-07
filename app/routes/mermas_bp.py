from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user, fresh_login_required, login_required
from utils.decorators import modulos_permitidos
from core.logic import mermas

mermas_bp = Blueprint('mermas_bp', __name__)
__modulo_name__ = "MERMAS"

@mermas_bp.route("/mermas/get_all_mermas_insumos", methods=['GET'])
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def get_all_mermas_insumos():
    try:
        result = mermas.get_all_mermas_insumos()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@mermas_bp.route("/mermas/get_all_mermas_galletas", methods=['GET'])
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def get_all_mermas_galletas():
    try:
        result = mermas.get_all_mermas_galletas()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@mermas_bp.route("/mermas/get_merma_insumo", methods=['POST'])
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def get_merma_insumo():
    data = request.get_json()
    merma_id = data.get("id_merma")
    try:
        result = mermas.get_merma_insumo(merma_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@mermas_bp.route("/mermas/get_merma_galleta", methods=['POST'])
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def get_merma_galleta():
    data = request.get_json()
    merma_id = data.get("id_merma")
    try:
        result = mermas.get_merma_galleta(merma_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@mermas_bp.route("/mermas/create_merma", methods=['POST'])
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def create_merma():
    """
    Crea una nueva merma.
    Valida que en el JSON se incluya solo uno de los atributos insumo_id o galleta_id.
    """
    data = request.get_json()
    # Asigna el id del usuario actual; en producción se reemplaza current_user.id_usuario
    data["id_usuario_registro"] = 1  # current_user.id_usuario
    try:
        result = mermas.create_merma(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@mermas_bp.route("/mermas/update_merma", methods=['POST'])
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
def update_merma():
    """
    Actualiza una merma.
    Valida que en el JSON se incluya solo uno de los atributos insumo_id o galleta_id.
    """
    data = request.get_json()
    data["id_usuario_registro"] = 1  # current_user.id_usuario
    merma_id = data.get("id_merma")
    try:
        result = mermas.update_merma(merma_id, data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@mermas_bp.route("/mermas/delete_merma", methods=['POST'])
@login_required
@fresh_login_required
@modulos_permitidos(__modulo_name__)
#@swag_from('../docs/mermas/delete_mermas.yaml')
def delete_merma():
    data = request.get_json()
    data["id_usuario_registro"] = 1  # current_user.id_usuario
    merma_id = data.get("id_merma")
    try:
        result = mermas.delete_merma(merma_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
