from app.extensions import ma
from marshmallow import fields

class BookingSchema(ma.Schema):
    id = fields.Int(dump_only=True)

    request_id = fields.Int(dump_only=True)
    offer_id = fields.Int(dump_only=True)

    owner_id = fields.Int(dump_only=True)
    sitter_id = fields.Int(dump_only=True)

    agreed_price = fields.Float(dump_only=True)
    price = fields.Float(dump_only=True)

    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    completed_at = fields.DateTime(dump_only=True)

    # Enriched fields (joined data)
    sitter_name = fields.Str(dump_only=True)
    sitter_avatar = fields.Str(dump_only=True)
    pet_name = fields.Str(dump_only=True)
    pet_type = fields.Str(dump_only=True)
    service_type = fields.Str(dump_only=True)
    location = fields.Raw(dump_only=True)
    date_start = fields.Str(dump_only=True)
    date_end = fields.Str(dump_only=True)
