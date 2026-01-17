from app.extensions import db
from datetime import datetime


class SitterProfile(db.Model):
  """
  Profile data for a sitter user.
  """
  __tablename__ = "sitter_profiles"

  id = db.Column(db.Integer, primary_key=True)
  sitter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True, index=True)

  bio = db.Column(db.Text, nullable=True)
  city = db.Column(db.String(120), nullable=False)
  experience_years = db.Column(db.Integer, nullable=True)
  services = db.Column(db.JSON, nullable=True)  # list of strings
  base_price = db.Column(db.Float, nullable=True)
  is_available = db.Column(db.Boolean, default=True)
  verification_status = db.Column(db.String(50), default="UNVERIFIED")

  created_at = db.Column(db.DateTime, default=datetime.utcnow)
  updated_at = db.Column(
      db.DateTime,
      default=datetime.utcnow,
      onupdate=datetime.utcnow,
  )

  user = db.relationship("User", backref=db.backref("sitter_profile", uselist=False))

  # Ratings / trust indicators
  avg_rating = db.Column(db.Float, default=0)
  reviews_count = db.Column(db.Integer, default=0)
  trust_score = db.Column(db.Integer, default=0)
