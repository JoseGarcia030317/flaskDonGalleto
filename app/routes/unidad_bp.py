from flask import Blueprint, request
from flask_login import fresh_login_required, login_required
from utils.decorators import  role_required
from core.logic import unidad

unidad_bp = Blueprint('unidad_bp', __name__)


@unidad_bp.route("/unidad/get_all_unidad", methods=['GET'])
@login_required
@fresh_login_required
def get_all_unidades():
    return unidad.get_all_unidades()

@unidad_bp.route("/unidad/get_unidad_byId", methods=['POST'])
@login_required
@fresh_login_required
def get_unidad_byId():
    data = request.get_json()
    return unidad.get_unidad(data.get('id_unidad'))

@unidad_bp.route("/unidad/create_unidad", methods=['POST'])
@login_required
@fresh_login_required
def create_unidad():
    data = request.get_json()
    return unidad.create_unidad(data)

@unidad_bp.route("/unidad/delete_unidad", methods=['POST'])
@login_required
@fresh_login_required
def delete_unidad():
    data = request.get_json()
    return unidad.delete_unidad(data.get('id_unidad'))

@unidad_bp.route("/unidad/update_unidad", methods=['POST'])
@login_required
@fresh_login_required
def update_unidad():
    data = request.get_json()
    return unidad.update_unidad(data.get('id_unidad'), data)