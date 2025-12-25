import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise SystemExit("DATABASE_URL not set in environment or .env")

conn = None
try:
    conn = psycopg2.connect(database_url)
    with conn.cursor() as cur:
        cur.execute("SELECT version();")
        print("✅ Database connection successful:", cur.fetchone())
except Exception as e:
    print("❌ Database connection failed:", e)
finally:
    if conn:
        conn.close()
