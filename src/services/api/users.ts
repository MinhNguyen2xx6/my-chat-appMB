// src/services/api/users.ts
import api from './client';

// Lấy thông tin bản thân
export const getMyProfile = () => api.get('/users/me');

// Lấy mã QR kết bạn của bản thân (tự sinh cho cả tài khoản cũ lẫn mới)
export const getMyQrCode = () => api.get('/users/me/qr');

// Tìm người dùng bằng mã QR
export const findUserByQr = (code: string) =>
  api.get('/users/by-qr', { params: { code } });

// Quét mã QR từ hình ảnh tải lên từ thư viện
export const scanQrImage = (uri: string, type?: string, fileName?: string) => {
  const formData = new FormData();
  formData.append('image', {
    uri,
    type: type || 'image/jpeg',
    name: fileName || `qr_${Date.now()}.jpg`,
  } as any);
  return api.post('/users/scan-qr-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Tìm kiếm người dùng theo tên (hỗ trợ kết bạn)
export const searchUsersByName = (query: string) =>
  api.get('/users/search', { params: { q: query } });
