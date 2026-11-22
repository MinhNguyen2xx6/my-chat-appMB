import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../../config/constants';
import { refreshSocketAuth } from '../socket';
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  saveRefreshToken,
  clearTokens,
} from '../../utils/storage';

// --------------------
// 1. Tạo Axios instance
// --------------------
export const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 giây, đủ cho cold-start
  headers: { 'x-client': 'mobile' },
});

// --------------------
// 2. Refresh token logic
// --------------------
export const refreshAccessToken = async (): Promise<string> => {
  const rt = await getRefreshToken();
  if (!rt) {
    throw new Error('no refresh token');
  }

  const { data } = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken: rt },
    { headers: { 'x-client': 'mobile' }, timeout: 30000 },
  );

  if (!data?.accessToken) {
    throw new Error('invalid refresh response');
  }

  setAccessToken(data.accessToken);
  // Hỗ trợ Refresh Token Rotation nếu server cấp refresh token mới
  if (data.refreshToken) {
    await saveRefreshToken(data.refreshToken);
  }
  refreshSocketAuth();
  return data.accessToken;
};

// --------------------
// 3. Request interceptor – đưa token vào mỗi request
// --------------------
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------------------
// 4. Response interceptor – tự động refresh khi 401
// --------------------
let refreshPromise: Promise<string> | null = null;
let logoutTriggered = false;
let onLoggedOut: () => void = () => {};

export const setOnLoggedOut = (fn: () => void) => {
  onLoggedOut = fn;
};

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) {
    return false;
  }
  return /^\/?auth\//.test(url);
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      try {
        // Không cho nhiều request refresh đồng thời
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newToken = await refreshPromise;
        logoutTriggered = false;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        if (!logoutTriggered) {
          logoutTriggered = true;
          await clearTokens();
          onLoggedOut();
          setTimeout(() => {
            logoutTriggered = false;
          }, 1000);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
