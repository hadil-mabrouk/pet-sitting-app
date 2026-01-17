"""add email verification fields to users

Revision ID: add_email_verification_fields
Revises: seed_service_types
Create Date: 2026-01-04 11:00:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "add_email_verification_fields"
down_revision = "seed_service_types"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("users", sa.Column("email_verification_code", sa.String(length=6), nullable=True))
    op.add_column("users", sa.Column("email_verification_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("email_verification_last_sent_at", sa.DateTime(timezone=True), nullable=True))


def downgrade():
    op.drop_column("users", "email_verification_last_sent_at")
    op.drop_column("users", "email_verification_expires_at")
    op.drop_column("users", "email_verification_code")
    op.drop_column("users", "email_verified")
