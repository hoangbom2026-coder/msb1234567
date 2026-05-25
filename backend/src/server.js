import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initSocket } from './config/socket.js';
import { registerSocketHandlers } from './sockets/index.js';
import { startScheduler } from './jobs/gameScheduler.js';
import apiRoutes from './routes/api/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { transactionLoggingMiddleware } from './middleware/transactionLogger.js';
import { validateFileUpload, cleanupFileOnError } from './middleware/fileValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = initSocket(server);
registerSocketHandlers(io);

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Transaction logging middleware
app.use(transactionLoggingMiddleware);

// File validation middleware
app.use(validateFileUpload);

// Simple logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

const publicPath = path.join(__dirname, 'public');
app.use('/uploads', express.static(path.join(publicPath, 'uploads'), { maxAge: '7d' }));
app.use('/flag', express.static(path.join(publicPath, 'flag'), { maxAge: '30d' }));

app.use('/api', apiRoutes);

// Serve admin frontend
const adminDistPath = path.resolve(__dirname, '../../admin/dist');
if (fs.existsSync(adminDistPath)) {
  app.use('/admin', express.static(adminDistPath));
  app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(adminDistPath, 'index.html'));
  });
}

// Serve user frontend
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use('/', express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/uploads') || req.url.startsWith('/flag')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handler with cleanup
app.use(cleanupFileOnError);
app.use(errorHandler);

startScheduler();

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server: ${PORT}`);
});
