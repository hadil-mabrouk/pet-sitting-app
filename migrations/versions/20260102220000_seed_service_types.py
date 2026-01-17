"""seed default service types

Revision ID: seed_service_types
Revises: add_profile_ratings
Create Date: 2026-01-02 22:00:00.000000
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "seed_service_types"
down_revision = "add_profile_ratings"
branch_labels = None
depends_on = None


def upgrade():
    defaults = [
        ("Pet Sitting", "10.00", "Garde à domicile"),
        ("Dog Walking", "5.00", "Promenade"),
        ("Pet Taxi", "8.00", "Transport"),
        ("Emergency", "12.00", "Urgence"),
    ]
    for name, price, desc in defaults:
        op.execute(
            f"""
            INSERT INTO service_types (name, min_price, description)
            VALUES ('{name}', {price}, '{desc}')
            ON CONFLICT (name) DO NOTHING;
            """
        )


def downgrade():
    op.execute(
        "DELETE FROM service_types WHERE name IN ('Pet Sitting','Dog Walking','Pet Taxi','Emergency');"
    )
