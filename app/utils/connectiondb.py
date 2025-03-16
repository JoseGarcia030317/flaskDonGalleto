import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import Config

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class DatabaseConnector:
    """
    Clase para gestionar la conexión a una base de datos MySQL usando SQLAlchemy.
    """

    def __init__(self):
        self.engine = self._create_engine()
        self.Session = sessionmaker(bind=self.engine)

    def _create_engine(self):
        # Validar si los parámetros de conexión están configurados
        required_fields = ['SERVER', 'DATABASE', 'USER', 'PASSWORD']
        for field in required_fields:
            if not getattr(Config, field, None):
                raise ValueError(f"La configuración '{field}' no está establecida.")

        # Usar el puerto definido o el puerto por defecto de MySQL (3306)
        port = getattr(Config, 'PORT', 3306)
        logger.info(f"server: {Config.SERVER}")
        logger.info(f"puerto: {port}")

        connection_string = (
            f"mysql+pymysql://{Config.USER}:{Config.PASSWORD}"
            f"@{Config.SERVER}/{Config.DATABASE}?charset=utf8mb4"
        )

        try:
            engine = create_engine(
                connection_string,
                echo=False,            # Desactivar el log de SQL (puedes activarlo para depuración)
                pool_recycle=3600      # Reciclar conexiones para evitar problemas de timeout
            )
            logger.info("Conexión a la base de datos MySQL establecida exitosamente.")
            return engine
        except Exception as e:
            logger.error(f"Error al conectar a la base de datos MySQL: {e}")
            raise

    def get_session(self):
        """
        Crea y retorna una nueva sesión de SQLAlchemy para interactuar con la base de datos.
        Se recomienda usar el bloque 'with' para asegurar el cierre adecuado de la sesión.
        Ejemplo:
            with db_connector.get_session() as session:
                # operaciones con la sesión
        """
        return self.Session()

    def dispose(self):
        """
        Cierra todas las conexiones del engine.
        """
        if self.engine:
            self.engine.dispose()
            logger.info("Engine descartado y conexiones cerradas.")