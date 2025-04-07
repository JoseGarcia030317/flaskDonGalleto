import json
import logging
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_insumos import InventarioInsumo
from core.classes.Tb_compras import Compra


logger = logging.getLogger(__name__)

class AlmacenCRUD:
    def guardar_inventario(self, id_compra: int, data: dict) -> dict:
        """
        Guarda el inventario de una compra.
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:

                for insumo in data["detalle"]:
                    insumo_id = insumo["insumo_id"]
                    cantidad = insumo["cantidad"]
                    fecha_caducidad = insumo["fecha_caducidad"]

                    inventario = InventarioInsumo(
                        insumo_id=insumo_id,
                        cantidad=cantidad,
                        fecha_caducidad=fecha_caducidad,
                        tipo_movimiento=1,
                        tipo_registro=1,
                        compra_id=id_compra,
                        id_estatus=1
                    )
                    session.add(inventario)
                
                compra = session.query(Compra).filter(Compra.id_compra == id_compra).first()
                compra.estatus = 2
                session.commit()

                return {"message": "Inventario guardado correctamente"}
        except Exception as e:
            logger.error("Error al guardar el inventario: %s", e)
            raise e from e

