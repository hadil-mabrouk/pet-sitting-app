"""Smoke test to instantiate the Flask app and hit /health.

Run from repo root with:
  python backend/smoke_test.py
"""
import importlib.util
from pathlib import Path

# load create_app from backend/app.py to avoid package/module name conflict with `app` package
app_module_path = Path(__file__).resolve().parent / "app.py"
spec = importlib.util.spec_from_file_location("app_module", str(app_module_path))
app_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_mod)  # type: ignore

create_app = getattr(app_mod, "create_app")


class TestConfig:
  SECRET_KEY = "test-secret"
  SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  JWT_SECRET_KEY = "jwt-test-secret"
  CORS_ORIGINS = ["*"]


app = create_app(TestConfig)

with app.test_client() as client:
    # list some routes
    print("Routes registered:")
    for rule in sorted(app.url_map.iter_rules(), key=lambda r: r.rule):
        print(f"  {rule.rule} -> {','.join(rule.methods)}")

    resp = client.get("/health")
    print("\nGET /health ->", resp.status_code, resp.get_json())
