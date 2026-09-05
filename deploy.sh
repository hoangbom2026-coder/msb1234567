#!/bin/bash
set -e
DEPLOY_DIR=/var/app/sands

echo "==> Pull latest code"
cd $DEPLOY_DIR
git pull origin main

echo "==> Install & build backend"
cd $DEPLOY_DIR/backend
npm install --omit=dev

echo "==> Install & build frontend"
cd $DEPLOY_DIR/frontend
npm install
npm run build

echo "==> Install & build admin"
cd $DEPLOY_DIR/admin
npm install
npm run build

echo "==> Reload nginx"
cp $DEPLOY_DIR/nginx-marinabaysands.conf /etc/nginx/sites-available/marinabaysands
nginx -t && nginx -s reload

echo "==> Restart PM2 apps"
pm2 reload $DEPLOY_DIR/ecosystem.config.js --update-env
pm2 save

echo "==> Deploy complete"
