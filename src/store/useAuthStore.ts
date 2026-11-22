import { create } from 'zustand';
import api, { refreshAccessToken, setOnLoggedOut } from '../services/api/client';
import * as authApi from '../services/api/auth';
import { disconnectSocket } from '../services/socket';
import { useChatStore } from './useChatStore';
import { getRefreshToken, clearTokens } from '../utils/storage';

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean; // true lúc mới mở app, đang kiểm tra đăng nhập
  init: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: authApi.SignUpPayload) => Promise<void>;
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
      disconnectSocket();
      await clearTokens();
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    await authApi.signIn(username, password);
    const me = await api.get('/users/me');
    set({ user: me.data.user });
  },

  signUp: async (payload) => {
    await authApi.signUp(payload); // trả 204
  },

  signOut: async () => {
    disconnectSocket();
    await authApi.signOut();
    useChatStore.getState().reset();
    set({ user: null });
  },
}));

// Khi refresh thất bại, client.ts gọi hàm này để đẩy về màn đăng nhập
setOnLoggedOut(() => {
  disconnectSocket();
  useChatStore.getState().reset();
  useAuthStore.setState({ user: null });
});
