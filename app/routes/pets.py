from flask import request
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_smorest import Blueprint, abort

from app.extensions import db
from app.models.pet import Pet
from app.schemas.pet_schema import PetSchema
from app.utils.roles import role_required

pets_bp = Blueprint(
    "pets",
    __name__,
    url_prefix="/pets",
    description="Pet management endpoints"
)

# -------- /pets/ --------
@pets_bp.route("/")
class PetsListResource(MethodView):

    @jwt_required()
    @pets_bp.response(200, PetSchema(many=True))
    def get(self):
        pets = Pet.query.all()
        return pets

    @jwt_required()
    @role_required("OWNER")
    @pets_bp.arguments(PetSchema)              # returns Pet instance because load_instance=True
    @pets_bp.response(201, PetSchema)
    def post(self, pet: Pet):
        # pet is a Pet model instance, NOT a dict
        pet.owner_id = int(get_jwt_identity())

        db.session.add(pet)
        db.session.commit()
        return pet


# -------- /pets/<id> --------
@pets_bp.route("/<int:pet_id>")
class PetResource(MethodView):

    @jwt_required()
    @pets_bp.response(200, PetSchema)
    def get(self, pet_id):
        user_id = int(get_jwt_identity())
        pet = Pet.query.get_or_404(pet_id)

        if pet.owner_id != user_id:
            abort(403, message="Unauthorized access")

        return pet

    @jwt_required()
    @role_required("OWNER")
    @pets_bp.arguments(PetSchema(partial=True))   # allow partial update
    @pets_bp.response(200, PetSchema)
    def put(self, pet_updates: Pet, pet_id):
        user_id = int(get_jwt_identity())
        pet = Pet.query.get_or_404(pet_id)

        if pet.owner_id != user_id:
            abort(403, message="Unauthorized access")

        # pet_updates is a Pet instance with only provided fields set
        # We copy the fields that were provided into the existing pet
        for field in ["name", "species", "breed", "age", "temperament", "medical_notes"]:
            value = getattr(pet_updates, field, None)
            if value is not None:
                setattr(pet, field, value)

        db.session.commit()
        return pet

    @jwt_required()
    @role_required("OWNER")
    def delete(self, pet_id):
        user_id = int(get_jwt_identity())
        pet = Pet.query.get_or_404(pet_id)

        if pet.owner_id != user_id:
            abort(403, message="Unauthorized access")

        db.session.delete(pet)
        db.session.commit()
        return {"message": "Pet deleted successfully"}, 200
