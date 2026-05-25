import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getStoredToken } from '@/lib/auth-store';

export const useSocket = (gameCode: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });

    socketInstance.on('connect', () => {
      console.log(`Connected to socket for ${gameCode}`);
      socketInstance.emit('joinGame', { roomId: gameCode });
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [gameCode]);

  return socket;
};
