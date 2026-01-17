from app.extensions import db
from app.models.enum import BookingStatus

class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)

    request_id = db.Column(db.Integer, db.ForeignKey("service_requests.id"), nullable=False, unique=True)
    offer_id = db.Column(db.Integer, db.ForeignKey("offers.id"), nullable=False, unique=True)

    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    sitter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    agreed_price = db.Column(db.Numeric(10, 2), nullable=False)

    status = db.Column(db.String(20), nullable=False, default=BookingStatus.ACTIVE.value)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
    completed_at = db.Column(db.DateTime)
