# backend/app/schemas/offer_schema.py
from app.extensions import ma
from marshmallow import fields, validate

class OfferCreateSchema(ma.Schema):
    offered_price = fields.Float(required=True)
    message = fields.Str(validate=validate.Length(max=500))

class OfferSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    request_id = fields.Int(dump_only=True)
    sitter_id = fields.Int(dump_only=True)
    offered_price = fields.Float(required=True)
    message = fields.Str()
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
