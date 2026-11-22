import * as Keychain from 'react-native-keychain';

// Giữ access token trong RAM, lưu mã hóa refresh token trong Keychain/Keystore
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

export const saveRefreshToken = (t: string) =>
  Keychain.setGenericPassword('refreshToken', t, {
    service: 'refresh',
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });

export const getRefreshToken = async (): Promise<string | null> => {
  const c = await Keychain.getGenericPassword({ service: 'refresh' });
  return c ? c.password : null;
};

export const clearTokens = async () => {
  accessToken = null;
  await Keychain.resetGenericPassword({ service: 'refresh' });
};
