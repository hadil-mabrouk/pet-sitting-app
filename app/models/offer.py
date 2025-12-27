from app.extensions import db
from app.models.enum import OfferStatus

class Offer(db.Model):
    __tablename__ = "offers"

    id = db.Column(db.Integer, primary_key=True)

    request_id = db.Column(
        db.Integer, db.ForeignKey("service_requests.id"), nullable=False
    )

    sitter_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False
    )

    offered_price = db.Column(db.Numeric(10, 2), nullable=False)
    message = db.Column(db.String(500))

    status = db.Column(db.String(20), nullable=False, default=OfferStatus.PENDING.value)

    created_at = db.Column(db.DateTime, server_default=db.func.now())
