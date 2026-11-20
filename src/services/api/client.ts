import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../../config/constants';
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  clearTokens,
} from '../../utils/storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 1. Tăng timeout lên 60s cho Render Cold Start
  headers: { 'x-client': 'mobile' },
});

let onLoggedOut: () => void = () => {};
export const setOnLoggedOut = (fn: () => void) => {
  onLoggedOut = fn;
};

export const refreshAccessToken = async (): Promise<string> => {
  const rt = await getRefreshToken();
  if (!rt) throw new Error('no refresh token');
  
  // Dùng api instance hoặc giữ nguyên axios root tùy cấu hình route backend
  const { data } = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken: rt },
    { headers: { 'x-client': 'mobile' } },
  );
  
  await setAccessToken(data.accessToken); // Thêm await nếu setAccessToken là async
  return data.accessToken;
};

// 2. Chuyển callback thành async/await để lấy token đúng cách
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRoute = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        // Xử lý chống trùng lặp request refresh token
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        await clearTokens();
        onLoggedOut();
      }
    }
    return Promise.reject(error);
  },
);

export default api;