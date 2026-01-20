#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
# 🚀 ArvindFFB Backend Deployment Script (PROD, TAG-BASED)
# ─────────────────────────────────────────────────────────────

ENVIRONMENT="$1"
TAG="$2"

# ─────────────────────────────────────────────
# 🛑 Argument validation
# ─────────────────────────────────────────────
if [[ "$ENVIRONMENT" != "prod" ]]; then
  echo "❌ Usage:"
  echo "  ./scripts/deploy/deploy_backend.sh prod [backend-vX.Y.Z]"
  exit 1
fi

# ─────────────────────────────────────────────
# 🌍 Project config (LOCKED)
# ─────────────────────────────────────────────
PROJECT_NAME="arvindffb"

SERVER_USER="thyagil"
SERVER_HOST="10.0.0.4"

BASE_PATH="/home/thyagil/apps/$PROJECT_NAME/prod"
REPO_PATH="$BASE_PATH/repo"
BACKEND_PATH="$REPO_PATH/backend"

GIT_REPO="git@github-arvindthy:arvindthy/nfl-player-forecasting-sql.git"
SERVICE_NAME="arvindffb-backend-prod"

PYTHON_BIN="/home/thyagil/.pyenv/shims/python3.12"

# ─────────────────────────────────────────────
# 🔢 Tag helpers
# ─────────────────────────────────────────────
get_latest_backend_tag() {
  git tag -l "backend-v*" --sort=-v:refname | head -n 1
}

increment_patch() {
  local tag="$1"
  local version="${tag#backend-v}"
  IFS='.' read -r MAJOR MINOR PATCH <<< "$version"
  PATCH=$((PATCH + 1))
  echo "backend-v$MAJOR.$MINOR.$PATCH"
}

# ─────────────────────────────────────────────
# 🧪 Local sanity checks
# ─────────────────────────────────────────────
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Must be run from repo root"
  exit 1
fi

# ─────────────────────────────────────────────
# 🏷️ Tag resolution
# ─────────────────────────────────────────────
git fetch --tags

if [[ -z "$TAG" ]]; then
  LAST_TAG=$(get_latest_backend_tag)

  if [[ -z "$LAST_TAG" ]]; then
    TAG="backend-v1.0.0"
  else
    TAG=$(increment_patch "$LAST_TAG")
  fi

  git checkout main
  git pull origin main
  git tag -a "$TAG" -m "Backend release $TAG"
  git push origin "$TAG"
else
  if ! git ls-remote --tags origin | grep -q "refs/tags/$TAG$"; then
    echo "❌ Tag $TAG does not exist on GitHub"
    exit 1
  fi
fi

echo "🚀 Deploying backend tag: $TAG"

# ─────────────────────────────────────────────
# 🖥️ Remote deployment
# ─────────────────────────────────────────────
ssh "$SERVER_USER@$SERVER_HOST" <<REMOTE
set -e

echo "🛑 Stopping backend service"
sudo systemctl stop "$SERVICE_NAME" || true

echo "🧹 Removing old source"
rm -rf "$REPO_PATH"
mkdir -p "$REPO_PATH"

echo "📥 Cloning repository"
git clone "$GIT_REPO" "$REPO_PATH"

cd "$REPO_PATH"
git checkout "$TAG"

REMOTE

# ─────────────────────────────────────────────
# 🔐 Copy .env AFTER clone
# ─────────────────────────────────────────────
if [ ! -f backend/.env.prod ]; then
  echo "❌ backend/.env.prod missing on dev machine"
  exit 1
fi

echo "🔐 Copying .env.prod to server..."
scp backend/.env.prod \
  "$SERVER_USER@$SERVER_HOST:$BACKEND_PATH/.env.prod"

# ─────────────────────────────────────────────
# 🖥️ Finish setup on server
# ─────────────────────────────────────────────
ssh "$SERVER_USER@$SERVER_HOST" <<REMOTE
set -e

cd "$BACKEND_PATH"

echo "🐍 Creating fresh venv"
"$PYTHON_BIN" -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

if [ -f ".env.prod" ]; then
  set -a
  source .env.prod
  set +a
fi

export DJANGO_SETTINGS_MODULE=config.settings.prod
export DJANGO_ENV=prod

python manage.py migrate --noinput
python manage.py collectstatic --noinput

echo "🚀 Starting backend service"
sudo systemctl start "$SERVICE_NAME"

echo "✅ Backend deployed successfully"
REMOTE

echo "🎉 DEPLOY COMPLETE"
