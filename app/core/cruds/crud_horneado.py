import json
import logging
from utils.connectiondb import DatabaseConnector
from core.classes.Tb_horneado import Horneado
from core.classes.Tb_galletas import Receta, DetalleReceta
from core.classes.Tb_insumos import Insumo
from core.classes.Tb_catalogoUnidad import Unidad

logger = logging.getLogger(__name__)

class HorneadoCRUD:
    __STATUS_PROCESO__ = 1
    __STATUS_TERMINADO__ = 2
    __STATUS_CANCELADO__ = 3

    def get_all_horneados(self):
        """
        Obtiene todos los horneados activos junto con su receta e insumos asociados.
        Retorna una lista de diccionarios con la estructura requerida:
        [
            {
                "id_horneado": ...,
                "lote": ...,
                "receta": {
                    "id": ...,
                    "nombre": ...,
                    "tiempo": ...,
                    "cantidad": ...,
                    "insumos": [ ... ]
                },
                "fecha_horneado": "dd/mm/yyyy HH:MM",
                "estatus": "En proceso" | "Terminado" | "Cancelado"
            },
            ...
        ]
        """
        try:
            Session = DatabaseConnector().get_session
            with Session() as session:
                # Se obtienen todos los horneados que no estén cancelados
                horneados = session.query(Horneado).filter(Horneado.estatus != self.__STATUS_CANCELADO__).all()

                result = []
                estatus_map = {
                    self.__STATUS_PROCESO__: "En proceso",
                    self.__STATUS_TERMINADO__: "Terminado",
                    self.__STATUS_CANCELADO__: "Cancelado"
                }

                for horneado in horneados:
                    receta = session.query(Receta).filter(Receta.id_receta == horneado.receta_id).first()
                    detalleReceta = session.query(Insumo, DetalleReceta, Unidad).join(
                        DetalleReceta, Insumo.id_insumo == DetalleReceta.insumo_id
                    ).join(
                        Unidad, Insumo.unidad_id == Unidad.id_unidad
                    ).filter(DetalleReceta.receta_id == receta.id_receta).all()

                    insumos = [
                                {
                                'id_insumo': insumo.id_insumo, 
                                'nombre': insumo.nombre, 
                                'cantidad': detalle.cantidad,
                                'id_unidad': unidad.id_unidad,
                                'unidad': unidad.nombre
                                } for insumo, detalle, unidad in detalleReceta
                            ] if detalleReceta else []

                    fecha_formateada = (
                        horneado.fecha_horneado.strftime("%d/%m/%Y %H:%M")
                        if horneado.fecha_horneado else None
                    )

                    result.append({
                        "id_horneado": horneado.id_horneado,
                        "lote": horneado.lote,
                        "receta": {
                            "id": receta.id_receta,
                            "nombre": receta.nombre_receta,
                            "tiempo": receta.tiempo_horneado,
                            "cantidad": receta.galletas_producidas,
                            "insumos": insumos
                        },
                        "fecha_horneado": fecha_formateada,
                        "estatus": estatus_map.get(horneado.estatus, "Desconocido")
                    })

                return result

        except Exception as e:
            logger.error("Error al obtener los horneados: %s", e)
            raise e
