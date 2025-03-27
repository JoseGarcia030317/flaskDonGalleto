from flask import Blueprint, request
from flasgger.utils import swag_from
from flask_login import fresh_login_required, login_required
from utils.decorators import role_required
from core.logic import mermas

mermas_bp = Blueprint('mermas_bp', __name__)


@mermas_bp.route("/mermas/get_all_mermas", methods=['GET'])
@swag_from('../docs/mermas/get_all_mermas.yaml')
def get_all_mermas():
    return mermas.get_all_mermas()

@mermas_bp.route("/mermas/create_mermas", methods=['POST'])
@swag_from('../docs/mermas/create_mermas.yaml')
def create_mermas():
    data = request.get_json()
    return mermas.create_merma(data)

@mermas_bp.route("/mermas/update_mermas", methods=['POST'])
@swag_from('../docs/mermas/update_mermas.yaml')
def update_mermas():
    data = request.get_json()
    return mermas.update_merma(data["id_merma"], data)

@mermas_bp.route("/mermas/delete_merma", methods=['POST'])
@swag_from('../docs/mermas/delete_mermas.yaml')
def delete_merma():
    data = request.get_json()
    return mermas.delete_merma(data["id_merma"])

@mermas_bp.route("/mermas/get_mermas_id", methods=['POST'])
@swag_from('../docs/mermas/get_mermas_id.yaml')
def get_mermas_id():
    data = request.get_json()
    return mermas.get_merma(data["id_merma"])


