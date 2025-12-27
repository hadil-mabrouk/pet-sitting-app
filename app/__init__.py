# app/__init__.py
from flask import Flask
from flask_smorest import Api
from app.config import Config
from app.extensions import db, migrate, ma, jwt
import warnings
from apispec.ext.marshmallow.openapi import OpenAPIConverter

warnings.filterwarnings(
    "ignore",
    message="Multiple schemas resolved to the name",
    category=UserWarning,
    module="apispec.ext.marshmallow.openapi"
)
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    jwt.init_app(app)

    api = Api(app)

    from app.models import Offer as Offer, OfferStatus as OfferStatus, Pet as Pet, RequestStatus as RequestStatus, ServiceRequest as ServiceRequest, ServiceType as ServiceType, ServiceTypeEnum as ServiceTypeEnum, TokenBlocklist as TokenBlocklist, User as User  # Now this actually imports everything
    # register blueprints (smorest)
    from app.routes.auth import auth_bp
    from app.routes.pets import pets_bp
    from app.routes.service_requests import service_requests_bp
    from app.routes.offer import offers_bp,offers_actions_bp

    api.register_blueprint(auth_bp)
    api.register_blueprint(pets_bp)
    api.register_blueprint(service_requests_bp)
    api.register_blueprint(offers_bp)
    api.register_blueprint(offers_actions_bp)
    return app
