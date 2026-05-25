import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth-store';
import api from '@/lib/api'; // Import the configured axios instance

export interface UserMessage {
  id: number | string;
  sender_role: 'user' | 'admin' | 'guest';
  message: string;
  created_at: string;
}

export const useUserChat = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let visitorId = localStorage.getItem('guest_chat_id');
    if (!visitorId) {
      visitorId = 'gst_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('guest_chat_id', visitorId);
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get(token ? '/user/chat/history' : `/user/chat/guest/history?guestId=${visitorId}`);
        if (response.data && response.data.status) {
          setMessages(response.data.data);
        }
      } catch (err: any) {
        // Only show error if authenticated, guests might not have history yet
        if (token) {
          setError('Failed to fetch chat history.');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.host.includes('localhost') ? 'http://localhost:5000' : '/');
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      query: { guestId: visitorId }
    });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('user:receive_message', (newMessage: UserMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  const sendMessage = (messageText: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('user:send_message', messageText);
  };

  return {
    messages,
    loading,
    error,
    isConnected,
    sendMessage,
  };
};
