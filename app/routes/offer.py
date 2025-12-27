# backend/app/routes/offers.py
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_smorest import Blueprint, abort
from decimal import Decimal

from app.extensions import db
from app.models.offer import Offer
from app.models.enum import OfferStatus, RequestStatus
from app.models.service_request import ServiceRequest
from app.schemas.offer_schema import OfferCreateSchema, OfferSchema
from app.utils.roles import role_required

offers_bp = Blueprint(
    "offers",
    __name__,
    url_prefix="/requests",
    description="Offers operations"
)

@offers_bp.route("/<int:request_id>/offers")
class OffersOnRequest(MethodView):

    @jwt_required()
    @role_required("SITTER")
    @offers_bp.arguments(OfferCreateSchema)
    @offers_bp.response(201, OfferSchema)
    def post(self, data, request_id):
        sitter_id = int(get_jwt_identity())

        req = ServiceRequest.query.get(request_id)
        if not req:
            abort(404, message="Service request not found")

        if req.status != RequestStatus.OPEN.value:
            abort(400, message="You can only offer on OPEN requests")

        existing = Offer.query.filter_by(request_id=request_id, sitter_id=sitter_id).first()
        if existing:
            abort(409, message="You already made an offer for this request")

        offer = Offer(
            request_id=request_id,
            sitter_id=sitter_id,
            offered_price=Decimal(str(data["offered_price"])),
            message=data.get("message"),
            status=OfferStatus.PENDING.value
        )

        db.session.add(offer)
        db.session.commit()
        return offer

    @jwt_required()
    @offers_bp.response(200, OfferSchema(many=True))
    def get(self, request_id):
        user_id = int(get_jwt_identity())
        role = get_jwt().get("role")

        req = ServiceRequest.query.get(request_id)
        if not req:
            abort(404, message="Service request not found")

        if role == "OWNER":
            if req.owner_id != user_id:
                abort(403, message="Forbidden")
            return Offer.query.filter_by(request_id=request_id).order_by(Offer.id.desc()).all()

        if role == "SITTER":
            return Offer.query.filter_by(request_id=request_id, sitter_id=user_id).all()

        abort(403, message="Forbidden")

# Offer actions blueprint
offers_actions_bp = Blueprint(
    "offers_actions",
    __name__,
    url_prefix="/offers",
    description="Offer actions"
)

@offers_actions_bp.route("/<int:offer_id>/accept")
class AcceptOffer(MethodView):

    @jwt_required()
    @role_required("OWNER")
    @offers_actions_bp.response(200, OfferSchema)
    def put(self, offer_id):
        ...

        owner_id = int(get_jwt_identity())

        offer = Offer.query.get(offer_id)
        if not offer:
            abort(404, message="Offer not found")

        req = ServiceRequest.query.get(offer.request_id)
        if not req:
            abort(404, message="Service request not found")

        if req.owner_id != owner_id:
            abort(403, message="Forbidden")

        if req.status != RequestStatus.OPEN.value:
            abort(400, message="Request is not OPEN")

        offer.status = OfferStatus.ACCEPTED.value
        req.status = RequestStatus.ACCEPTED.value

        Offer.query.filter(
            Offer.request_id == req.id,
            Offer.id != offer.id,
            Offer.status == OfferStatus.PENDING.value
        ).update({"status": OfferStatus.REJECTED.value})

        db.session.commit()
        return offer

@offers_actions_bp.route("/<int:offer_id>/reject")
class RejectOffer(MethodView):
    ...


    @jwt_required()
    @role_required("OWNER")
    @offers_actions_bp.response(200, OfferSchema)
    def put(self, offer_id):
        owner_id = int(get_jwt_identity())

        offer = Offer.query.get(offer_id)
        if not offer:
            abort(404, message="Offer not found")

        req = ServiceRequest.query.get(offer.request_id)
        if not req:
            abort(404, message="Service request not found")

        if req.owner_id != owner_id:
            abort(403, message="Forbidden")

        if offer.status != OfferStatus.PENDING.value:
            abort(400, message="Only PENDING offers can be rejected")

        offer.status = OfferStatus.REJECTED.value
        db.session.commit()
        return offer
