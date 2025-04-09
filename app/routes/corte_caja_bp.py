from flask import Blueprint, request
from flasgger.utils import swag_from


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
        return {
                "estatus": 200,
                "message": "Corte iniciado",
                "saldo_inicial": 1000,
                "id_usuario_inicio": 1,
                "nombre_usuario": "edgar123",
                "fecha": "2023-10-01",
                "hora": "10:00",
                "id_corte": 1
            }
 
    except Exception as e:
        return {"status": 500, "message": str(e)}, 500


@corte_caja_bp.route("/corte_caja/cerrar_caja", methods=['POST'])
def cerrar_caja():
    """
    Cierra la caja actual.
    """
    data = request.get_json()
    try:
        return {
                "estatus": 200,
                "message": "Corte Finalizado",
                "saldo_inicial": 1000,
                "saldo_final": 1500,
                "total_ventas": 500,
                "total_compras": 100,
                "saldo_final": 1400,
                "saldo_real": 1300,
                "saldo_diferencia": 100,
                "id_usuario_cierre": 1,
                "nombre_usuario": "edgar123",
                "fecha": "2023-10-01",
                "hora": "10:00",
                "id_corte": 1,
                "detalle_ventas": [
                    {
                        "clave_venta": "V001",
                        "monto_venta": 200,
                        "fecha_venta": "2023-10-01"
                    },
                    {
                        "clave_venta": "V002",
                        "monto_venta": 300,
                        "fecha_venta": "2023-10-01"
                    }
                ],
                "detalle_compras": [
                    {
                        "clave_compra": "C001",
                        "monto_compra": 200,
                        "fecha_compra": "2023-10-01"
                    },
                    {
                        "clave_compra": "C002",
                        "monto_compra": 300,
                        "fecha_compra": "2023-10-01"
                    }
                ]
            }
    except Exception as e:
        return {"status": 500, "message": str(e)}, 500