from app.extensions import ma
from marshmallow import fields, validate

GRAND_TUNIS_CITIES = [
    "Tunis",
    "Ariana",
    "Ben_Arous",
    "Manouba",
    "La_Marsa",
    "Carthage",
    "Sidi_Bou_Said",
    "Menzah",
]
ALLOWED_ROLES = ["OWNER", "SITTER"]

class RegisterSchema(ma.Schema):
    full_name = fields.String(required=True)
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))
    role = fields.String(required=True, validate=validate.OneOf(ALLOWED_ROLES))
    city = fields.String(required=True, validate=validate.OneOf(GRAND_TUNIS_CITIES))
    phone_number = fields.String()

class LoginSchema(ma.Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)


class VerifyEmailSchema(ma.Schema):
    email = fields.Email(required=True)
    code = fields.String(required=True, validate=validate.Length(equal=6))


class ResendVerificationSchema(ma.Schema):
    email = fields.Email(required=True)
