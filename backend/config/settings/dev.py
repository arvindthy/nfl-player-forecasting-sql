from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "dev-insecure-secret-key"
)
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
	"http://10.0.0.100:5300",
	"http://localhost:5100",
	"http://localhost:5200",
	"http://localhost:3000",
	"http://localhost:5173",
	"https://apiviewer.yatri360.com",
]
