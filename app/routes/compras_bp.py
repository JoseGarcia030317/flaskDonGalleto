from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user
from utils.decorators import modulos_permitidos
from core.logic import compras

compras_bp = Blueprint('compras_bp', __name__)
__modulo_name__ = "COMPRAS"

@compras_bp.route("/compras/create_compra", methods=['POST'])
#@modulos_permitidos(__modulo_name__)
def create_compra():
    """
    Crea una nueva compra a partir de datos en JSON o diccionario.
    """
    try:
        data = request.get_json()
        return jsonify(compras.create_compra(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@compras_bp.route("/compras/update_compra", methods=['POST'])
#@modulos_permitidos(__modulo_name__)
def update_compra():
    """
    Actualiza una compra existente a partir de datos en JSON o diccionario.
    """
    try:
        data = request.get_json()
        return jsonify(compras.update_compra(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@compras_bp.route("/compras/delete_compra", methods=['POST'])
#@modulos_permitidos(__modulo_name__)
def delete_compra():
    """
    Elimina una compra existente.
    """
    try:
        data = request.get_json()
        return jsonify(compras.delete_compra(data["id_compra"]))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@compras_bp.route("/compras/list_compras", methods=['GET'])
#@modulos_permitidos(__modulo_name__)
def list_compras():
    """
    Obtiene todas las compras.
    """
    try:
        return jsonify(compras.list_compras())
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    
@compras_bp.route("/compras/get_compra", methods=['POST'])
#@modulos_permitidos(__modulo_name__)
def get_compra():
    """
    Obtiene una compra específica.
    """
    try:
        data = request.get_json()
        return jsonify(compras.get_compra(data["id_compra"]))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500


