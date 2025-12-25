from app.extensions import db
from app.models.enum import RequestStatus 


class ServiceRequest(db.Model):
    __tablename__ = "service_requests"

    id = db.Column(db.Integer, primary_key=True)

    owner_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    pet_id = db.Column(
        db.Integer,
        db.ForeignKey("pets.id"),
        nullable=False
    )

    service_type_id = db.Column(
        db.Integer,
        db.ForeignKey("service_types.id"),
        nullable=False
    )

    requested_price = db.Column(db.Numeric(10, 2), nullable=False)
    location = db.Column(db.String(255), nullable=False)

    status = db.Column(db.String(20), nullable=False, default=RequestStatus.OPEN.value)


    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )
