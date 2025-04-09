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


