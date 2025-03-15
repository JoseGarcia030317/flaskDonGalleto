from flask import Blueprint, request
from core.logic import proveedores as prov

prov_bp = Blueprint("prov_bp", __name__)


@prov_bp.route("/provedores/get_all_proveedores", methods=['GET'])
def get_all_proveedores():
    return prov.get_all_proveedores()

@prov_bp.route("/provedores/get_proveedor_byId", methods=['POST'])
def get_proveedor_byId():
    data = request.get_json()
    return prov.get_proveedor(data["id_proveedor"])

@prov_bp.route("/provedores/create_proveedor", methods=['POST'])
def create_proveedor():
    data = request.get_json()
    return prov.create_proveedor(data)


@prov_bp.route("/provedores/delete_proveedor", methods=['POST'])
def delete_proveedor():
    data = request.get_json()
    return prov.detele_proveedor(id_proveedor=data["id_proveedor"])


@prov_bp.route("/provedores/update_proveedor", methods=['POST'])
def update_proveedor():
    data = request.get_json()
    return prov.update_proveedor(data["id_proveedor"], data)