from app.extensions import ma
from marshmallow import fields, validate

class RegisterSchema(ma.Schema):
    full_name = fields.String(required=True)
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))
    role = fields.String(required=True)
    city = fields.String(required=True)
    phone_number = fields.String()

class LoginSchema(ma.Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)
