import os
from datetime import timedelta
class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:12345@localhost:5432/pet_sitting_dev"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key")
    JWT_SECRET_KEY = "super-secret-key"  # change later
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    # 🔥 FLASK-SMOREST REQUIRED CONFIG
    API_TITLE = "Pet Sitting API"
    API_VERSION = "v1"
    OPENAPI_VERSION = "3.0.3"
    OPENAPI_URL_PREFIX = "/docs"
    OPENAPI_SWAGGER_UI_PATH = "/swagger"
    OPENAPI_SWAGGER_UI_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("GMAIL_USER")
    MAIL_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
    MAIL_DEFAULT_SENDER = MAIL_USERNAME
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(os.path.dirname(__file__), "..", "uploads"))
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = False  # ok for local HTTP; in prod use True+HTTPS
