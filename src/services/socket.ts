import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../config/constants';
import { getAccessToken } from '../utils/storage';

let socket: Socket | null = null;

export const connectSocket = (): Socket | null => {
  const token = getAccessToken();
  if (!token) {
    disconnectSocket();
    return null;
  }

  if (socket) {
    if (socket.connected) {
      return socket;
    }
    // Dọn kết nối cũ đang lỗi/treo trước khi khởi tạo mới để tránh socket leak
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SERVER_URL, {
    // Callback động đảm bảo mỗi lần reconnect đều dùng access token mới nhất
    auth: (cb) => {
      cb({ token: getAccessToken() });
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    if (__DEV__) {
      console.log('[Socket] Đã kết nối thành công:', socket?.id);
    }
  });

  socket.on('connect_error', (err) => {
    if (__DEV__) {
      console.warn('[Socket] Lỗi kết nối:', err.message);
    }
  });

  socket.on('disconnect', (reason) => {
    if (__DEV__) {
      console.log('[Socket] Ngắt kết nối:', reason);
    }
  });

  return socket;
};

/**
 * Gọi sau khi accessToken được làm mới (refresh) để đồng bộ lại kết nối socket.
 */
export const refreshSocketAuth = () => {
  const token = getAccessToken();
  if (!token || !socket) {
    return;
  }
  if (!socket.connected) {
    socket.connect();
  }
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const emitTyping = (conversationId: string, isTyping: boolean) => {
  if (socket?.connected) {
    socket.emit('typing', { conversationId, isTyping });
  }
};
