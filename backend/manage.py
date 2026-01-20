#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


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


def main():
    """Run administrative tasks."""
    base_dir = Path(__file__).resolve().parent
    environment = os.environ.get("DJANGO_ENV", "dev").lower()
    if environment == "prod":
        load_dotenv(base_dir / ".env.prod")
        load_dotenv(base_dir / ".env")
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.prod")
    else:
        load_dotenv(base_dir / ".env.dev")
        load_dotenv(base_dir / ".env")
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
