import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth-store';
import { adminApi } from '@/lib/admin-api';

export interface Message {
  id: number | string;
  conversation_id: number;
  sender_id: number | string;
  sender_role: 'user' | 'admin' | 'guest';
  message: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number | null;
  guest_id: string | null;
  user_name: string;
  user_phone: string;
  last_message: string;
  last_message_time: string;
  has_unread_user_messages: boolean;
  avatar?: string;
  online?: boolean;
}

export const useAdminChat = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const activeConversationIdRef = useRef<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    activeConversationIdRef.current = activeConversation?.id || null;
  }, [activeConversation]);

  useEffect(() => {
    if (!token) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5000' : window.location.origin);
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const convResponse = await adminApi.getChatConversations();
        if (convResponse.status) {
          setConversations(convResponse.data);
        }
      } catch (err) {
        setError('Failed to fetch conversations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    socket.on('connect', () => console.log('[DEBUG-CHAT] Admin Socket Connected:', socket.id));
    socket.on('disconnect', (reason) => console.log('[DEBUG-CHAT] Admin Socket Disconnected:', reason));
    socket.on('admin:receive_message', (newMessage: Message) => {
      setMessages((prev) => {
        if (newMessage.conversation_id !== activeConversationIdRef.current) return prev;

        if (prev.find(m => m.id === newMessage.id)) return prev;

        const filtered = prev.filter(m => !(`${m.id}`.startsWith('temp-') && m.message === newMessage.message));
        return [...filtered, newMessage];
      });
    });
    
    socket.on('admin:message_edited', ({ messageId, newContent, conversationId }) => {
      setMessages((prev) => {
        if (conversationId !== activeConversationIdRef.current) return prev;
        return prev.map(m => m.id === messageId ? { ...m, message: newContent } : m);
      });
    });

    socket.on('admin:message_deleted', ({ messageId, conversationId }) => {
      setMessages((prev) => {
        if (conversationId !== activeConversationIdRef.current) return prev;
        return prev.filter(m => m.id !== messageId);
      });
    });
    
    socket.on('admin:update_conversation_list', (updatedConv: Conversation) => {
      setConversations(prev => {
        const existing = prev.find(c => c.id === updatedConv.id);
        if (existing) {
          return prev.map(c => c.id === updatedConv.id ? { ...existing, ...updatedConv } : c);
        } else {
          return [updatedConv, ...prev];
        }
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]); // Removed activeConversation?.id to prevent reconnecting

  useEffect(() => {
    if (activeConversation) {
      fetchMessagesForConversation(activeConversation.id);
    }
  }, [activeConversation]);

  const fetchMessagesForConversation = async (conversationId: number) => {
    try {
      setLoading(true);
      const response = await adminApi.getChatMessages(conversationId);
      if (response.status) {
        setMessages(response.data);
        if (conversations.find(c => c.id === conversationId)?.has_unread_user_messages) {
          await adminApi.markConversationAsRead(conversationId);
          setConversations(prev => 
            prev.map(c => c.id === conversationId ? { ...c, has_unread_user_messages: false } : c)
          );
        }
      }
    } catch (err) {
      setError('Failed to fetch messages.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (messageText: string) => {
    if (!socketRef.current || !activeConversation || !user) return;

    const messageToSend = {
      conversationId: activeConversation.id,
      messageContent: messageText,
    };

    console.log('[DEBUG-CHAT] Emitting admin:send_message', messageToSend);
    socketRef.current.emit('admin:send_message', messageToSend);
    
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      sender_id: user.id,
      sender_role: 'admin',
      message: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
  };

  const editMessage = (messageId: number | string, newContent: string) => {
    if (!socketRef.current || !activeConversation || !user) return;
    socketRef.current.emit('admin:edit_message', { messageId, newContent });
    setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, message: newContent } : m));
  };

  const deleteMessage = (messageId: number | string) => {
    if (!socketRef.current || !activeConversation || !user) return;
    socketRef.current.emit('admin:delete_message', messageId);
    setMessages((prev) => prev.filter(m => m.id !== messageId));
  };

  const selectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    selectConversation,
  };
};
