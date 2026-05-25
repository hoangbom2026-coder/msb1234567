import { io } from "socket.io-client";
import jwt from "jsonwebtoken";

const token = jwt.sign({ id: 1, role: 'ROOT' }, 'super_secret_key_123', { expiresIn: '1h' });

const socket = io("http://127.0.0.1:5000", {
  auth: { token }
});

socket.on("connect", () => {
  console.log("Connected as admin", socket.id);
  socket.emit("admin:send_message", {
    conversationId: 27, // Ensure this exists
    messageContent: "Hello from test script"
  });
});

socket.on("admin:receive_message", (msg) => {
  console.log("Received back:", msg);
  process.exit(0);
});

socket.on("error", (err) => {
  console.error("Socket error:", err);
  process.exit(1);
});

setTimeout(() => {
  console.log("Timeout");
  process.exit(0);
}, 3000);
