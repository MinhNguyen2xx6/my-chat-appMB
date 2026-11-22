import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';

export const useSocketEvents = () => {
  const user = useAuthStore((s) => s.user);
  const handleIncomingMessage = useChatStore((s) => s.handleIncomingMessage);
  const handlePresenceUpdate = useChatStore((s) => s.handlePresenceUpdate);

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();
    if (!socket) {
      return;
    }

    // Lắng nghe tin nhắn mới từ server
    const onNewMessage = (data: { conversationId: string; message: any }) => {
      if (data?.conversationId && data?.message) {
        handleIncomingMessage(data.conversationId, data.message);
      }
    };

    // Lắng nghe cập nhật trạng thái online/offline
    const onPresenceUpdate = (data: {
      userId: string;
      online: boolean;
      lastSeenAt?: string;
    }) => {
      if (data?.userId) {
        handlePresenceUpdate(data.userId, data.online, data.lastSeenAt);
      }
    };

    socket.on('message:new', onNewMessage);
    socket.on('presence:update', onPresenceUpdate);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('presence:update', onPresenceUpdate);
    };
  }, [user, handleIncomingMessage, handlePresenceUpdate]);
};
