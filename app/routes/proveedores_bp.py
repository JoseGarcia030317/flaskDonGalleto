from flask import Blueprint, jsonify, request
from flask_login import fresh_login_required, login_required
from utils.decorators import role_required
from flask_wtf.csrf import validate_csrf, ValidationError
from core.logic import proveedores as prov

prov_bp = Blueprint("prov_bp", __name__)


@prov_bp.route("/provedores/get_all_proveedores", methods=['GET'])
@login_required
@fresh_login_required
@role_required(1)
def get_all_proveedores():
    return prov.get_all_proveedores()


@prov_bp.route("/provedores/get_proveedor_byId", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def get_proveedor_byId():
    data = request.get_json()
    return prov.get_proveedor(data["id_proveedor"])


@prov_bp.route("/provedores/create_proveedor", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def create_proveedor():
    try:
        validate_csrf(request.headers.get('X-CSRFToken'))
    except ValidationError as e:
        return jsonify({'error': 'Token CSRF inválido', 'detalle': str(e)}), 400
    
    data = request.get_json()
    proveedor_data = prov.create_proveedor(data)

    response = jsonify({'success': True, 'proveedor': proveedor_data})
    response.headers['Content-Type'] = 'application/json'

    return response


@prov_bp.route("/provedores/delete_proveedor", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def delete_proveedor():
    data = request.get_json()
    return prov.detele_proveedor(id_proveedor=data["id_proveedor"])


@prov_bp.route("/provedores/update_proveedor", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def update_proveedor():
    data = request.get_json()
    return prov.update_proveedor(data["id_proveedor"], data)
