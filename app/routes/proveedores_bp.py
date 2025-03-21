from flask import Blueprint, request
from flask_login import fresh_login_required, login_required
from utils.decorators import role_required
from core.logic import proveedores as prov

prov_bp = Blueprint("prov_bp", __name__)

@prov_bp.route("/provedores/get_all_proveedores", methods=['GET'])
@login_required
@fresh_login_required
@role_required(5)
def get_all_proveedores():
    return prov.get_all_proveedores()

@prov_bp.route("/provedores/get_proveedor_byId", methods=['POST'])
@login_required
@fresh_login_required
@role_required(5)
def get_proveedor_byId():
    data = request.get_json()
    return prov.get_proveedor(data["id_proveedor"])

@prov_bp.route("/provedores/create_proveedor", methods=['POST'])
@login_required
@fresh_login_required
@role_required(5)
def create_proveedor():
    data = request.get_json()
    return prov.create_proveedor(data)

@prov_bp.route("/provedores/delete_proveedor", methods=['POST'])
@login_required
@fresh_login_required
@role_required(5)
def delete_proveedor():
    data = request.get_json()
    return prov.detele_proveedor(id_proveedor=data["id_proveedor"])

@prov_bp.route("/provedores/update_proveedor", methods=['POST'])
@login_required
@fresh_login_required
@role_required(5)
def update_proveedor():
    data = request.get_json()
    return prov.update_proveedor(data["id_proveedor"], data)