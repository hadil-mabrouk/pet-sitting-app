from flask.views import MethodView
from flask import redirect, request
from flask_smorest import Blueprint, abort
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta, timezone
import os
import random
import smtplib
from email.message import EmailMessage

from app.extensions import db, oauth
from app.models.user import User, UserRole
from app.models.token_blocklist import TokenBlocklist
from app.schemas.auth_schema import RegisterSchema, LoginSchema, VerifyEmailSchema, ResendVerificationSchema

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/auth",
    description="Authentication endpoints"
)


def _send_email_verification(email: str, code: str):
    """Send verification code via SMTP if configured, else log to console."""
    server = os.getenv("MAIL_SERVER")
    sender = os.getenv("MAIL_DEFAULT_SENDER", os.getenv("MAIL_USERNAME", "no-reply@example.com"))
    if not server:
        print(f"[DEV] Verification code for {email}: {code}")
        return

    msg = EmailMessage()
    msg["Subject"] = "Vérifie ton compte"
    msg["From"] = sender
    msg["To"] = email
    msg.set_content(f"Votre code de vérification est : {code}")

    try:
        with smtplib.SMTP(server, int(os.getenv("MAIL_PORT", "587"))) as smtp:
          if os.getenv("MAIL_USE_TLS", "true").lower() == "true":
            smtp.starttls()
          username = os.getenv("MAIL_USERNAME")
          password = os.getenv("MAIL_PASSWORD")
          if username and password:
            smtp.login(username, password)
          smtp.send_message(msg)
    except Exception as exc:
        print(f"[WARN] Unable to send verification email to {email}: {exc}")
        print(f"[DEV] Code: {code}")


def _generate_code():
    return f"{random.randint(0, 999999):06d}"


# =======================
# REGISTER
# =======================

@auth_bp.route("/register")
class Register(MethodView):

    @auth_bp.arguments(RegisterSchema)
    @auth_bp.response(201)
    @auth_bp.doc(security=[])
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
        # Email verification disabled: mark as verified immediately
        user.email_verified = True
        user.email_verification_code = None
        user.email_verification_expires_at = None
        user.email_verification_last_sent_at = None

        try:
            db.session.add(user)
            db.session.commit()
        except (KeyError, ValueError):
            db.session.rollback()
            abort(400, message="Invalid role")
        except IntegrityError:
            db.session.rollback()
            abort(400, message="Invalid city or duplicate data")

        return {
            "access_token": create_access_token(identity=str(user.id), additional_claims={"role": user.role.value}),
            "refresh_token": create_refresh_token(identity=str(user.id), additional_claims={"role": user.role.value}),
            "email_verified": True,
        }


# =======================
# LOGIN
# =======================

@auth_bp.route("/login")
class Login(MethodView):

    @auth_bp.arguments(LoginSchema)
    @auth_bp.response(200)
    @auth_bp.doc(security=[])
    def post(self, data):
        user = User.query.filter_by(email=data["email"]).first()
        if not user or not user.check_password(data["password"]):
            abort(401, message="Invalid credentials")

        return {
            "access_token": create_access_token(
                identity=str(user.id),
                additional_claims={"role": user.role.value}
            ),
            "refresh_token": create_refresh_token(
                identity=str(user.id),
                additional_claims={"role": user.role.value}
            )
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
            "email_verified": user.email_verified,
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
        role = claims.get("role")
        if role is None:
            # fallback: fetch from DB if claim missing
            user = User.query.get(identity)
            role = user.role.value if user else None

        return {
            "access_token": create_access_token(
                identity=identity,
                additional_claims={"role": role}
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


# =======================
# VERIFY EMAIL
# =======================

@auth_bp.route("/verify-email")
class VerifyEmail(MethodView):

    @auth_bp.arguments(VerifyEmailSchema)
    @auth_bp.response(200)
    @auth_bp.doc(security=[])
    def post(self, data):
        user = User.query.filter_by(email=data["email"]).first()
        if not user:
            abort(404, message="Utilisateur introuvable")
        # Email verification disabled: mark as verified without code
        user.email_verified = True
        user.email_verification_code = None
        user.email_verification_expires_at = None
        user.email_verification_last_sent_at = None
        db.session.commit()
        return {"message": "Email verification disabled"}


# =======================
# RESEND VERIFICATION
# =======================

@auth_bp.route("/resend-verification")
class ResendVerification(MethodView):

    @auth_bp.arguments(ResendVerificationSchema)
    @auth_bp.response(200)
    @auth_bp.doc(security=[])
    def post(self, data):
        user = User.query.filter_by(email=data["email"]).first()
        if not user:
            abort(404, message="Utilisateur introuvable")
        # Email verification disabled: always mark verified
        user.email_verified = True

        user.email_verification_code = None
        user.email_verification_expires_at = None
        user.email_verification_last_sent_at = None
        db.session.commit()
        return {"message": "Email verification disabled"}

# =======================
# GOOGLE OAUTH2 (LOGIN)
# =======================

@auth_bp.route('/google/login')
class GoogleLogin(MethodView):
    @auth_bp.doc(security=[])
    def get(self):
        redirect_uri = os.getenv('GOOGLE_REDIRECT_URI') or request.url_root.rstrip('/') + '/auth/google/callback'
        role = request.args.get("role")
        if role:
            redirect_uri = f"{redirect_uri}?role={role}"
        return oauth.google.authorize_redirect(redirect_uri)


@auth_bp.route('/google/callback')
class GoogleCallback(MethodView):
    @auth_bp.doc(security=[])
    def get(self):
        token = oauth.google.authorize_access_token()
        userinfo = token.get('userinfo') or {}
        email = userinfo.get('email')
        email_verified = userinfo.get('email_verified', True)
        full_name = userinfo.get('name') or userinfo.get('given_name') or 'Google User'
        requested_role = (request.args.get("role") or "").lower()
        default_role = UserRole.SITTER if requested_role == "sitter" else UserRole.OWNER

        if not email:
            abort(400, message='Email not provided by Google')
        if not email_verified:
            abort(403, message='Google account email not verified')

        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(full_name=full_name, email=email, role=default_role, city=None)
            user.email_verified = True
            user.set_password(os.urandom(16).hex())
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role.value})
        refresh_token = create_refresh_token(identity=str(user.id), additional_claims={'role': user.role.value})

        frontend_redirect = os.getenv('FRONTEND_OAUTH_REDIRECT', 'http://localhost:3000/oauth-callback')
        sep = '&' if '?' in frontend_redirect else '?'
        return redirect(f"{frontend_redirect}{sep}access_token={access_token}&refresh_token={refresh_token}")
