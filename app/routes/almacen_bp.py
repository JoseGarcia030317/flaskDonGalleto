from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user
from utils.decorators import role_required
from core.logic import compras

almacen_bp = Blueprint('almacen_bp', __name__)
