// Genymotion: máy host là 10.0.3.2. Khi deploy thì đổi sang https://api.minhng.id.com

//export const SERVER_URL = 'http://10.0.3.2:5001';
//export const API_URL = `${SERVER_URL}/api`;


//export const SERVER_URL = 'https://my-chat-yknz.onrender.com';
//export const API_URL = `${SERVER_URL}/api`;


import { Platform } from 'react-native';

// Khi dùng adb reverse (cho cả máy thật cắm USB lẫn giả lập), điện thoại gọi trực tiếp localhost:5001 tới máy tính
export const SERVER_URL = 'http://localhost:5001';
export const API_URL = `${SERVER_URL}/api`;

