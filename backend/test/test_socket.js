/**
 * test/test_socket.js — manual socket smoke test
 * Usage: JWT_SECRET=<your_secret> CONV_ID=<id> node test/test_socket.js
 */
import 'dotenv/config';
import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET env var is required. Run: JWT_SECRET=... node test/test_socket.js');
  process.exit(1);
}

const SERVER = process.env.SERVER_URL || 'http://127.0.0.1:5000';
const CONV_ID = parseInt(process.env.CONV_ID || '0');
if (!CONV_ID) {
  console.error('CONV_ID env var is required (existing conversation id). Run: CONV_ID=27 JWT_SECRET=... node test/test_socket.js');
  process.exit(1);
}

const token = jwt.sign({ id: 1, role: 'ROOT' }, JWT_SECRET, { expiresIn: '5m' });
const socket = io(SERVER, { auth: { token } });

socket.on('connect', () => {
  console.log('Connected', socket.id);
  socket.emit('admin:send_message', {
    conversationId: CONV_ID,
    messageContent: 'Hello from smoke test',
  });
});

socket.on('admin:receive_message', (msg) => {
  console.log('✅ Received:', msg);
  socket.disconnect();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('❌ Socket error:', err);
  socket.disconnect();
  process.exit(1);
});

setTimeout(() => {
  console.warn('⏱ Timeout — no response in 5s');
  socket.disconnect();
  process.exit(0);
}, 5000);
