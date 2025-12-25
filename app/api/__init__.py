from flask_restx import Api

api = Api(
    title="Pet Sitting API",
    version="1.0",
    description="Backend API for Pet Sitting Platform",
    doc="/docs"  # Swagger UI
)
