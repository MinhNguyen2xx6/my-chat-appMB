import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../config/constants';
import { getAccessToken } from '../utils/storage';

let socket: Socket | null = null;

export const connectSocket = (): Socket | null => {
  const token = getAccessToken();
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Đã kết nối thành công:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Lỗi kết nối:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Ngắt kết nối:', reason);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const emitTyping = (conversationId: string, isTyping: boolean) => {
  if (socket?.connected) {
    socket.emit('typing', { conversationId, isTyping });
  }
};
