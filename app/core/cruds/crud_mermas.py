from core.classes.Tb_mermas import Merma, MotivoMerma, TipoMerma
import json
from utils.connectiondb import DatabaseConnector

class MermaCRUD:
    def _merma_to_dict(self, merma):
        """
        Convierte un objeto Merma en un diccionario.
        Retorna {} si el merma es None.
        """
        if not merma:
            return {}
        return {
            "id_merma": merma.id_merma,
            "motivo": merma.motivo_descripcion,
            "tipo_merma": merma.tipo_merma_descripcion,
            "observacion": merma.observacion,
            "fecha": merma.fecha.isoformat() if merma.fecha else None,
            "id_usuario_registro": merma.id_usuario_registro,
            "id_estatus": merma.id_estatus
        }

    def create(self, merma_json):
        """
        Crea una nueva merma a partir de un JSON.
        """
        if isinstance(merma_json, str):
            data = json.loads(merma_json)
        else:
            data = merma_json

        merma = Merma(**data)

        Session = DatabaseConnector().get_session
        with Session() as session:
            try:
                session.add(merma)
                session.commit()
                return self._merma_to_dict(merma)
            except Exception as e:
                session.rollback()
                raise e

    def read(self, id_merma):
        """
        Recupera una merma por su id, retornándola como dict.
        Si no existe, retorna {}.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            merma = session.query(
                Merma.id_merma,
                Merma.observacion,
                Merma.fecha,
                Merma.id_usuario_registro,
                Merma.id_estatus,
                MotivoMerma.descripcion.label('motivo_descripcion'),
                TipoMerma.descripcion.label('tipo_merma_descripcion')
                ).join(
                    MotivoMerma, Merma.motivo == MotivoMerma.id_motivo_merma
                ).join(
                    TipoMerma, Merma.tipo_merma == TipoMerma.id_tipo_merma
                ).filter(Merma.id_merma == id_merma).first()
            return self._merma_to_dict(merma)

    def update(self, id_merma, merma_json):
        """
        Actualiza los datos de una merma a partir de un JSON.
        Retorna la merma actualizada como dict o {} si no se encuentra.
        """
        if isinstance(merma_json, str):
            data = json.loads(merma_json)
        else:
            data = merma_json

        Session = DatabaseConnector().get_session
        with Session() as session:
            merma = session.query(Merma).filter_by(id_merma=id_merma).first()
            if merma:
                for key, value in data.items():
                    setattr(merma, key, value)
                try:
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._merma_to_dict(merma)

    def delete(self, id_merma):
        """
        Realiza una eliminación lógica de una merma por su id (marca como inactiva).
        Retorna un dict con la información de la merma o {} si no existe.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            merma = session.query(Merma).filter_by(id_merma=id_merma, id_estatus=True).first()
            if merma:
                try:
                    merma.id_estatus = False
                    session.commit()
                except Exception as e:
                    session.rollback()
                    raise e
            return self._merma_to_dict(merma) if merma else {}


    def list_all(self):
        """
        Obtiene el listado completo de mermas y las retorna como lista de dicts.
        Si no hay registros, retorna una lista vacía.
        """
        Session = DatabaseConnector().get_session
        with Session() as session:
            mermas = session.query(
                Merma.id_merma,
                Merma.observacion,
                Merma.fecha,
                Merma.id_usuario_registro,
                Merma.id_estatus,
                MotivoMerma.descripcion.label('motivo_descripcion'),
                TipoMerma.descripcion.label('tipo_merma_descripcion')
                ).join(
                    MotivoMerma, Merma.motivo == MotivoMerma.id_motivo_merma
                ).join(
                    TipoMerma, Merma.tipo_merma == TipoMerma.id_tipo_merma
                ).filter(Merma.id_estatus == True).all()
            return [self._merma_to_dict(m) for m in mermas]
