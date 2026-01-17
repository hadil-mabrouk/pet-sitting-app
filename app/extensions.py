# app/extensions.py

from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from authlib.integrations.flask_client import OAuth

from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()
jwt = JWTManager()
oauth = OAuth()


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    from app.models.token_blocklist import TokenBlocklist
    return TokenBlocklist.query.filter_by(jti=jwt_payload["jti"]).first() is not None
