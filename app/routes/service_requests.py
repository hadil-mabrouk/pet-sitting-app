

from decimal import Decimal
from flask_jwt_extended import get_jwt, jwt_required, get_jwt_identity
from flask.views import MethodView
from flask_smorest import Blueprint, abort
from psycopg2 import IntegrityError

from app.extensions import db
from app.models.service_request import ServiceRequest, RequestStatus
from app.models.service_type import ServiceType
from app.models.pet import Pet
from app.schemas.service_request_schema import ServiceRequestSchema
from app.utils.roles import role_required

service_requests_bp = Blueprint(
    "service_requests",
    __name__,
    url_prefix="/requests",
    description="Service requests operations"
)

@service_requests_bp.route("/types")
class ServiceTypes(MethodView):
    @service_requests_bp.response(200)
    def get(self):
        types = ServiceType.query.order_by(ServiceType.id.asc()).all()
        return [
            {
                "id": st.id,
                "name": st.name,
                "min_price": float(st.min_price) if st.min_price is not None else None,
                "description": st.description,
            }
            for st in types
        ]

@service_requests_bp.route("")
class ServiceRequestsCollection(MethodView):

    @jwt_required()
    @role_required("OWNER")
    @service_requests_bp.arguments(ServiceRequestSchema)
    @service_requests_bp.response(201, ServiceRequestSchema)
    def post(self, data):
        owner_id = int(get_jwt_identity())

        # 1) validate pet exists AND belongs to this owner
        pet = Pet.query.filter_by(id=data["pet_id"], owner_id=owner_id).first()
        if not pet:
            abort(404, message="Pet not found (or not owned by you)")

        # 2) validate service type exists
        service_type = ServiceType.query.get(data["service_type_id"])
        if not service_type:
            abort(404, message="Service type not found")

        # 3) enforce min price
        if Decimal(str(data["requested_price"])) < service_type.min_price:
            abort(400, message=f"Price below minimum ({service_type.min_price})")

        # 4) create request (IMPORTANT: use .value)
        req = ServiceRequest(
            owner_id=owner_id,
            pet_id=data["pet_id"],
            service_type_id=data["service_type_id"],
            requested_price=Decimal(str(data["requested_price"])),
            location=data["location"],
            status=RequestStatus.OPEN.value,
        )

        try:
            db.session.add(req)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            abort(400, message="Database integrity error (check pet_id and service_type_id)")

        return req

@service_requests_bp.route("/my")
class MyRequests(MethodView):

    @jwt_required()
    @role_required("OWNER")
    @service_requests_bp.response(200, ServiceRequestSchema(many=True))
    def get(self):
        owner_id = int(get_jwt_identity())
        requests = ServiceRequest.query.filter_by(owner_id=owner_id).order_by(ServiceRequest.id.desc()).all()
        return requests

@service_requests_bp.route("/open")
class OpenRequests(MethodView):

    @jwt_required()
    @role_required("SITTER")
    @service_requests_bp.response(200, ServiceRequestSchema(many=True))
    def get(self):
        requests = ServiceRequest.query.filter_by(status=RequestStatus.OPEN.value) \
    .order_by(ServiceRequest.id.desc()).all()

        return requests
    
    
@service_requests_bp.route("/<int:request_id>")
class RequestById(MethodView):

    @jwt_required()
    @service_requests_bp.response(200, ServiceRequestSchema)
    def get(self, request_id: int):
        req = ServiceRequest.query.get(request_id)
        if not req:
            abort(404, message="Request not found")

        # OWNER can view his own request; SITTER can view OPEN ones (simple rule for now)
        role = get_jwt().get("role")
        user_id = int(get_jwt_identity())

        if role == "OWNER" and req.owner_id != user_id:
            abort(403, message="Forbidden")

        if role == "SITTER" and req.status != "OPEN":
            abort(403, message="Forbidden")

        return req

@service_requests_bp.route("/<int:request_id>/cancel")
class CancelRequestResource(MethodView):

    @jwt_required()
    @role_required("OWNER")
    @service_requests_bp.response(200, ServiceRequestSchema)
    def put(self, request_id):
        user_id = int(get_jwt_identity())

        req = ServiceRequest.query.get(request_id)
        if not req:
            abort(404, message="Request not found")

        if req.owner_id != user_id:
            abort(403, message="You can only cancel your own requests")

        # allow cancel only when OPEN (strict MVP)
        if req.status != RequestStatus.OPEN.value:
            abort(400, message=f"Cannot cancel a request with status '{req.status}'")

        req.status = RequestStatus.CANCELLED.value
        db.session.commit()

        return req
