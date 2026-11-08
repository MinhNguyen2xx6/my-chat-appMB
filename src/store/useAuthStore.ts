import { create } from 'zustand';
import api, { refreshAccessToken, setOnLoggedOut } from '../services/api/client';
import {
  saveRefreshToken,
  getRefreshToken,
  clearTokens,
  setAccessToken,
} from '../utils/storage';

interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
}

interface SignUpPayload {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  loading: boolean; // true lúc mới mở app, đang kiểm tra đăng nhập
  init: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  // Gọi 1 lần khi mở app
  init: async () => {
    try {
      if (await getRefreshToken()) {
        await refreshAccessToken();
        const { data } = await api.get('/users/me');
        set({ user: data.user });
      }
    } catch {
      await clearTokens();
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    const { data } = await api.post('/auth/signin', { username, password });
    setAccessToken(data.accessToken);
    await saveRefreshToken(data.refreshToken);
    const me = await api.get('/users/me');
    set({ user: me.data.user });
  },

  signUp: async (payload) => {
    await api.post('/auth/signup', payload); // trả 204
  },

  signOut: async () => {
    try {
      const rt = await getRefreshToken();
      await api.post('/auth/signout', { refreshToken: rt });
    } catch {}
    await clearTokens();
    set({ user: null });
  },
}));

// Khi refresh thất bại, client.ts gọi hàm này để đẩy về màn đăng nhập
setOnLoggedOut(() => useAuthStore.setState({ user: null }));