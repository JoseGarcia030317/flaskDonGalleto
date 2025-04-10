from datetime import datetime
import json
import logging
from datetime import datetime
from typing import List
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_corteCaja import CorteCaja, DetalleCorte
from core.classes.Tb_usuarios import Usuario
from flask_login import current_user
from sqlalchemy import text, desc, func

logger = logging.getLogger(__name__)

class CorteCajaCrud:
    """
    CRUD para CorteCaja.
    """
    def __response_cerrar_corte_caja(self, data: CorteCaja) -> dict:
        """
        Respuesta de la función cerrar_corte_caja.
        
        {
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
        """
        try:
            session = DatabaseConnector().get_session
            with session() as session:
                usuario = session.query(Usuario).filter_by(id_usuario=CorteCaja.id_usuario_cierre).first()
                detalleCorte = session.query(DetalleCorte).filter_by(id_corte=CorteCaja.id_corte).all()
                
                
        except Exception as e:
            logger.error(f"Error al cerrar el corte de caja: {e}", exc_info=True)
            raise
        
        
    def __response_iniciar_corte_caja(self, data: CorteCaja) -> dict:
        """
        Respuesta de la función iniciar_corte_caja.
        """
        try:
            session = DatabaseConnector().get_session
            with session() as session:
                usuario = session.query(Usuario).filter_by(id_usuario=data.id_usuario_inicio).first()
                if usuario:
                    return {
                        "estatus": 200,
                        "message": "Corte de caja creado correctamente",
                        "saldo_inicial": data.saldo_inicial,
                        "id_usuario_inicio": data.id_usuario_inicio,
                        "nombre_usuario_inicio": usuario.usuario,
                        "fecha_inicio": data.fecha_inicio,
                        "id_corte": data.id_corte
                    }
                else:
                    return {
                        "estatus": 404,
                        "message": "Usuario no encontrado"
                    }
        except Exception as e:
            logger.error(f"Error al crear el corte de caja: {e}", exc_info=True)
            raise
    
    def iniciar_corte_caja(self, data: dict) -> dict:
        """
        Inicia un nuevo corte de caja.
        
        Args:
            data (dict): Diccionario con los datos del corte de caja
            
        """
        session = DatabaseConnector().get_session
        try:
            with session() as session:
                # Crear el corte de caja
                corte_caja = CorteCaja(
                    id_usuario_inicio=current_user.id_usuario if current_user.is_authenticated else data["id_usuario"],
                    fecha_inicio=datetime.now(),
                    saldo_inicial=data["saldo_inicial"]
                )
                session.add(corte_caja)
                session.commit()
                
                return self.__response_iniciar_corte_caja(corte_caja)
        except Exception as e:
            logger.error(f"Error al crear el corte de caja: {e}", exc_info=True)
            raise
        
    def cerrar_corte_caja(self, data: dict) -> dict:
        """
        Cierra un corte de caja.
        se ejecuta el store procedure SP_cierre_caja para generar todo el proceso de cierre de caja, no
        sin antes validar que se esta intentando cerrar un corte de caja que no este cerrado y que dicha caja
        exista.
            
        """
        __status_corte_caja_cerrado_ = 2 # 2 es el estatus de corte de caja cerrado
        session = DatabaseConnector().get_session
        try:
            with session() as session:
                # Validar que el corte de caja no esté cerrado
                corte_caja = session.query(CorteCaja).filter_by(id_corte=data["id_corte"]).first()
                
                if not corte_caja:
                    return {
                        "estatus": 404,
                        "message": "Corte de caja no encontrado"
                    }
                elif corte_caja.estatus == __status_corte_caja_cerrado_:
                    return {
                        "estatus": 400,
                        "message": "El corte de caja ya está cerrado"
                    }
                else:
                    # Ejecutar el store procedure SP_cierre_caja
                    id_corte = data["id_corte"]
                    id_usuario_cierre = current_user.id_usuario if current_user.is_authenticated else data["id_usuario"]
                    saldo_real = data["saldo_real"]
                    fecha_cierre = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    
                    session.execute(
                        text("CALL SP_cierre_caja(:id_corte, :saldo_real, :fecha_cierre, :id_usuario_cierre )"),
                        {
                            "id_corte": id_corte,
                            "saldo_real": saldo_real,
                            "fecha_cierre": fecha_cierre,
                            "id_usuario_cierre": id_usuario_cierre
                        }
                    )
                    session.commit()
                    return  {
                        "estatus": 200,
                        "message": "El corte fue realizado con exito"
                    }
        except Exception as e:
            logger.error(f"Error al cerrar el corte de caja: {e}", exc_info=True)
            raise

    def get_all_corte_caja(self):
        session = DatabaseConnector().get_session
        try:
            with session() as session:
                query = session.query(
                    CorteCaja, 
                    Usuario
                    ).join(
                    Usuario, CorteCaja.id_usuario_inicio == Usuario.id_usuario
                    ).order_by(desc(CorteCaja.fecha_inicio)).limit(10)
                
                registros = query.all()

                rows_dict = []
                for obj in registros:
                    row_dict = {
                        "id_corte": obj.CorteCaja.id_corte,
                        "fecha_inicio": obj.CorteCaja.fecha_inicio.strftime('%Y-%m-%d %H:%M:%S') if obj.CorteCaja.fecha_inicio else None,
                        "fecha_fin": obj.CorteCaja.fecha_fin.strftime('%Y-%m-%d %H:%M:%S') if obj.CorteCaja.fecha_fin else None,
                        "saldo_inicial": float(obj.CorteCaja.saldo_inicial) if obj.CorteCaja.saldo_inicial is not None else None,
                        "saldo_final": float(obj.CorteCaja.saldo_final) if obj.CorteCaja.saldo_final is not None else None,
                        "saldo_real": float(obj.CorteCaja.saldo_real) if obj.CorteCaja.saldo_real is not None else None,
                        "saldo_diferencia": float(obj.CorteCaja.saldo_diferencia) if obj.CorteCaja.saldo_diferencia is not None else None,
                        "nombre_usuario_inicio": obj.Usuario.nombre + " " + obj.Usuario.apellido_pat + " " + obj.Usuario.apellido_mat,
                        "nombre_usuario_cierre": (
                            obj.Usuario.nombre + " " + obj.Usuario.apellido_pat + " " + obj.Usuario.apellido_mat
                            if obj.CorteCaja.fecha_fin else None
                        ),
                        "estatus": obj.CorteCaja.estatus
                    }
                    rows_dict.append(row_dict)

                return rows_dict
        except Exception as e:
            logger.error(f"Error al obtener los cortes de caja: {e}", exc_info=True)
            raise
        
        