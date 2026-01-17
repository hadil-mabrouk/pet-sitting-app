# app/schemas/service_request_schema.py
from app.extensions import ma
from marshmallow import fields, validate
from app.models.pet import Pet
from app.models.service_type import ServiceType

class ServiceRequestSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    owner_id = fields.Int(dump_only=True)

    pet_id = fields.Int(required=True)
    service_type_id = fields.Int(required=True)

    requested_price = fields.Float(required=True)
    location = fields.Str(required=True, validate=validate.Length(min=2))

    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

    # Enriched fields for UI
    pet_name = fields.Method("get_pet_name", dump_only=True)
    pet_type = fields.Method("get_pet_type", dump_only=True)
    pet_image = fields.Method("get_pet_image", dump_only=True)
    service_type_name = fields.Method("get_service_type_name", dump_only=True)

    def get_pet_name(self, obj):
        pet = Pet.query.get(obj.pet_id) if obj and obj.pet_id else None
        return pet.name if pet else None

    def get_pet_type(self, obj):
        pet = Pet.query.get(obj.pet_id) if obj and obj.pet_id else None
        return pet.species or pet.type if pet else None

    def get_pet_image(self, obj):
        pet = Pet.query.get(obj.pet_id) if obj and obj.pet_id else None
        return getattr(pet, "image", None) or getattr(pet, "photo_url", None) if pet else None

    def get_service_type_name(self, obj):
        st = ServiceType.query.get(obj.service_type_id) if obj and obj.service_type_id else None
        return st.name if st else None
