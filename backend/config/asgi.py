"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
from pathlib import Path

from django.core.asgi import get_asgi_application

def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


base_dir = Path(__file__).resolve().parent.parent
environment = os.environ.get("DJANGO_ENV", "dev").lower()
if environment == "prod":
    load_dotenv(base_dir / ".env.prod")
    load_dotenv(base_dir / ".env")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.prod")
else:
    load_dotenv(base_dir / ".env.dev")
    load_dotenv(base_dir / ".env")
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

application = get_asgi_application()
