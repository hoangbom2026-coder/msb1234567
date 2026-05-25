
import pool from '../config/database.js';

// Helper function to get user from socket
const getUserFromSocket = (socket) => socket.user;

export const registerChatHandlers = (io, socket) => {

  // ========= User-side Event: User/Guest sends a message to Staff =========
  socket.on('user:send_message', async (messageContent) => {
    const user = getUserFromSocket(socket);
    // Try to get guestId from multiple sources
    const guestId = socket.handshake.query.guestId || socket.handshake.auth.guestId;

    if (!user && !guestId) {
        console.warn(`[Chat] Unauthenticated attempt to send message from socket ${socket.id}`);
        return socket.emit('error', { message: 'Bạn cần định danh để chat.' });
    }

    const connection = await pool.getConnection();
    try {
      const now = Date.now();
      await connection.beginTransaction();

      let conversationId;
      if (user) {
        // 1. Find or create the conversation for User
        let [conversations] = await connection.query('SELECT id FROM chat_conversations WHERE user_id = ?', [user.id]);
        if (conversations.length > 0) {
          conversationId = conversations[0].id;
        } else {
          const [newConversation] = await connection.query(
            'INSERT INTO chat_conversations (user_id, user_name, user_phone, updated_at) VALUES (?, ?, ?, ?)',
            [user.id, user.name_user || user.phone || 'User', user.phone, now]
          );
          conversationId = newConversation.insertId;
        }
      } else {
        // 1. Find or create for Guest
        let [conversations] = await connection.query('SELECT id FROM chat_conversations WHERE guest_id = ?', [guestId]);
        if (conversations.length > 0) {
          conversationId = conversations[0].id;
        } else {
          const [newConversation] = await connection.query(
            'INSERT INTO chat_conversations (guest_id, user_name, updated_at) VALUES (?, ?, ?)',
            [guestId, `Khách ${guestId.substring(0, 4)}`, now]
          );
          conversationId = newConversation.insertId;
        }
      }

      // 2. Insert the new message
      const [newMessage] = await connection.query(
        'INSERT INTO chat_messages (conversation_id, sender_id, sender_role, message, created_at) VALUES (?, ?, ?, ?, ?)',
        [conversationId, user ? user.id : null, user ? 'user' : 'guest', messageContent, now]
      );

      // 3. Update the conversation
      await connection.query(
        'UPDATE chat_conversations SET last_message = ?, last_message_time = ?, has_unread_user_messages = TRUE, updated_at = ? WHERE id = ?',
        [messageContent, now, now, conversationId]
      );
      
      await connection.commit();

      const messageData = {
        id: newMessage.insertId,
        conversation_id: conversationId,
        sender_id: user ? user.id : null,
        sender_role: user ? 'user' : 'guest',
        message: messageContent,
        created_at: now,
      };

      // 4. Emit to Admin Room
      io.to('admin_room').emit('admin:receive_message', messageData);
      
      // Emit back to user/guest room for multi-tab sync
      const userRoom = user ? `user_${user.id}` : `guest_${guestId}`;
      io.to(userRoom).emit('user:receive_message', messageData);

      // 5. Notify admins to update their list
      const [updatedConversation] = await connection.query(
        `SELECT c.id, c.user_id, c.guest_id, c.user_name, c.user_phone, c.last_message, c.last_message_time, c.has_unread_user_messages
         FROM chat_conversations c WHERE c.id = ?`,
        [conversationId]
      );
      io.to('admin_room').emit('admin:update_conversation_list', updatedConversation[0]);

      console.log(`[Chat] Message from ${user ? 'User '+user.id : 'Guest '+guestId} -> Admin (Conv: ${conversationId})`);

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('[Socket Chat Error - User Send]', error);
      socket.emit('error', { message: 'Không thể gửi tin nhắn của bạn.' });
    } finally {
      if (connection) connection.release();
    }
  });

  // ========= Admin-side Event: Staff sends a message to User/Guest =========
  socket.on('admin:send_message', async ({ conversationId, messageContent }) => {
    console.log(`[DEBUG] RECEIVED admin:send_message FROM SOCKET ${socket.id}`, conversationId, messageContent);
    const admin = getUserFromSocket(socket);
    const staffRoles = ['admin', 'super_admin', 'cskh', 'agent', 'ROOT'];
    
    if (!admin || !staffRoles.includes(admin.role)) {
      console.warn(`[Chat] Unauthorized attempt to send admin message from socket ${socket.id}`);
      return socket.emit('error', { message: 'Không có quyền truy cập.' });
    }

    const connection = await pool.getConnection();
    try {
        const now = Date.now();
        await connection.beginTransaction();

        // 1. Get identifiers from conversation
        const [conversations] = await connection.query('SELECT user_id, guest_id FROM chat_conversations WHERE id = ?', [conversationId]);
        if (conversations.length === 0) throw new Error('Cuộc hội thoại không tồn tại.');
        const { user_id, guest_id } = conversations[0];

        // 2. Insert the new message
        const [newMessage] = await connection.query(
          'INSERT INTO chat_messages (conversation_id, sender_id, sender_role, message, created_at) VALUES (?, ?, ?, ?, ?)',
          [conversationId, admin.id, 'admin', messageContent, now]
        );

        // 3. Update conversation: clear the unread user flag, update last message
        await connection.query(
            'UPDATE chat_conversations SET last_message = ?, last_message_time = ?, has_unread_user_messages = FALSE, updated_at = ? WHERE id = ?',
            [messageContent, now, now, conversationId]
        );

        await connection.commit();

        const messageData = {
            id: newMessage.insertId,
            conversation_id: conversationId,
            sender_id: admin.id,
            sender_role: 'admin',
            message: messageContent,
            created_at: now,
        };

        // 4. Emit to User/Guest room
        if (user_id) {
            io.to(`user_${user_id}`).emit('user:receive_message', messageData);
            console.log(`[Chat] Staff ${admin.id} (${admin.role}) -> User ${user_id}`);
        } else if (guest_id) {
            io.to(`guest_${guest_id}`).emit('user:receive_message', messageData);
            console.log(`[Chat] Staff ${admin.id} (${admin.role}) -> Guest ${guest_id}`);
        }

        // 5. Sync with other Staff members
        io.to('admin_room').emit('admin:receive_message', messageData);

        // 6. Update the conversation list for all staff members
        const [updatedConversation] = await connection.query(
            `SELECT c.id, c.user_id, c.guest_id, c.user_name, c.user_phone, c.last_message, c.last_message_time, c.has_unread_user_messages
             FROM chat_conversations c WHERE c.id = ?`,
            [conversationId]
        );
        if (updatedConversation.length > 0) {
            io.to('admin_room').emit('admin:update_conversation_list', updatedConversation[0]);
        }

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[Socket Chat Error - Admin Send]', error);
        socket.emit('error', { message: 'Không thể gửi tin nhắn của bạn.' });
    } finally {
        if (connection) connection.release();
    }
  });

  // ========= Admin-side Event: Staff edits a message =========
  socket.on('admin:edit_message', async ({ messageId, newContent }) => {
    const admin = getUserFromSocket(socket);
    const staffRoles = ['admin', 'super_admin', 'cskh', 'agent', 'ROOT'];
    
    if (!admin || !staffRoles.includes(admin.role)) {
      return socket.emit('error', { message: 'Không có quyền truy cập.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [messages] = await connection.query('SELECT id, conversation_id, sender_role FROM chat_messages WHERE id = ?', [messageId]);
        if (messages.length === 0) throw new Error('Tin nhắn không tồn tại.');
        if (messages[0].sender_role !== 'admin') throw new Error('Chỉ có thể sửa tin nhắn của admin.');

        const conversationId = messages[0].conversation_id;

        await connection.query('UPDATE chat_messages SET message = ? WHERE id = ?', [newContent, messageId]);

        await connection.commit();

        const editData = { messageId, newContent, conversationId };
        
        io.to('admin_room').emit('admin:message_edited', editData);

        const [conversations] = await connection.query('SELECT user_id, guest_id FROM chat_conversations WHERE id = ?', [conversationId]);
        if (conversations.length > 0) {
            const { user_id, guest_id } = conversations[0];
            if (user_id) {
                io.to(`user_${user_id}`).emit('admin:message_edited', editData);
            } else if (guest_id) {
                io.to(`guest_${guest_id}`).emit('admin:message_edited', editData);
            }
        }
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[Socket Chat Error - Admin Edit]', error);
        socket.emit('error', { message: 'Không thể sửa tin nhắn.' });
    } finally {
        if (connection) connection.release();
    }
  });

  // ========= Admin-side Event: Staff deletes a message =========
  socket.on('admin:delete_message', async (messageId) => {
    const admin = getUserFromSocket(socket);
    const staffRoles = ['admin', 'super_admin', 'cskh', 'agent', 'ROOT'];
    
    if (!admin || !staffRoles.includes(admin.role)) {
      return socket.emit('error', { message: 'Không có quyền truy cập.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [messages] = await connection.query('SELECT id, conversation_id, sender_role FROM chat_messages WHERE id = ?', [messageId]);
        if (messages.length === 0) throw new Error('Tin nhắn không tồn tại.');
        if (messages[0].sender_role !== 'admin') throw new Error('Chỉ có thể xóa tin nhắn của admin.');

        const conversationId = messages[0].conversation_id;

        await connection.query('DELETE FROM chat_messages WHERE id = ?', [messageId]);

        // Option to update last_message if this was the last message.
        // Simplified: We skip updating last_message in conversations table for deletions to keep it simple and performant,
        // or we could fetch the new last message and update it.
        const [lastMessages] = await connection.query('SELECT message, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1', [conversationId]);
        let newLastMessage = '';
        let newLastMessageTime = Date.now();
        if (lastMessages.length > 0) {
            newLastMessage = lastMessages[0].message;
            newLastMessageTime = lastMessages[0].created_at;
        }
        await connection.query('UPDATE chat_conversations SET last_message = ?, last_message_time = ? WHERE id = ?', [newLastMessage, newLastMessageTime, conversationId]);

        await connection.commit();

        const deleteData = { messageId, conversationId };
        
        io.to('admin_room').emit('admin:message_deleted', deleteData);

        const [conversations] = await connection.query('SELECT user_id, guest_id FROM chat_conversations WHERE id = ?', [conversationId]);
        if (conversations.length > 0) {
            const { user_id, guest_id } = conversations[0];
            if (user_id) {
                io.to(`user_${user_id}`).emit('admin:message_deleted', deleteData);
            } else if (guest_id) {
                io.to(`guest_${guest_id}`).emit('admin:message_deleted', deleteData);
            }
        }
        
        // Broadcast conversation list update to admins to reflect last message change
        const [updatedConversation] = await connection.query(
            `SELECT c.id, c.user_id, c.guest_id, c.user_name, c.user_phone, c.last_message, c.last_message_time, c.has_unread_user_messages
             FROM chat_conversations c WHERE c.id = ?`,
            [conversationId]
        );
        if (updatedConversation.length > 0) {
            io.to('admin_room').emit('admin:update_conversation_list', updatedConversation[0]);
        }

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('[Socket Chat Error - Admin Delete]', error);
        socket.emit('error', { message: 'Không thể xóa tin nhắn.' });
    } finally {
        if (connection) connection.release();
    }
  });

  // Ensure Staff joins admin_room if they haven't already
  if (socket.user && ['admin', 'super_admin', 'cskh', 'agent', 'ROOT'].includes(socket.user.role)) {
    socket.join('admin_room');
  }
};
