#!/usr/bin/env node
// Deploy webhook server — listens on 127.0.0.1:9001
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TOKEN   = fs.readFileSync('/root/.deploy_token', 'utf8').trim();
const PORT    = 9001;
const LOG_DIR = '/var/app/sands/logs';
const LOG_FILE = path.join(LOG_DIR, 'deploy.log');

let deployRunning = false;

// Ensure log dir exists
fs.mkdirSync(LOG_DIR, { recursive: true });

const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
  fs.appendFileSync(LOG_FILE, line);
};

const server = http.createServer((req, res) => {
  // Reject any connection not from localhost — defence-in-depth in case
  // the server is ever misconfigured to expose this port externally.
  const remoteAddr = req.socket.remoteAddress;
  if (remoteAddr !== '127.0.0.1' && remoteAddr !== '::1' && remoteAddr !== '::ffff:127.0.0.1') {
    res.writeHead(403);
    res.end('Forbidden');
    log('Blocked non-local deploy attempt from ' + remoteAddr);
    return;
  }

  // Only accept POST /deploy-hook
  if (req.method !== 'POST' || req.url !== '/deploy-hook') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // Auth check
  const auth = req.headers['authorization'] || '';
  if (auth !== `Bearer ${TOKEN}`) {
    res.writeHead(401);
    res.end('Unauthorized');
    log('Unauthorized deploy attempt from ' + remoteAddr);
    return;
  }

  // Prevent concurrent deploys
  if (deployRunning) {
    res.writeHead(409, { 'Content-Type': 'text/plain' });
    res.end('Deploy already in progress\n');
    log('Deploy skipped — already running');
    return;
  }

  deployRunning = true;
  log('Deploy triggered');
  res.writeHead(202, { 'Content-Type': 'text/plain' });
  res.end('Deploy started\n');

  // Stream deploy.sh output directly to the log file
  const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
  const child = spawn('/bin/bash', ['/var/app/sands/deploy.sh'], {
    timeout: 600_000, // 10 min max
    env: { ...process.env, PATH: process.env.PATH },
  });

  child.stdout.pipe(logStream, { end: false });
  child.stderr.pipe(logStream, { end: false });

  child.on('close', (code) => {
    deployRunning = false;
    logStream.end();
    if (code === 0) {
      log('Deploy finished successfully');
    } else {
      log(`Deploy FAILED with exit code ${code}`);
    }
  });

  child.on('error', (err) => {
    deployRunning = false;
    logStream.end();
    log('Deploy spawn error: ' + err.message);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  log(`Deploy webhook listening on 127.0.0.1:${PORT}`);
});
