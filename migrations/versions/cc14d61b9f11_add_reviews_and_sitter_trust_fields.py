"""add reviews and sitter trust fields

Revision ID: cc14d61b9f11
Revises: 3f701fef1754
Create Date: 2025-12-27 22:16:26.598562

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cc14d61b9f11'
down_revision = '3f701fef1754'
branch_labels = None
depends_on = None

def upgrade():
    # 1) reviews table
    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), nullable=False, unique=True),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("sitter_id", sa.Integer(), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.String(length=1000)),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["booking_id"], ["bookings.id"]),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["sitter_id"], ["users.id"]),
    )

    # 2) add columns FIRST as nullable (with defaults is even safer)
    with op.batch_alter_table("sitter_profiles") as batch_op:
        batch_op.add_column(
            sa.Column("avg_rating", sa.Numeric(3, 2), nullable=True, server_default=sa.text("0.0"))
        )
        batch_op.add_column(
            sa.Column("reviews_count", sa.Integer(), nullable=True, server_default=sa.text("0"))
        )
        batch_op.add_column(
            sa.Column("trust_score", sa.Integer(), nullable=True, server_default=sa.text("0"))
        )

    # 3) backfill existing rows (important)
    op.execute("UPDATE sitter_profiles SET avg_rating = 0.0 WHERE avg_rating IS NULL")
    op.execute("UPDATE sitter_profiles SET reviews_count = 0 WHERE reviews_count IS NULL")
    op.execute("UPDATE sitter_profiles SET trust_score = 0 WHERE trust_score IS NULL")

    # 4) NOW enforce NOT NULL
    with op.batch_alter_table("sitter_profiles") as batch_op:
        batch_op.alter_column("avg_rating", existing_type=sa.Numeric(3, 2), nullable=False)
        batch_op.alter_column("reviews_count", existing_type=sa.Integer(), nullable=False)
        batch_op.alter_column("trust_score", existing_type=sa.Integer(), nullable=False)

def downgrade():
    with op.batch_alter_table("sitter_profiles") as batch_op:
        batch_op.drop_column("trust_score")
        batch_op.drop_column("reviews_count")
        batch_op.drop_column("avg_rating")

    op.drop_table("reviews")

    # ### end Alembic commands ###
