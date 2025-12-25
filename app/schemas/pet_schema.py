from app.extensions import ma
from app.models.pet import Pet
from marshmallow import fields, EXCLUDE

class PetSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Pet
        load_instance = True
        unknown = EXCLUDE   # 🔥 VERY IMPORTANT

    id = fields.Int(dump_only=True)
    owner_id = fields.Int(load_only=True)  # 🔥 ALLOW BACKEND TO SET IT

    name = fields.Str(required=True)
    species = fields.Str(required=True)
    breed = fields.Str()
    age = fields.Int()
    temperament = fields.Str()
    medical_notes = fields.Str()
