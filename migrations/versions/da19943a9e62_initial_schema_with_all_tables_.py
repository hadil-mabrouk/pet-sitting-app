"""initial schema with all tables including offers

Revision ID: da19943a9e62
Revises: 
Create Date: 2025-12-26 22:22:18.365848

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'da19943a9e62'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Enforce enums up front
    user_role_enum = sa.Enum('OWNER', 'SITTER', 'ADMIN', name='userrole', create_type=False)
    city_enum = sa.Enum(
        'Tunis', 'Ariana', 'Ben_Arous', 'Manouba', 'La_Marsa', 'Carthage', 'Sidi_Bou_Said', 'Menzah',
        name='grand_tunis_city',
        create_type=False
    )

    bind = op.get_bind()

    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=120), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', user_role_enum, nullable=False),
        sa.Column('phone_number', sa.String(length=20)),
        sa.Column('city', city_enum, nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'))
    )

    op.create_table(
        'token_blocklist',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('jti', sa.String(length=36), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'))
    )

    op.create_table(
        'service_types',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False, unique=True),
        sa.Column('min_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('description', sa.Text())
    )

    op.create_table(
        'pets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('species', sa.String(length=20), nullable=False),
        sa.Column('breed', sa.String(length=100)),
        sa.Column('age', sa.Integer()),
        sa.Column('temperament', sa.Text()),
        sa.Column('medical_notes', sa.Text())
    )

    op.create_table(
        'service_requests',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('pet_id', sa.Integer(), sa.ForeignKey('pets.id'), nullable=False),
        sa.Column('service_type_id', sa.Integer(), sa.ForeignKey('service_types.id'), nullable=False),
        sa.Column('requested_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default=sa.text("'OPEN'")),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'))
    )

    op.create_table(
        'offers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('request_id', sa.Integer(), sa.ForeignKey('service_requests.id'), nullable=False),
        sa.Column('sitter_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('offered_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('message', sa.String(length=500)),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'))
    )


def downgrade():
    op.drop_table('offers')
    op.drop_table('service_requests')
    op.drop_table('pets')
    op.drop_table('service_types')
    op.drop_table('token_blocklist')
    op.drop_table('users')

    # drop enums
    bind = op.get_bind()
    try:
        sa.Enum(name='userrole').drop(bind, checkfirst=True)
    except Exception:
        pass
    try:
        sa.Enum(name='grand_tunis_city').drop(bind, checkfirst=True)
    except Exception:
        pass
