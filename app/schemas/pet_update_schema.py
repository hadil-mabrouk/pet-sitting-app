from marshmallow import Schema, fields, validate


class PetUpdateSchema(Schema):
    id = fields.Int(dump_only=True)
    booking_id = fields.Int(required=True)
    sitter_id = fields.Int(dump_only=True)
    type = fields.Str(required=True, validate=validate.OneOf(["feeding", "walking", "meds", "photo", "note"]))
    content = fields.Str(allow_none=True)
    photo_url = fields.Str(allow_none=True)
    # Use Raw to avoid isoformat errors when DB returns string/datetime
    created_at = fields.Raw(dump_only=True)


class PetUpdateCreateSchema(Schema):
    type = fields.Str(required=True, validate=validate.OneOf(["feeding", "walking", "meds", "photo", "note"]))
    content = fields.Str(allow_none=True)
    photo_url = fields.Str(allow_none=True)


class PetUpdatePhotoResponse(Schema):
    url = fields.Str(required=True, metadata={"example": "http://localhost:5000/uploads/abc123.jpg"})
