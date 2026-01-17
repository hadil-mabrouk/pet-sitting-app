from app.extensions import ma
from marshmallow import ValidationError, fields, validate, validates

class ReviewCreateSchema(ma.Schema):
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))
    comment = fields.Str(required=False, validate=validate.Length(max=1000))
    @validates("comment")
    def validate_comment(self, value):
        if value is None:
            return
        if not value.strip():
            raise ValidationError("Comment cannot be blank.")
        if len(value.strip()) < 5:
            raise ValidationError("Comment must be at least 5 characters.")
class ReviewSchema(ma.Schema):
    id = fields.Int(dump_only=True)
    booking_id = fields.Int(dump_only=True)
    owner_id = fields.Int(dump_only=True)
    sitter_id = fields.Int(dump_only=True)

    rating = fields.Int()
    comment = fields.Str()

    created_at = fields.DateTime(dump_only=True)
