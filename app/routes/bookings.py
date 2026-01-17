from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_smorest import Blueprint, abort
from datetime import datetime
import json
import os
import uuid
from flask import current_app, request
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.booking import Booking
from app.models.enum import BookingStatus
from app.schemas.booking_schema import BookingSchema
from app.schemas.pet_update_schema import PetUpdateSchema, PetUpdateCreateSchema, PetUpdatePhotoResponse
from app.models.service_request import ServiceRequest
from app.models.offer import Offer
from app.models.pet import Pet
from app.models.service_type import ServiceType
from app.models.user import User
from app.models.pet_update import PetUpdate

bookings_bp = Blueprint(
    "bookings",
    __name__,
    url_prefix="/bookings",
    description="Bookings operations"
)

@bookings_bp.route("/my")
class MyBookings(MethodView):

    @jwt_required()
    @bookings_bp.response(200, BookingSchema(many=True))
    def get(self):
        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")

        if role == "OWNER":
            q = Booking.query.filter_by(owner_id=user_id)
        elif role == "SITTER":
            q = Booking.query.filter_by(sitter_id=user_id)
        else:
            abort(403, message="Forbidden")

        bookings = q.order_by(Booking.id.desc()).all()
        return [serialize_booking(b) for b in bookings]


@bookings_bp.route("/<int:booking_id>")
class BookingById(MethodView):

    @jwt_required()
    @bookings_bp.response(200, BookingSchema)
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

        return serialize_booking(booking)


@bookings_bp.route("/<int:booking_id>/complete")
class CompleteBooking(MethodView):

    @jwt_required()
    @bookings_bp.response(200, BookingSchema)
    def put(self, booking_id):
        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")

        booking = Booking.query.get(booking_id)
        if not booking:
            abort(404, message="Booking not found")

        # MVP rule: only OWNER can complete (or allow sitter too—your call)
        if role != "OWNER" or booking.owner_id != user_id:
            abort(403, message="Forbidden")

        if booking.status != BookingStatus.ACTIVE.value:
            abort(400, message=f"Cannot complete booking with status '{booking.status}'")

        booking.status = BookingStatus.COMPLETED.value
        booking.completed_at = datetime.utcnow()
        db.session.commit()
        return serialize_booking(booking)


def serialize_booking(booking: Booking):
  req = ServiceRequest.query.get(booking.request_id)
  offer = Offer.query.get(booking.offer_id)
  pet = Pet.query.get(req.pet_id) if req else None
  service_type = ServiceType.query.get(req.service_type_id) if req else None
  sitter = User.query.get(booking.sitter_id)
  updates = (
    PetUpdate.query.filter_by(booking_id=booking.id)
    .order_by(PetUpdate.created_at.desc())
    .all()
  )

  location_raw = req.location if req else None
  location = location_raw
  try:
    parsed = json.loads(location_raw) if isinstance(location_raw, str) else None
    if parsed:
      location = parsed
  except Exception:
    pass

  return {
    "id": booking.id,
    "request_id": booking.request_id,
    "offer_id": booking.offer_id,
    "owner_id": booking.owner_id,
    "sitter_id": booking.sitter_id,
    "agreed_price": float(booking.agreed_price),
    "price": float(booking.agreed_price),
    "status": booking.status,
    "created_at": booking.created_at,
    "completed_at": booking.completed_at,
    # enriched
    "sitter_name": getattr(sitter, "full_name", None) or getattr(sitter, "name", None),
    "sitter_avatar": getattr(sitter, "avatar", None),
    "pet_name": pet.name if pet else None,
    "pet_type": pet.species if pet else None,
    "service_type": service_type.name if service_type else None,
    "location": location,
    # requests do not store dates; send created_at for both to avoid undefined
    "date_start": getattr(req, "created_at", None) if req else None,
    "date_end": getattr(req, "created_at", None) if req else None,
    "updates": [
      {
        "id": u.id,
        "type": u.type,
        "content": u.content,
        "photo_url": u.photo_url,
        "created_at": u.created_at,
      }
      for u in updates
    ],
  }


@bookings_bp.route("/<int:booking_id>/updates")
class BookingUpdates(MethodView):

    @jwt_required()
    @bookings_bp.response(200, PetUpdateSchema(many=True))
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

        updates = (
            PetUpdate.query.filter_by(booking_id=booking_id)
            .order_by(PetUpdate.created_at.desc())
            .all()
        )
        return PetUpdateSchema(many=True).dump(updates)

    @jwt_required()
    @bookings_bp.arguments(PetUpdateCreateSchema)
    @bookings_bp.response(201, PetUpdateSchema)
    def post(self, data, booking_id):
        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")

        booking = Booking.query.get(booking_id)
        if not booking:
            abort(404, message="Booking not found")
        if role != "SITTER" or booking.sitter_id != user_id:
            abort(403, message="Only the assigned sitter can add updates")
        if booking.status != BookingStatus.ACTIVE.value:
            abort(400, message="Updates allowed uniquement pour les réservations actives")

        update = PetUpdate(
            booking_id=booking_id,
            sitter_id=user_id,
            type=data["type"],
            content=data.get("content"),
            photo_url=data.get("photo_url"),
        )
        db.session.add(update)
        db.session.commit()
        return PetUpdateSchema().dump(update)


@bookings_bp.route("/<int:booking_id>/updates/photo")
class BookingUpdatePhoto(MethodView):
    @jwt_required()
    @bookings_bp.doc(
        summary="Upload a photo update for an active booking",
        description="SITTER only. Booking must be ACTIVE. Send multipart/form-data with field 'file'.",
    )
    @bookings_bp.response(201, PetUpdatePhotoResponse)
    def post(self, booking_id):
        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")

        booking = Booking.query.get(booking_id)
        if not booking:
            abort(404, message="Booking not found")
        if role != "SITTER" or booking.sitter_id != user_id:
            abort(403, message="Only the assigned sitter can upload photos")
        if booking.status != BookingStatus.ACTIVE.value:
            abort(400, message="Photos allowed uniquement pour les réservations actives")

        if "file" not in request.files:
            abort(400, message="file is required")
        file = request.files["file"]
        if file.filename == "":
            abort(400, message="Filename missing")

        upload_folder = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_folder, exist_ok=True)
        ext = os.path.splitext(file.filename)[1]
        filename = secure_filename(f"{uuid.uuid4().hex}{ext}")
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)

        host = request.host_url.rstrip("/")
        url = f"{host}/uploads/{filename}"
        return {"url": url}, 201
