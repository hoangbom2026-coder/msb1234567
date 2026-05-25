import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import pool from './database.js';

let io;

export const initSocket = (server) => {
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
  ];

  io = new Server(server, {
    cors: {
      origin: "*", methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_123');
      const [rows] = await pool.query('SELECT id, phone, name_user, role, status, money FROM users WHERE id = ?', [decoded.id]);

      if (rows.length > 0) {
        socket.user = rows[0];
        socket.join(`user_${socket.user.id}`);
        console.log(`Socket ${socket.id} joined private room user_${socket.user.id}`);
      }
    } catch (error) {
      console.error('Socket auth error:', error.message);
    }
    next();
  });

  console.log('✅ Socket.IO server initialized with multi-origin CORS and authentication.');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
