import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../../config/constants';
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  clearTokens,
} from '../../utils/storage';

// --------------------
// 1. Tạo Axios instance
// --------------------
export const api = axios.create({
  baseURL: API_URL,                     // URL backend (được đọc từ constants.ts)
  timeout: 60000,                       // 60 giây, đủ cho cold‑start
  headers: { 'x-client': 'mobile' },   // backend dùng tiêu đề này để phân biệt client
});

// --------------------
// 2. Refresh token logic
// --------------------
export const refreshAccessToken = async (): Promise<string> => {
  const rt = await getRefreshToken();
  if (!rt) throw new Error('no refresh token');

  // Gửi yêu cầu refresh tới backend
  const { data } = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken: rt },
    { headers: { 'x-client': 'mobile' } }
  );

  await setAccessToken(data.accessToken);
  return data.accessToken;
};

// --------------------
// 3. Request interceptor – đưa token vào mỗi request
// --------------------
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --------------------
// 4. Response interceptor – tự động refresh khi 401
// --------------------
let refreshPromise: Promise<string> | null = null;
let onLoggedOut: () => void = () => {};

export const setOnLoggedOut = (fn: () => void) => {
  onLoggedOut = fn;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRoute = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        // Không cho nhiều request refresh đồng thời
        refreshPromise ??= refreshAccessToken().finally(() => (refreshPromise = null));
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);                     // retry request
      } catch {
        await clearTokens();
        onLoggedOut();                           // thông báo UI logout
      }
    }
    return Promise.reject(error);
  }
);

export default api;