from flask import Flask
from flask_smorest import Api
from app import models
from app import api
from .config import Config
from .extensions import db, ma, jwt, cors, migrate
from app.routes.auth import auth_bp
from app.routes.pets import pets_bp
from app.routes.service_requests import service_requests_bp
from app.models.service_type import ServiceType

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, db)

    # Initialize Swagger API
    api = Api(app)
    api.spec.components.schema_name_resolver = lambda schema: schema.__class__.__name__
    # Register Smorest blueprints
    api.register_blueprint(auth_bp)
    api.register_blueprint(pets_bp)
    api.register_blueprint(service_requests_bp)

    
    return app
