"""add rating fields to sitter_profiles

Revision ID: add_profile_ratings
Revises: 4864f9e2494e
Create Date: 2026-01-02 20:10:27.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "add_profile_ratings"
down_revision = "4864f9e2494e"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("sitter_profiles") as batch_op:
        batch_op.add_column(sa.Column("avg_rating", sa.Float(), server_default="0"))
        batch_op.add_column(sa.Column("reviews_count", sa.Integer(), server_default="0"))
        batch_op.add_column(sa.Column("trust_score", sa.Integer(), server_default="0"))


def downgrade():
    with op.batch_alter_table("sitter_profiles") as batch_op:
        batch_op.drop_column("trust_score")
        batch_op.drop_column("reviews_count")
        batch_op.drop_column("avg_rating")
