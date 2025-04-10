from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user, fresh_login_required, login_required
from utils.decorators import modulos_permitidos
from core.logic import pedidos

pedidos_bp = Blueprint('pedidos_bp', __name__)
__modulo_name__ = "PORTAL CLIENTE"

@pedidos_bp.route('/pedidos/crear_pedido', methods=['POST'])
def crear_pedido():
    try:
        data = request.get_json()
        return jsonify(pedidos.crear_pedido(data))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500

@pedidos_bp.route('/pedidos/consultar_historial_pedidos', methods=['POST'])
def consultar_historial_pedidos():
    try:
        data = request.get_json()
        id_cliente = current_user.id_cliente if current_user.is_authenticated else data["id_cliente"]
        return jsonify(pedidos.consultar_historial_pedidos(id_cliente))
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500


@pedidos_bp.route('/pedidos/get_all_pedidos', methods=['GET'])
def get_all_pedidos():
    try:
        return jsonify(pedidos.get_all_pedidos())
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
