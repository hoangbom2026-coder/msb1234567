import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth-store';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  return window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin;
};

export const useGameSocket = (roomId: string | number) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { updateMoney } = useAuth();

  const [currentSession, setCurrentSession] = useState<any>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [serverTimeLeft, setServerTimeLeft] = useState<number>(0);

  const placeBet = useCallback((bets: any[]) => {
    if (socket && isConnected) {
      socket.emit('placeBet', { roomId, bets });
    } else {
      console.error("Socket disconnected");
    }
  }, [socket, isConnected, roomId]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!roomId || !token) return;

    const SOCKET_URL = getSocketUrl();
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      // 1. Authenticate socket
      newSocket.emit('auth', { token });
      // 2. Join game room
      newSocket.emit('joinGame', { roomId });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Lắng nghe xác thực thành công/thất bại
    newSocket.on('authResponse', (data) => {
      if (!data.status) console.error("Socket Auth Failed:", data.message);
    });

    // Lắng nghe tick từ server để đồng bộ thời gian
    newSocket.on('tick', (data) => {
      if (data.timeLeft !== undefined) {
        setServerTimeLeft(data.timeLeft);
      }
      if (data.period) {
        setCurrentSession((prev: any) => ({ ...prev, period: data.period, endTime: data.endTime }));
      }
    });

    // Lắng nghe cập nhật phiên mới
    newSocket.on('sessionUpdate', (data) => {
      setCurrentSession(data);
    });

    // Lắng nghe kết quả phiên vừa kết thúc
    newSocket.on('result', (data) => {
      setLastResult(data);
    });

    // Lắng nghe cập nhật số dư
    newSocket.on('balanceUpdate', (data) => {
      if (data.money !== undefined) {
        setBalance(data.money);
        updateMoney(Number(data.money));
      }
      if (data.money_win) {
      }
    });
    newSocket.on('placeBetResponse', (data) => {
      if (!data.status) alert(data.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  return {
    isConnected,
    currentSession,
    lastResult,
    balance,
    serverTimeLeft,
    placeBet
  };
};
