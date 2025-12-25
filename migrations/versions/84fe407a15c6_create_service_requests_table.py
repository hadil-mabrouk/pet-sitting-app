"""create service_requests table

Revision ID: 84fe407a15c6
Revises: 2f328d83af51
Create Date: 2025-12-24 19:21:37.913358

"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # 1️⃣ Create ENUM explicitly
    request_status_enum = sa.Enum(
        'OPEN', 'CANCELLED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED',
        name='request_status'
    )
    request_status_enum.create(op.get_bind(), checkfirst=True)

    # 2️⃣ Alter column USING explicit cast
    op.execute(
        """
        ALTER TABLE service_requests
        ALTER COLUMN status
        TYPE request_status
        USING status::request_status
        """
    )

def downgrade():
    op.execute(
        """
        ALTER TABLE service_requests
        ALTER COLUMN status
        TYPE VARCHAR(20)
        """
    )
    sa.Enum(name='request_status').drop(op.get_bind(), checkfirst=True)
