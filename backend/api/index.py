import sys
import os

# Ensure the backend root is on the path so imports from main.py work
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app  # noqa: F401 - Vercel uses `app` as the ASGI handler
