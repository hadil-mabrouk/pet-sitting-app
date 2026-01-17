# backend/app/routes/reviews.py
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_smorest import Blueprint, abort

from app.extensions import db
from app.models.booking import Booking
from app.models.enum import BookingStatus
from app.models.review import Review
from app.models.sitter_profile import SitterProfile
from app.schemas.review_schema import ReviewCreateSchema, ReviewSchema
from app.utils.trust_score import recompute_sitter_trust

reviews_bp = Blueprint(
    "reviews",
    __name__,
    url_prefix="/bookings",
    description="Reviews operations"
)

@reviews_bp.route("/<int:booking_id>/review")
class ReviewOnBooking(MethodView):

    @jwt_required()
    @reviews_bp.response(200, ReviewSchema)
    def get(self, booking_id):
        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")

        booking = Booking.query.get(booking_id)
        if not booking:
            abort(404, message="Booking not found")

        if role == "OWNER" and booking.owner_id != user_id:
            abort(403, message="Forbidden")
        if role == "SITTER" and booking.sitter_id != user_id:
            abort(403, message="Forbidden")
        if role not in ("OWNER", "SITTER"):
            abort(403, message="Forbidden")

        review = Review.query.filter_by(booking_id=booking_id).first()
        if not review:
            abort(404, message="Review not found")

        return review

    @jwt_required()
    @reviews_bp.arguments(ReviewCreateSchema)
    @reviews_bp.response(201, ReviewSchema)
    def post(self, data, booking_id):
        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")

        if role != "OWNER":
            abort(403, message="Only OWNER can leave reviews")

        booking = Booking.query.get(booking_id)
        if not booking:
            abort(404, message="Booking not found")

        if booking.owner_id != user_id:
            abort(403, message="Forbidden")

        if booking.status != BookingStatus.COMPLETED.value:
            abort(400, message="You can review only COMPLETED bookings")

        existing = Review.query.filter_by(booking_id=booking_id).first()
        if existing:
            abort(409, message="Review already exists for this booking")

        review = Review(
            booking_id=booking.id,
            owner_id=booking.owner_id,
            sitter_id=booking.sitter_id,
            rating=data["rating"],
            comment=data.get("comment"),
        )

        db.session.add(review)

        # Ensure sitter profile exists (or create it if your app allows)
        profile = SitterProfile.query.filter_by(sitter_id=booking.sitter_id).first()
        if not profile:
            abort(404, message="Sitter profile not found")

        avg_rating, count, trust = recompute_sitter_trust(booking.sitter_id)
        profile.avg_rating = float(avg_rating)
        profile.reviews_count = count
        profile.trust_score = trust

        db.session.commit()
        return review

@reviews_bp.route("/sitters/<int:sitter_id>/reviews")
class ReviewsOnSitter(MethodView):
    # or remove jwt if you want public
    @reviews_bp.response(200, ReviewSchema(many=True))
    def get(self, sitter_id):
        return Review.query.filter_by(sitter_id=sitter_id).order_by(Review.id.desc()).all()