import { SERVER_URL } from '../config/constants';

/**
 * Chuẩn hóa URL media/avatar trả về từ backend hoặc file cục bộ thiết bị.
 * Chặn các scheme không an toàn và tự động gắn SERVER_URL cho đường dẫn tương đối.
 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return undefined;
  }

  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('file://') ||
    trimmed.startsWith('content://') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('http://')) {
    // Chỉ cho phép HTTP ở môi trường dev hoặc đúng host của SERVER_URL hiện tại
    if (__DEV__ || trimmed.startsWith(SERVER_URL)) {
      return trimmed;
    }
    return undefined;
  }

  if (trimmed.startsWith('/')) {
    return `${SERVER_URL}${trimmed}`;
  }

  return `${SERVER_URL}/${trimmed}`;
}
