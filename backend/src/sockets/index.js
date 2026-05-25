
import { handleJoinGame, handlePlaceBet } from './gameHandlers.js';
import { registerChatHandlers } from './chatHandlers.js';

export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    if (socket.user) {
        console.log(`Socket connected: ${socket.id}, User: ${socket.user.name_user || 'N/A'} (ID: ${socket.user.id})`);
        
        // Join private user room for targeted events (e.g., balance updates)
        socket.join(`user_${socket.user.id}`);

        // If the user is an admin or staff, add them to the dedicated admin room
        const staffRoles = ['admin', 'ROOT', 'super_admin', 'cskh', 'agent'];
        if (staffRoles.includes(socket.user.role)) {
            socket.join('admin_room');
            console.log(`Staff user ${socket.user.name_user} (ID: ${socket.user.id}, Role: ${socket.user.role}) joined 'admin_room'.`);
        }
    } else {
        const guestId = socket.handshake.query.guestId;
        if (guestId) {
            socket.join(`guest_${guestId}`);
            console.log(`Guest socket connected: ${socket.id}, GuestID: ${guestId}`);
        } else {
            console.log(`Socket connected (Guest): ${socket.id}`);
        }
    }

    // Pass `io` to handlers that might need to broadcast to rooms.
    handleJoinGame(io, socket);
    handlePlaceBet(io, socket);
    registerChatHandlers(io, socket);

    socket.on('ping', () => socket.emit('pong'));

    socket.on('disconnect', () => {
        if (socket.user) {
            console.log(`Socket disconnected: ${socket.id}, User ID: ${socket.user.id}`);
        } else {
            console.log(`Socket disconnected (Guest): ${socket.id}`);
        }
    });
  });
};
