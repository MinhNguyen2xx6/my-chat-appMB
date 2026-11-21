// src/services/api/auth.ts
import api from './client';
import { setAccessToken, saveRefreshToken, clearTokens } from '../../utils/storage';

// Đăng ký
export const signUp = (payload: {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}) => api.post('/auth/signup', payload);

// Đăng nhập → lưu token
export const signIn = async (username: string, password: string) => {
  const { data } = await api.post('/auth/signin', {
    username,
    password,
  });
  // backend mobile trả về { accessToken, refreshToken }
  setAccessToken(data.accessToken);
  await saveRefreshToken(data.refreshToken);
  return data;
};

// Đăng xuất
export const signOut = async (refreshToken?: string | null) => {
  try {
    await api.post('/auth/signout', { refreshToken });
  } catch {}
  await clearTokens();
};
