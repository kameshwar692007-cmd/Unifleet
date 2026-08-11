import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("unifleet.database")

Base = declarative_base()

async def get_engine_and_session():
    # Attempt primary PostgreSQL connection
    try:
        engine = create_async_engine(settings.DATABASE_URL, echo=False, pool_pre_ping=True)
        async with engine.connect() as conn:
            pass
        logger.info("Successfully connected to primary PostgreSQL database.")
        session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        return engine, session_factory
    except Exception as e:
        logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to SQLite resilience database.")
        fallback_engine = create_async_engine(settings.FALLBACK_DATABASE_URL, echo=False)
        session_factory = async_sessionmaker(fallback_engine, class_=AsyncSession, expire_on_commit=False)
        return fallback_engine, session_factory

# Global placeholder, initialized on app startup
engine = None
AsyncSessionLocal = None

async def init_db():
    global engine, AsyncSessionLocal
    engine, AsyncSessionLocal = await get_engine_and_session()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created successfully.")

async def get_db():
    if AsyncSessionLocal is None:
        await init_db()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
