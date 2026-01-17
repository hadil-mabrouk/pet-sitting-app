"""merge pet updates and email verification heads

Revision ID: 38352e5b9ced
Revises: add_email_verification_fields, 20260112130000
Create Date: 2026-01-14 14:38:19.967626

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '38352e5b9ced'
down_revision = ('add_email_verification_fields', '20260112130000')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
