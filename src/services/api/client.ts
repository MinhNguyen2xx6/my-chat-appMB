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
  timeout: 10000,
  headers: { 'x-client': 'mobile' },
});

let onLoggedOut: () => void = () => {};
export const setOnLoggedOut = (fn: () => void) => {
  onLoggedOut = fn;
};

export const refreshAccessToken = async (): Promise<string> => {
  const rt = await getRefreshToken();
  if (!rt) throw new Error('no refresh token');
  const { data } = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken: rt },
    { headers: { 'x-client': 'mobile' } },
  );
  setAccessToken(data.accessToken);
  return data.accessToken;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
        // nhiều request 401 cùng lúc thì chỉ refresh 1 lần
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