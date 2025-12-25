"""Small test runner to execute backend pytest suite.

Run from repo root with your Python executable:
  python backend/run_tests.py

This script changes into the `backend/` folder and runs pytest on `tests/`.
"""
import os
import sys
from pathlib import Path

import pytest


def main() -> int:
    here = Path(__file__).resolve().parent
    os.chdir(here)
    # run tests in backend/tests
    return pytest.main(["-q", "tests"])  # quiet output


if __name__ == "__main__":
    raise SystemExit(main())
