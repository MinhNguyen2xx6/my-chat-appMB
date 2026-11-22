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

// Lấy thông tin 1 cuộc trò chuyện
export const getConversationById = (convId: string) =>
  api.get(`/conversations/${convId}`);

// Xóa hoàn toàn một cuộc trò chuyện
export const deleteConversation = (convId: string) =>
  api.delete(`/conversations/${convId}`);

// Xóa lịch sử tin nhắn của một cuộc trò chuyện
export const clearMessages = (convId: string) =>
  api.delete(`/conversations/${convId}/messages`);

// Gửi tin nhắn văn bản
export const sendTextMessage = (convId: string, text: string) =>
  api.post(`/conversations/${convId}/messages`, { text });

// Gửi tin nhắn ảnh (FormData)
export const sendImageMessage = (convId: string, formData: FormData) =>
  api.post(`/conversations/${convId}/messages/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
