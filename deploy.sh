#!/bin/bash
set -euo pipefail
export GIT_SSH_COMMAND="ssh -i /root/.ssh/mbs_deploy -o StrictHostKeyChecking=no"

DEPLOY_DIR=/var/app/sands
LOG_FILE=$DEPLOY_DIR/logs/deploy.log
LOCK_FILE=/tmp/mbs-deploy.lock

# ── Ensure logs dir exists ──────────────────────────────────
mkdir -p "$DEPLOY_DIR/logs"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

# ── Prevent concurrent deploys ──────────────────────────────
if [ -f "$LOCK_FILE" ]; then
  log "ERROR: Deploy already in progress (lock: $LOCK_FILE). Aborting."
  exit 1
fi
touch "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"; log "Deploy lock released."' EXIT

log "==> Deploy started"

# ── Pull latest code ────────────────────────────────────────
log "==> Pull latest code"
cd "$DEPLOY_DIR"
git pull origin main >> "$LOG_FILE" 2>&1

# ── Backend — use npm ci for reproducible installs ──────────
log "==> Install backend dependencies"
cd "$DEPLOY_DIR/backend"
npm ci --omit=dev >> "$LOG_FILE" 2>&1

# ── Frontend — install all (devDeps needed for build), then prune ──
log "==> Build frontend"
cd "$DEPLOY_DIR/frontend"
npm ci >> "$LOG_FILE" 2>&1
npm run build >> "$LOG_FILE" 2>&1
npm prune --omit=dev >> "$LOG_FILE" 2>&1

# ── Admin — same pattern ────────────────────────────────────
log "==> Build admin"
cd "$DEPLOY_DIR/admin"
npm ci >> "$LOG_FILE" 2>&1
npm run build >> "$LOG_FILE" 2>&1
npm prune --omit=dev >> "$LOG_FILE" 2>&1

# ── Nginx ───────────────────────────────────────────────────
log "==> Reload nginx"
cp "$DEPLOY_DIR/nginx-marinabaysands.conf" /etc/nginx/sites-available/marinabaysands
nginx -t >> "$LOG_FILE" 2>&1 && nginx -s reload >> "$LOG_FILE" 2>&1

# ── PM2 ─────────────────────────────────────────────────────
log "==> Restart PM2 apps"
pm2 reload "$DEPLOY_DIR/ecosystem.config.js" --update-env >> "$LOG_FILE" 2>&1
pm2 save >> "$LOG_FILE" 2>&1

log "==> Deploy complete"
