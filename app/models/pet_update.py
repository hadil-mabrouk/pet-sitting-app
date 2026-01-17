from app.extensions import db
from datetime import datetime


class PetUpdate(db.Model):
    __tablename__ = "pet_updates"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False, index=True)
    sitter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    type = db.Column(db.String(20), nullable=False)  # feeding, walking, meds, photo, note
    content = db.Column(db.Text, nullable=True)
    photo_url = db.Column(db.String(512), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    booking = db.relationship("Booking", backref="pet_updates")
