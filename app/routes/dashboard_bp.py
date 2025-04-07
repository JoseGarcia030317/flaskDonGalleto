from flask import Blueprint, request, jsonify
from flasgger.utils import swag_from
from flask_login import current_user
from utils.decorators import modulos_permitidos
from core.logic import dashboard

dashboard_bp = Blueprint('dashboard_bp', __name__)
__modulo_name__ = "DASHBOARD"

@dashboard_bp.route("/dashboard/get_daily_sales", methods=['GET'])
@modulos_permitidos(__modulo_name__)
def get_daily_sales():
    try:
        result = dashboard.get_daily_sales()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    

@dashboard_bp.route("/dashboard/best_selling_product", methods=['GET'])
@modulos_permitidos(__modulo_name__)
def best_selling_product():
    try:
        result = dashboard.best_selling_product()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    
@dashboard_bp.route("/dashboard/best_selling_presentations", methods=['GET'])
@modulos_permitidos(__modulo_name__)
def best_selling_presentations():
    try:
        result = dashboard.best_selling_presentations()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    
@dashboard_bp.route("/dashboard/cost_per_cookie", methods=['GET'])
@modulos_permitidos(__modulo_name__)
def cost_per_cookie():
    try:
        result = dashboard.cost_per_cookie()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500
    
@dashboard_bp.route("/dashboard/profit_margin", methods=['GET'])
@modulos_permitidos(__modulo_name__)
def profit_margin():
    try:
        result = dashboard.profit_margin()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": 500, "message": str(e)}), 500