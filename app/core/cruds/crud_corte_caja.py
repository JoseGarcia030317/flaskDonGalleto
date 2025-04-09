from datetime import datetime
import json
import logging
from typing import List
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_corteCaja import CorteCaja
from core.classes.Tb_usuarios import Usuario
from flask_login import current_user

logger = logging.getLogger(__name__)

class CorteCajaCrud:
    """
    CRUD para CorteCaja.
    """
    
    def iniciar_corte_caja(self, data: dict) -> dict:
        """
        Inicia un corte de caja y guarda el registro en la base de datos.
        """
        # Se asume que get_session() es un método que retorna el sessionmaker.
        Session = DatabaseConnector().get_session()
        id_usuario = current_user.id_usuario if current_user.is_authenticated else data.get("id_usuario")
    
        try:
            with Session() as session:
                # Se busca el usuario
                user = session.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
                if not user:
                    raise Exception("Usuario no encontrado")
                
                # Se crea el registro del corte de caja
                corte_caja = CorteCaja(
                    saldo_inicial=data["saldo_inicial"],
                    id_usuario_inicio=id_usuario
                )
                session.add(corte_caja)
                session.commit()
                # Se refresca el objeto para obtener valores auto-generados (por ejemplo, id_corte, fecha_inicio)
                session.refresh(corte_caja)
            
            return {
                "estatus": 200,
                "message": "Corte iniciado",
                "saldo_inicial": data.get("saldo_inicial"),
                "id_usuario_inicio": corte_caja.id_usuario_inicio,
                "nombre_usuario": user.usuario,
                "fecha": corte_caja.fecha_inicio.strftime("%Y-%m-%d") if corte_caja.fecha_inicio else None,
                "hora": corte_caja.fecha_inicio.strftime("%H:%M") if corte_caja.fecha_inicio else None,
                "id_corte": corte_caja.id_corte
            }
        except Exception as e:
            logger.error("Error al iniciar corte de caja: %s", e)
            raise e
