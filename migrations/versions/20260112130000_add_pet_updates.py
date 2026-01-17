"""add pet updates table

Revision ID: 20260112130000
Revises: cc14d61b9f11
Create Date: 2026-01-12 13:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260112130000'
down_revision = 'cc14d61b9f11'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'pet_updates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('booking_id', sa.Integer(), nullable=False),
        sa.Column('sitter_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('photo_url', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sitter_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_pet_updates_booking_id', 'pet_updates', ['booking_id'])


def downgrade():
    op.drop_index('ix_pet_updates_booking_id', table_name='pet_updates')
    op.drop_table('pet_updates')
