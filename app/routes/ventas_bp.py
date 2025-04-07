from flask import Blueprint, request, jsonify
from core.logic import ventas


ventas_bp = Blueprint('ventas_bp', __name__)


@ventas_bp.route("/ventas/guardar_venta", methods=['POST'])
def guardar_venta():
    data = request.get_json()
    return ventas.guardar_venta(data)

@ventas_bp.route("/ventas/get_all_tipo_venta", methods=['GET'])
def get_all_tipo_venta():
    try:
        return ventas.get_all_tipo_venta()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
