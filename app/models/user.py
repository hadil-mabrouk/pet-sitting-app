from app.extensions import db
from sqlalchemy.sql import func
import enum
from werkzeug.security import generate_password_hash, check_password_hash
class UserRole(enum.Enum):
    OWNER = "OWNER"
    SITTER = "SITTER"
    ADMIN = "ADMIN"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    full_name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password_hash = db.Column(db.String(255), nullable=False)

    role = db.Column(db.Enum(UserRole), nullable=False)

    phone_number = db.Column(db.String(20))

    city = db.Column(
        db.Enum(
            "Tunis",
            "Ariana",
            "Ben_Arous",
            "Manouba",
            "La_Marsa",
            "Carthage",
            "Sidi_Bou_Said",
            "Menzah",
            name="grand_tunis_city"
        ),
        nullable=False
    )

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)