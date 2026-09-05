#!/usr/bin/env node
// Simple deploy webhook server - runs on port 9000
const http = require('http');
const { execFile } = require('child_process');
const fs = require('fs');

const TOKEN = fs.readFileSync('/root/.deploy_token', 'utf8').trim();
const PORT = 9001;

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/deploy-hook') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const auth = req.headers['authorization'] || '';
  if (auth !== `Bearer ${TOKEN}`) {
    res.writeHead(401);
    res.end('Unauthorized');
    console.log(`[${new Date().toISOString()}] Unauthorized deploy attempt`);
    return;
  }

  console.log(`[${new Date().toISOString()}] Deploy triggered`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Deploy started\n');

  execFile('/bin/bash', ['/var/app/sands/deploy.sh'], { timeout: 300000 }, (err, stdout, stderr) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Deploy FAILED:`, err.message);
      console.error(stderr);
    } else {
      console.log(`[${new Date().toISOString()}] Deploy OK`);
      console.log(stdout);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Deploy webhook listening on 127.0.0.1:${PORT}`);
});
