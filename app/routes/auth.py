from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)

from app.extensions import db
from app.models.user import User, UserRole
from app.models.token_blocklist import TokenBlocklist
from app.schemas.auth_schema import RegisterSchema, LoginSchema

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/auth",
    description="Authentication endpoints"
)

# =======================
# REGISTER
# =======================

@auth_bp.route("/register")
class Register(MethodView):

    @auth_bp.arguments(RegisterSchema)
    @auth_bp.response(201)
    def post(self, data):
        if User.query.filter_by(email=data["email"]).first():
            abort(409, message="Email already registered")

        user = User(
            full_name=data["full_name"],
            email=data["email"],
            role=UserRole[data["role"]],
            city=data["city"],
            phone_number=data.get("phone_number")
        )
        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        return {"message": "User registered successfully"}


# =======================
# LOGIN
# =======================

@auth_bp.route("/login")
class Login(MethodView):

    @auth_bp.arguments(LoginSchema)
    @auth_bp.response(200)
    def post(self, data):
        user = User.query.filter_by(email=data["email"]).first()
        if not user or not user.check_password(data["password"]):
            abort(401, message="Invalid credentials")

        return {
            "access_token": create_access_token(
                identity=str(user.id),
                additional_claims={"role": user.role.value}
            ),
            "refresh_token": create_refresh_token(identity=str(user.id))
        }


# =======================
# ME
# =======================

@auth_bp.route("/me")
class Me(MethodView):

    @jwt_required()
    @auth_bp.response(200)
    def get(self):
        user = User.query.get_or_404(get_jwt_identity())
        return {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role.value,
            "city": user.city,
            "created_at": user.created_at.isoformat()
        }


# =======================
# REFRESH
# =======================

@auth_bp.route("/refresh")
class Refresh(MethodView):

    @jwt_required(refresh=True)
    @auth_bp.response(200)
    def post(self):
        identity = get_jwt_identity()
        claims = get_jwt()

        return {
            "access_token": create_access_token(
                identity=identity,
                additional_claims={"role": claims["role"]}
            )
        }


# =======================
# LOGOUT
# =======================

@auth_bp.route("/logout")
class Logout(MethodView):

    @jwt_required()
    @auth_bp.response(200)
    def post(self):
        db.session.add(TokenBlocklist(jti=get_jwt()["jti"]))
        db.session.commit()
        return {"message": "Successfully logged out"}
