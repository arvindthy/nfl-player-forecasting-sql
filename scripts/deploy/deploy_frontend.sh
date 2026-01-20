#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
# 🚀 ArvindFFB Frontend Deployment Script (PROD, TAG-BASED)
# ─────────────────────────────────────────────────────────────

ENVIRONMENT="$1"
TAG="$2"

# ─────────────────────────────────────────────
# 🛑 Argument validation
# ─────────────────────────────────────────────
if [[ "$ENVIRONMENT" != "prod" ]]; then
  echo "❌ Usage:"
  echo "  ./scripts/deploy/deploy_frontend.sh prod [frontend-vX.Y.Z]"
  exit 1
fi

# ─────────────────────────────────────────────
# 🌍 Project config (LOCKED)
# ─────────────────────────────────────────────
PROJECT_NAME="arvindffb"

SERVER_USER="thyagil"
SERVER_HOST="10.0.0.4"

BASE_PATH="/home/thyagil/apps/$PROJECT_NAME/prod"
FRONTEND_DIST_PATH="$BASE_PATH/frontend"
FRONTEND_TMP_REPO="$BASE_PATH/frontend-dist-repo"

GIT_REPO="git@github-arvindthy:arvindthy/nfl-player-forecasting-sql.git"

# ─────────────────────────────────────────────
# 🔢 Tag helpers
# ─────────────────────────────────────────────
get_latest_frontend_tag() {
  git tag -l "frontend-v*" --sort=-v:refname | head -n 1
}

increment_patch() {
  local tag="$1"
  local version="${tag#frontend-v}"
  IFS='.' read -r MAJOR MINOR PATCH <<< "$version"
  PATCH=$((PATCH + 1))
  echo "frontend-v$MAJOR.$MINOR.$PATCH"
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
  LAST_TAG=$(get_latest_frontend_tag)

  if [[ -z "$LAST_TAG" ]]; then
    TAG="frontend-v1.0.0"
  else
    TAG=$(increment_patch "$LAST_TAG")
  fi

  git checkout main
  git pull origin main

  echo "🏗️ Building frontend dist on main"
  (cd frontend && npm install && npm run build)

  git add -f frontend/dist
  if ! git diff --cached --quiet; then
    git commit -m "Build frontend dist for $TAG"
  fi

  git tag -a "$TAG" -m "Frontend release $TAG"
  git push origin main
  git push origin "$TAG"
else
  if ! git ls-remote --tags origin | grep -q "refs/tags/$TAG$"; then
    echo "❌ Tag $TAG does not exist on GitHub"
    exit 1
  fi
fi

echo "🚀 Deploying frontend tag: $TAG"

# ─────────────────────────────────────────────
# 🖥️ Remote deployment (dist only)
# ─────────────────────────────────────────────
ssh "$SERVER_USER@$SERVER_HOST" <<REMOTE
set -e

echo "🧹 Preparing dist-only deploy"
rm -rf "$FRONTEND_TMP_REPO"
mkdir -p "$FRONTEND_TMP_REPO"

git clone --filter=blob:none --sparse "$GIT_REPO" "$FRONTEND_TMP_REPO"
cd "$FRONTEND_TMP_REPO"
git sparse-checkout set frontend/dist
git checkout "$TAG"

echo "📦 Syncing dist"
rm -rf "$FRONTEND_DIST_PATH"
mkdir -p "$FRONTEND_DIST_PATH"
rsync -a --delete "$FRONTEND_TMP_REPO/frontend/dist/" "$FRONTEND_DIST_PATH/"

echo "🧹 Cleaning temp repo"
rm -rf "$FRONTEND_TMP_REPO"

echo "✅ Frontend deployed successfully"
REMOTE

echo "🎉 DEPLOY COMPLETE"
