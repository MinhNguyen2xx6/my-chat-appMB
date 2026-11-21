// src/services/api/conversations.ts
import api from './client';

// Mở hoặc tạo hội thoại với 1 người bạn bằng userId
export const openConversation = (userId: string) =>
  api.post('/conversations', { userId });

// Lấy danh sách hội thoại có tin nhắn
export const getConversations = () => api.get('/conversations');

// Lấy tin nhắn của một hội thoại (mới nhất trước)
export const getMessages = (convId: string, before?: string, limit: number = 30) =>
  api.get(`/conversations/${convId}/messages`, {
    params: { before, limit },
  });

// Gửi tin nhắn văn bản
export const sendTextMessage = (convId: string, text: string) =>
  api.post(`/conversations/${convId}/messages`, { text });

// Gửi tin nhắn ảnh (FormData)
export const sendImageMessage = (convId: string, formData: FormData) =>
  api.post(`/conversations/${convId}/messages/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
