import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Cargar variables de entorno desde .env
from dotenv import load_dotenv
load_dotenv()

# Agregar la raíz del proyecto al path Python para imports
# (alembic/ está en la raíz, así que '..' apunta a la raíz donde está backend/)
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, base_dir)

# Importar tu configuración de DB y modelos
# (Asegúrate de que estos paths coincidan con tu estructura: backend/app/data/)
from backend.app.data.db import Base  # Importa la Base global de SQLAlchemy
from backend.app.data.models.user import User_Fisioterapeuta, User_Paciente  # Modelos de usuarios
# Agrega imports de otros modelos aquí si los tienes, e.g.:
# from backend.app.data.models.lesion import Lesion

# Configuración de Alembic (lee de alembic.ini)
config = context.config

# Interpretar el archivo de config para logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Configurar target_metadata para autogenerate
# Usa la metadata de todos tus modelos (Base los incluye si están definidos con __tablename__)
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Ejecuta migraciones en modo 'offline' (sin conexión real a BD)."""
    # Corrige: Usa "sqlalchemy.url" de alembic.ini
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Ejecuta migraciones en modo 'online' (con conexión real a BD)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata  # Alembic usará esto para detectar cambios en modelos
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
