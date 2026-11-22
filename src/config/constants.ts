import Config from 'react-native-config';

// Ưu tiên biến môi trường SERVER_URL từ .env (react-native-config).
// Dev (adb reverse): http://localhost:5001 | Production: bắt buộc HTTPS.
const DEFAULT_SERVER_URL = __DEV__
  ? 'http://localhost:5001'
  : 'https://my-chat-yknz.onrender.com';

const rawServerUrl = Config?.SERVER_URL?.trim() || DEFAULT_SERVER_URL;

export const SERVER_URL = rawServerUrl.replace(/\/+$/, '');
export const API_URL = `${SERVER_URL}/api`;
