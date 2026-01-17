from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_smorest import Blueprint, abort

from app.extensions import db
from app.models.sitter_profile import SitterProfile
from app.schemas.sitter_profile_schema import (
    SitterProfileCreateUpdateSchema,
    SitterProfileSchema
)
from app.utils.roles import role_required

sitter_profiles_bp = Blueprint(
    "sitter_profiles",
    __name__,
    url_prefix="/sitters",
    description="Sitter profile operations"
)

@sitter_profiles_bp.route("/me")
class MySitterProfile(MethodView):

    @jwt_required()
    @role_required("SITTER")
    @sitter_profiles_bp.response(200, SitterProfileSchema)
    def get(self):
        sitter_id = int(get_jwt_identity())
        profile = SitterProfile.query.filter_by(sitter_id=sitter_id).first()
        if not profile:
            abort(404, message="Sitter profile not found")
        return profile

    @jwt_required()
    @role_required("SITTER")
    @sitter_profiles_bp.arguments(SitterProfileCreateUpdateSchema)
    @sitter_profiles_bp.response(200, SitterProfileSchema)
    def put(self, data):
        sitter_id = int(get_jwt_identity())
        profile = SitterProfile.query.filter_by(sitter_id=sitter_id).first()

        if not profile:
            profile = SitterProfile(sitter_id=sitter_id, city=data["city"])
            db.session.add(profile)

        for k, v in data.items():
            setattr(profile, k, v)

        db.session.commit()
        return profile


@sitter_profiles_bp.route("")
class BrowseSitters(MethodView):

    @jwt_required()
    @sitter_profiles_bp.response(200, SitterProfileSchema(many=True))
    def get(self):
        # optional filters: city, available
        args_city = None
        args_available = None

        # you can read query params via flask request if you want
        from flask import request
        args_city = request.args.get("city")
        args_available = request.args.get("available")

        q = SitterProfile.query
        if args_city:
            q = q.filter(SitterProfile.city.ilike(f"%{args_city}%"))
        if args_available is not None:
            if args_available.lower() in ["true", "1", "yes"]:
                q = q.filter_by(is_available=True)
            elif args_available.lower() in ["false", "0", "no"]:
                q = q.filter_by(is_available=False)

        return q.order_by(SitterProfile.id.desc()).all()
