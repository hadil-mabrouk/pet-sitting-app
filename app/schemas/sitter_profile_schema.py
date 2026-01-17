from app.extensions import ma
from marshmallow import fields, validate

class SitterProfileCreateUpdateSchema(ma.Schema):
    bio = fields.Str(required=False, validate=validate.Length(max=2000))
    city = fields.Str(required=True, validate=validate.Length(min=2))
    experience_years = fields.Int(required=False, validate=validate.Range(min=0, max=60))
    services = fields.List(fields.Str(), required=False)
    base_price = fields.Float(required=False, validate=validate.Range(min=0))
    is_available = fields.Bool(required=False)

class SitterProfileSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    sitter_id = fields.Int(dump_only=True)

    bio = fields.Str()
    city = fields.Str()
    experience_years = fields.Int()
    services = fields.List(fields.Str())
    base_price = fields.Float()

    is_available = fields.Bool()
    verification_status = fields.Str()
    avg_rating = fields.Float(dump_only=True)
    reviews_count = fields.Int(dump_only=True)
    trust_score = fields.Int(dump_only=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

