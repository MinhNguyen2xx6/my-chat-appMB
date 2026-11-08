import * as Keychain from 'react-native-keychain';

// De access token trong ram, day refresh token luu ma hoa trong key chain
let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (t: string | null) => {
  accessToken = t;
};

export const saveRefreshToken = (t: string) =>
  Keychain.setGenericPassword('refreshToken', t, { service: 'refresh' });

export const getRefreshToken = async (): Promise<string | null> => {
  const c = await Keychain.getGenericPassword({ service: 'refresh' });
  return c ? c.password : null;
};

export const clearTokens = async () => {
  accessToken = null;
  await Keychain.resetGenericPassword({ service: 'refresh' });
};