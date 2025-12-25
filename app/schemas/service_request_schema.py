# app/schemas/service_request_schema.py
from app.extensions import ma
from marshmallow import fields, validate

class ServiceRequestSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    owner_id = fields.Int(dump_only=True)

    pet_id = fields.Int(required=True)
    service_type_id = fields.Int(required=True)

    requested_price = fields.Float(required=True)
    location = fields.Str(required=True, validate=validate.Length(min=2))

    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
