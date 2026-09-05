import 'dotenv/config';

// Startup validation — fail fast if required secrets are missing or weak
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters long. Exiting.');
  process.exit(1);
}
if (!process.env.DB_PASSWORD) {
  console.error('FATAL: DB_PASSWORD is not set. Exiting.');
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
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

// CORS — in production, lock down to the actual origin
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001']
  : ['*'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Transaction logging middleware
app.use(transactionLoggingMiddleware);

// File validation middleware (runs after multer, before controllers)
app.use(validateFileUpload);

// Request logger
app.use((req, _res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Static assets served by backend
const publicPath = path.join(__dirname, 'public');
app.use('/uploads', express.static(path.join(publicPath, 'uploads'), { maxAge: '7d' }));
app.use('/flag',    express.static(path.join(publicPath, 'flag'),    { maxAge: '30d' }));

app.use('/api', apiRoutes);

// Error handler with cleanup
app.use(cleanupFileOnError);
app.use(errorHandler);

startScheduler();

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MBS Backend running on port ${PORT}`);
});
