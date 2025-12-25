from app.extensions import db

class ServiceType(db.Model):
    __tablename__ = "service_types"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    min_price = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)