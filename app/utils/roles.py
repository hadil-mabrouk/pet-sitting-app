from functools import wraps
from flask_jwt_extended import get_jwt_identity
from app.models.user import User

def role_required(*roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user = User.query.get(get_jwt_identity())
            if not user or user.role.name not in roles:
                return {"msg": "Access forbidden"}, 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

