// src/services/api/users.ts
import api from './client';

// Lấy thông tin bản thân
export const getMyProfile = () => api.get('/users/me');

// Tìm kiếm người dùng theo tên (hỗ trợ kết bạn)
export const searchUsersByName = (query: string) =>
  api.get('/users/search', { params: { q: query } });
