from flask import Flask, request , jsonify
import os
from flask import send_from_directory
from flask_cors import CORS
from flask_smorest import Api
from app.config import Config
from app.extensions import db, migrate, ma, jwt, oauth
import warnings
from apispec.ext.marshmallow.openapi import OpenAPIConverter
from decimal import Decimal
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer

warnings.filterwarnings(
    "ignore",
    message="Multiple schemas resolved to the name",
    category=UserWarning,
    module="apispec.ext.marshmallow.openapi"
)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    jwt.init_app(app)
    oauth.init_app(app)

    # Permissive CORS for local dev (allow any origin)
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=False,
        allow_headers="*",
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        max_age=86400,
        send_wildcard=True,
    )

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "false"
        return response
    api = Api(app)
    # OpenAPI / Swagger security scheme for JWT Bearer
    api.spec.components.security_scheme(
        "BearerAuth",
        {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        },
    )
    api.spec.options["security"] = [{"BearerAuth": []}]

    from app.models import Offer as Offer, OfferStatus as OfferStatus, Pet as Pet, RequestStatus as RequestStatus, ServiceRequest as ServiceRequest, ServiceType as ServiceType, ServiceTypeEnum as ServiceTypeEnum, TokenBlocklist as TokenBlocklist, User as User
    # Register OAuth provider (Google)
    oauth.register(
        name="google",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

    from app.routes.auth import auth_bp
    from app.routes.pets import pets_bp
    from app.routes.service_requests import service_requests_bp
    from app.routes.offer import offers_bp, offers_actions_bp
    from app.routes.bookings import bookings_bp
    from app.routes.sitter_profiles import sitter_profiles_bp
    from app.routes.reviews import reviews_bp
    from app.models.service_type import ServiceType

    # Seed minimal service types if missing (ensures request creation works)
    with app.app_context():
        try:
            if ServiceType.query.count() == 0:
                defaults = [
                    {"name": "Pet Sitting", "min_price": Decimal("10.00"), "description": "Garde à domicile"},
                    {"name": "Dog Walking", "min_price": Decimal("5.00"), "description": "Promenade"},
                    {"name": "Pet Taxi", "min_price": Decimal("8.00"), "description": "Transport"},
                    {"name": "Emergency", "min_price": Decimal("12.00"), "description": "Urgence"},
                ]
                for d in defaults:
                    db.session.add(ServiceType(**d))
                db.session.commit()
        except Exception:
            db.session.rollback()

    api.register_blueprint(reviews_bp)
    api.register_blueprint(sitter_profiles_bp)
    api.register_blueprint(bookings_bp)
    api.register_blueprint(auth_bp)
    api.register_blueprint(pets_bp)
    api.register_blueprint(service_requests_bp)
    api.register_blueprint(offers_bp)
    api.register_blueprint(offers_actions_bp)
    
    mail = Mail(app)
    serializer = URLSafeTimedSerializer(app.config["SECRET_KEY"])

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    return app
