from app.extensions import db
from sqlalchemy.dialects.postgresql import ENUM

class Pet(db.Model):
    __tablename__ = "pets"

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)

    species = db.Column(db.String(20), nullable=False)


    breed = db.Column(db.String(100))
    age = db.Column(db.Integer)
    temperament = db.Column(db.Text)
    medical_notes = db.Column(db.Text)
