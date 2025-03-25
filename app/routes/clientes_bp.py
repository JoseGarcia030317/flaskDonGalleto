from flask import Blueprint, request
from flask_login import fresh_login_required, login_required
from utils.decorators import role_required
from core.logic import clientes

clientes_bp = Blueprint('clientes_bp', __name__)


@clientes_bp.route("/clientes/get_all_clientes", methods=['GET'])
def get_all_clientes():
    return clientes.get_all_clients()

@clientes_bp.route("/clientes/create_client", methods=['POST'])
def create_client():
    data = request.get_json()
    return clientes.create_client(data)

@clientes_bp.route("/clientes/update_client", methods=['POST'])
def update_client():
    data = request.get_json()
    return clientes.update_client(data["id_cliente"], data)

@clientes_bp.route("/clientes/delete_client", methods=['POST'])
def delete_client():
    data = request.get_json()
    return clientes.delete_client(data["id_cliente"])

@clientes_bp.route("/clientes/get_client_id", methods=['POST'])
def get_client_id():
    data = request.get_json()
    return clientes.get_client_by_id(data["id_cliente"])