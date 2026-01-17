from sqlalchemy import func
from app.extensions import db
from app.models.review import Review

def recompute_sitter_trust(sitter_id: int):
    avg_rating, count = db.session.query(
        func.coalesce(func.avg(Review.rating), 0),
        func.count(Review.id)
    ).filter(Review.sitter_id == sitter_id).first()

    avg_rating = float(avg_rating)
    count = int(count)

    rating_component = (avg_rating / 5.0) * 70.0
    volume_component = (min(count, 20) / 20.0) * 30.0
    trust = round(rating_component + volume_component)

    return avg_rating, count, trust
