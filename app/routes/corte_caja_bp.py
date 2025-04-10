from flask import Blueprint, request
from flasgger.utils import swag_from
from core.logic import corte_caja


corte_caja_bp = Blueprint('corte_caja_bp', __name__)


@corte_caja_bp.route("/corte_caja/iniciar_caja", methods=['POST'])
def iniciar_caja():
    """
    Inicia una nueva caja.
    """
    data = request.get_json()
    # Aquí iría la lógica para iniciar la caja
    try:
        # Lógica para iniciar la caja
        return corte_caja.iniciar_corte_caja(data)
 
    except Exception as e:
        return {"status": 500, "message": str(e)}, 500


@corte_caja_bp.route("/corte_caja/cerrar_caja", methods=['POST'])
def cerrar_caja():
    """
    Cierra la caja actual.
    """
    data = request.get_json()
    try:
        return corte_caja.cerrar_corte_caja(data)
    except Exception as e:
        return {"status": 500, "message": str(e)}, 500