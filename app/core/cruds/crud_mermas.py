import json
import logging
from sqlalchemy import case
from core.classes.Tb_mermas import Merma, MotivoMerma, TipoMerma
from core.classes.Tb_insumos import InventarioInsumo, Insumo
from core.classes.Tb_galletas import InventarioGalleta, Galleta
from utils.connectiondb import DatabaseConnector

logger = logging.getLogger(__name__)

class MermaCRUD:
    # Listas de atributos permitidos
    ATTRIBUTES_MERMA = ["motivo", "tipo_merma", "observacion", "id_usuario_registro"]
    ATTRIBUTES_INSUMO = ["tipo_registro", "cantidad", "tipo_movimiento", "merma_id", "insumo_id"]
    ATTRIBUTES_GALLETA = ["tipo_registro", "cantidad", "tipo_movimiento", "merma_id", "galleta_id"]
    ATTRIBUTES_DONT_UPDATE = ["insumo_id", "galleta_id", "tipo_merma", "tipo_movimiento"]

    # Constantes para manejo de estados y tipos
    STATUS_ACTIVO = True
    STATUS_INACTIVO = False
    TIPO_MOVIMIENTO_INSUMO = 1
    TIPO_MOVIMIENTO_GALLETA = 2
    TIPO_REGISTRO_SALIDA = 0
    TIPO_REGISTRO_ENTRADA = 1

    @staticmethod
    def _filter_data(data: dict, allowed: list) -> dict:
        """Filtra y retorna solo las claves permitidas."""
        return {k: v for k, v in data.items() if k in allowed}

    @staticmethod
    def _update_attributes(instance, data: dict, allowed: list) -> None:
        """Actualiza los atributos de una instancia con los valores permitidos."""
        for key, value in data.items():
            if key in allowed and key not in MermaCRUD.ATTRIBUTES_DONT_UPDATE:
                setattr(instance, key, value)

    def _create_merma(self, data: dict, inventory_class, inventory_allowed: list, movimiento: int) -> dict:
        """
        Método auxiliar para crear una merma y su registro de inventario asociado.
        """
        merma = Merma(**self._filter_data(data, self.ATTRIBUTES_MERMA))
        inventario = inventory_class(**self._filter_data(data, inventory_allowed))
        inventario.tipo_registro = self.TIPO_REGISTRO_SALIDA  # Salida
        inventario.tipo_movimiento = movimiento

        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(merma)
                session.flush()  # Fuerza la asignación de merma.id_merma
                inventario.merma_id = merma.id_merma
                session.add(inventario)
                session.commit()
                return {"status": 201, "message": "Success", "id_merma": merma.id_merma}
            except Exception as e:
                session.rollback()
                logger.error("Error creating merma: %s", e)
                raise e

    def create_merma_insumo(self, merma_json: str | dict) -> dict:
        """
        Crea una nueva merma de insumo a partir de datos en JSON o diccionario.
        """
        data = json.loads(merma_json) if isinstance(merma_json, str) else merma_json
        data["tipo_merma"] = self.TIPO_MOVIMIENTO_INSUMO
        return self._create_merma(data, InventarioInsumo, self.ATTRIBUTES_INSUMO, self.TIPO_MOVIMIENTO_INSUMO)

    def create_merma_galleta(self, merma_json: str | dict) -> dict:
        """
        Crea una nueva merma de galleta a partir de datos en JSON o diccionario.
        """
        data = json.loads(merma_json) if isinstance(merma_json, str) else merma_json
        data["tipo_merma"] = self.TIPO_MOVIMIENTO_GALLETA
        return self._create_merma(data, InventarioGalleta, self.ATTRIBUTES_GALLETA, self.TIPO_MOVIMIENTO_GALLETA)

    def read_merma_insumo(self, id_merma: int) -> dict:
        """
        Recupera una merma de insumo por su id y la retorna como dict.
        Retorna {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            row = session.query(
                Merma.id_merma,
                Merma.observacion,
                Merma.fecha,
                Merma.id_usuario_registro,
                Merma.id_estatus,
                MotivoMerma.id_motivo_merma,
                MotivoMerma.descripcion.label('motivo_descripcion'),
                TipoMerma.id_tipo_merma,
                TipoMerma.descripcion.label('tipo_merma_descripcion'),
                InventarioInsumo.insumo_id,
                Insumo.nombre.label('insumo_descripcion'),
                InventarioInsumo.cantidad,
                InventarioInsumo.tipo_movimiento,
                case(
                    (InventarioInsumo.tipo_movimiento == self.TIPO_MOVIMIENTO_INSUMO, 'Merma'),
                    (InventarioInsumo.tipo_movimiento == 2, 'Horneado'),
                    (InventarioInsumo.tipo_movimiento == 3, 'Compra'),
                    else_='Movimiento no registrado'
                ).label('tipo_movimiento_descripcion'),
                InventarioInsumo.tipo_registro,
                case(
                    (InventarioInsumo.tipo_registro == self.TIPO_REGISTRO_SALIDA, 'Salida'),
                    (InventarioInsumo.tipo_registro == self.TIPO_REGISTRO_ENTRADA, 'Entrada'),
                    else_='Tipo de registro no valido'
                ).label('tipo_registro_descripcion'),
                InventarioInsumo.fecha.label('inventario_fecha'),
                case(
                    (Merma.id_estatus == self.STATUS_ACTIVO, 'Activo'),
                    else_='Inactivo'
                ).label('estatus_descripcion')
            ).join(
                MotivoMerma, Merma.motivo == MotivoMerma.id_motivo_merma
            ).join(
                TipoMerma, Merma.tipo_merma == TipoMerma.id_tipo_merma
            ).join(
                InventarioInsumo, Merma.id_merma == InventarioInsumo.merma_id
            ).join(
                Insumo, InventarioInsumo.insumo_id == Insumo.id_insumo
            ).filter(Merma.id_merma == id_merma, Merma.tipo_merma == self.TIPO_MOVIMIENTO_INSUMO).first()
            return dict(row._mapping) if row is not None else {}
    
    def read_merma_galleta(self, id_merma: int) -> dict:
        """
        Recupera una merma de galleta por su id y la retorna como dict.
        Retorna {} si no se encuentra.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            row = session.query(
                Merma.id_merma,
                Merma.observacion,
                Merma.fecha,
                Merma.id_usuario_registro,
                Merma.id_estatus,
                MotivoMerma.id_motivo_merma,
                MotivoMerma.descripcion.label('motivo_descripcion'),
                TipoMerma.id_tipo_merma,
                TipoMerma.descripcion.label('tipo_merma_descripcion'),
                InventarioGalleta.galleta_id,
                Galleta.nombre_galleta.label('galleta_descripcion'),
                InventarioGalleta.cantidad,
                InventarioGalleta.tipo_movimiento,
                case(
                    (InventarioGalleta.tipo_movimiento == self.TIPO_MOVIMIENTO_GALLETA, 'Merma'),
                    (InventarioGalleta.tipo_movimiento == 2, 'Horneado'),
                    (InventarioGalleta.tipo_movimiento == 3, 'Compra'),
                    else_='Movimiento no registrado'
                ).label('tipo_movimiento_descripcion'),
                InventarioGalleta.tipo_registro,
                case(
                    (InventarioGalleta.tipo_registro == self.TIPO_REGISTRO_SALIDA, 'Salida'),
                    (InventarioGalleta.tipo_registro == self.TIPO_REGISTRO_ENTRADA, 'Entrada'),
                    else_='Tipo de registro no valido'
                ).label('tipo_registro_descripcion'),
                case(
                    (Merma.id_estatus == self.STATUS_ACTIVO, 'Activo'),
                    else_='Inactivo'
                ).label('estatus_descripcion')
            ).join(
                MotivoMerma, Merma.motivo == MotivoMerma.id_motivo_merma
            ).join(
                TipoMerma, Merma.tipo_merma == TipoMerma.id_tipo_merma
            ).join(
                InventarioGalleta, Merma.id_merma == InventarioGalleta.merma_id
            ).join(
                Galleta, InventarioGalleta.galleta_id == Galleta.id_galleta
            ).filter(Merma.id_merma == id_merma, Merma.tipo_merma == self.TIPO_MOVIMIENTO_GALLETA).first()
            return dict(row._mapping) if row is not None else {}
      
    def _update_merma(self, id_merma: int, data: dict, inventory_class, inventory_allowed: list) -> dict:
        """
        Método auxiliar para actualizar una merma y su registro de inventario.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            merma = session.query(Merma).filter_by(id_merma=id_merma).first()
            if not merma:
                return {}
            inventory = session.query(inventory_class).filter_by(merma_id=id_merma).first()
            self._update_attributes(merma, data, self.ATTRIBUTES_MERMA)
            if inventory:
                self._update_attributes(inventory, data, inventory_allowed)
            try:
                session.commit()
            except Exception as e:
                session.rollback()
                logger.error("Error updating merma: %s", e)
                raise e
            return {"status": 200, "message": "Success", "id_merma": id_merma}

    def update_merma_insumo(self, id_merma: int, merma_json: str | dict) -> dict:
        """
        Actualiza una merma de insumo a partir de datos en JSON o diccionario.
        """
        data = json.loads(merma_json) if isinstance(merma_json, str) else merma_json
        data["tipo_merma"] = self.TIPO_MOVIMIENTO_INSUMO
        return self._update_merma(id_merma, data, InventarioInsumo, self.ATTRIBUTES_INSUMO)

    def update_merma_galleta(self, id_merma: int, merma_json: str | dict) -> dict:
        """
        Actualiza una merma de galleta a partir de datos en JSON o diccionario.
        """
        data = json.loads(merma_json) if isinstance(merma_json, str) else merma_json
        data["tipo_merma"] = self.TIPO_MOVIMIENTO_GALLETA
        return self._update_merma(id_merma, data, InventarioGalleta, self.ATTRIBUTES_GALLETA)

    def delete(self, id_merma: int) -> dict:
        """
        Realiza una eliminación lógica de una merma (marca como inactiva) y su registro de inventario asociado.
        Retorna {} si no se encuentra la merma.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            merma = session.query(Merma).filter_by(id_merma=id_merma, id_estatus=self.STATUS_ACTIVO).first()
            if not merma:
                return {}
            # Seleccionar el inventario según el tipo de merma
            if merma.tipo_merma == 1:
                inventory = session.query(InventarioInsumo).filter_by(merma_id=id_merma).first()
            elif merma.tipo_merma == 2:
                inventory = session.query(InventarioGalleta).filter_by(merma_id=id_merma).first()
            else:
                inventory = None
            try:
                merma.id_estatus = self.STATUS_INACTIVO
                if inventory:
                    inventory.id_estatus = self.STATUS_INACTIVO
                session.commit()
            except Exception as e:
                session.rollback()
                logger.error("Error deleting merma: %s", e)
                raise e
            return {"status": 200, "message": "Success", "id_merma": id_merma}

    def list_all_insumos(self) -> list:
        """
        Obtiene el listado completo de mermas de insumos activas.
        Retorna una lista vacía si no hay registros.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            query = session.query(
                Merma.id_merma,
                Merma.observacion,
                Merma.fecha,
                Merma.id_usuario_registro,
                Merma.id_estatus,
                MotivoMerma.id_motivo_merma,
                MotivoMerma.descripcion.label('motivo_descripcion'),
                TipoMerma.id_tipo_merma,
                TipoMerma.descripcion.label('tipo_merma_descripcion'),
                InventarioInsumo.insumo_id,
                Insumo.nombre.label('insumo_descripcion'),
                InventarioInsumo.cantidad,
                InventarioInsumo.tipo_movimiento,
                case(
                    (InventarioInsumo.tipo_movimiento == self.TIPO_MOVIMIENTO_INSUMO, 'Merma'),
                    (InventarioInsumo.tipo_movimiento == 2, 'Horneado'),
                    (InventarioInsumo.tipo_movimiento == 3, 'Compra'),
                    else_='Movimiento no registrado'
                ).label('tipo_movimiento_descripcion'),
                InventarioInsumo.tipo_registro,
                case(
                    (InventarioInsumo.tipo_registro == self.TIPO_REGISTRO_SALIDA, 'Salida'),
                    (InventarioInsumo.tipo_registro == self.TIPO_REGISTRO_ENTRADA, 'Entrada'),
                    else_='Tipo de registro no valido'
                ).label('tipo_registro_descripcion'),
                case(
                    (Merma.id_estatus == self.STATUS_ACTIVO, 'Activo'),
                    else_='Inactivo'
                ).label('estatus_descripcion')
            ).join(
                MotivoMerma, Merma.motivo == MotivoMerma.id_motivo_merma
            ).join(
                TipoMerma, Merma.tipo_merma == TipoMerma.id_tipo_merma
            ).join(
                InventarioInsumo, Merma.id_merma == InventarioInsumo.merma_id
            ).join(
                Insumo, InventarioInsumo.insumo_id == Insumo.id_insumo
            ).filter(Merma.id_estatus == self.STATUS_ACTIVO, Merma.tipo_merma == 1)
            result = query.all()
            return [dict(row._mapping) for row in result]

    def list_all_galletas(self) -> list:
        """
        Obtiene el listado completo de mermas de galletas activas.
        Retorna una lista vacía si no hay registros.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            query = session.query(
                Merma.id_merma,
                Merma.observacion,
                Merma.fecha,
                Merma.id_usuario_registro,
                Merma.id_estatus,
                MotivoMerma.id_motivo_merma,
                MotivoMerma.descripcion.label('motivo_descripcion'),
                TipoMerma.id_tipo_merma,
                TipoMerma.descripcion.label('tipo_merma_descripcion'),
                InventarioGalleta.galleta_id,
                Galleta.nombre_galleta.label('galleta_descripcion'),
                InventarioGalleta.cantidad,
                InventarioGalleta.tipo_movimiento,
                case(
                    (InventarioGalleta.tipo_movimiento == self.TIPO_MOVIMIENTO_GALLETA, 'Merma'),
                    (InventarioGalleta.tipo_movimiento == 2, 'Horneado'),
                    (InventarioGalleta.tipo_movimiento == 3, 'Compra'),
                    else_='Movimiento no registrado'
                ).label('tipo_movimiento_descripcion'),
                InventarioGalleta.tipo_registro,
                case(
                    (InventarioGalleta.tipo_registro == self.TIPO_REGISTRO_SALIDA, 'Salida'),
                    (InventarioGalleta.tipo_registro == self.TIPO_REGISTRO_ENTRADA, 'Entrada'),
                    else_='Tipo de registro no valido'
                ).label('tipo_registro_descripcion'),
                case(
                    (Merma.id_estatus == self.STATUS_ACTIVO, 'Activo'),
                    else_='Inactivo'
                ).label('estatus_descripcion')
            ).join(
                MotivoMerma, Merma.motivo == MotivoMerma.id_motivo_merma
            ).join(
                TipoMerma, Merma.tipo_merma == TipoMerma.id_tipo_merma
            ).join(
                InventarioGalleta, Merma.id_merma == InventarioGalleta.merma_id
            ).join(
                Galleta, InventarioGalleta.galleta_id == Galleta.id_galleta
            ).filter(Merma.id_estatus == self.STATUS_ACTIVO, Merma.tipo_merma == self.TIPO_MOVIMIENTO_GALLETA)
            result = query.all()
            return [dict(row._mapping) for row in result]
