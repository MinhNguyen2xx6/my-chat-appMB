// src/services/api/auth.ts
import api from './client';
import {
  setAccessToken,
  saveRefreshToken,
  getRefreshToken,
  clearTokens,
} from '../../utils/storage';

export interface SignUpPayload {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Đăng ký
export const signUp = (payload: SignUpPayload) =>
  api.post('/auth/signup', payload);

// Đăng nhập → lưu token
export const signIn = async (username: string, password: string) => {
  const { data } = await api.post('/auth/signin', {
    username,
    password,
  });
  setAccessToken(data.accessToken);
  if (data.refreshToken) {
    await saveRefreshToken(data.refreshToken);
  }
  return data;
};

// Quên mật khẩu → gửi OTP qua email
export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email });

// Đặt lại mật khẩu bằng OTP
export const resetPassword = (payload: {
  email: string;
  otp: string;
  password: string;
}) => api.post('/auth/reset-password', payload);

// Đăng xuất
export const signOut = async () => {
  try {
    const rt = await getRefreshToken();
    if (rt) {
      await api.post('/auth/signout', { refreshToken: rt });
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[Auth] Không thể thu hồi refresh token trên server:', err);
    }
  } finally {
    await clearTokens();
  }
};
