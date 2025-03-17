from flask import Blueprint, request
from flask_login import fresh_login_required, login_required
from utils.decorators import role_required
from core.logic import insumos

insumos_bp = Blueprint('insumos_bp', __name__)

@insumos_bp.route("/insumos/get_all_insumos", methods=['GET'])
@login_required
@fresh_login_required
@role_required(1)
def get_all_insumos():
    return insumos.get_all_insumos()

@insumos_bp.route("/insumos/get_all_insumos_unidad", methods=['GET'])
@login_required
@fresh_login_required
@role_required(1)
def get_all_insumos_unidad():
    return insumos.get_all_insumos_unidad()

@insumos_bp.route("/insumos/get_insumo_byId", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def get_insumo_byId():
    data = request.get_json()
    return insumos.get_insumo(data.get('id_insumo'))

@insumos_bp.route("/insumos/get_insumo_unidad_byId", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def get_insumo_unidad_byId():
    data = request.get_json()
    return insumos.get_insumo_unidad(data.get('id_insumo'))

@insumos_bp.route("/insumos/create_insumo", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def create_insumo():
    data = request.get_json()
    return insumos.create_insumo(data)

@insumos_bp.route("/insumos/delete_insumo", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def delete_insumo():
    data = request.get_json()
    return insumos.delete_insumo(id=data.get('id_insumo'))

@insumos_bp.route("/insumos/update_insumo", methods=['POST'])
@login_required
@fresh_login_required
@role_required(1)
def update_insumo():
    data = request.get_json()
    return insumos.update_insumo(data.get('id_insumo'), data)