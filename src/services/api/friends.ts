// src/services/api/friends.ts
import api from './client';

// Lấy danh sách bạn bè hiện tại
export const getFriends = () => api.get('/friends');

// Gửi lời mời kết bạn
export const sendFriendRequest = (userId: string) =>
  api.post('/friends/requests', { userId });

// Lấy các lời mời mà mình nhận được
export const getFriendRequests = () => api.get('/friends/requests');

// Chấp nhận lời mời
export const acceptFriendRequest = (requestId: string) =>
  api.post(`/friends/requests/${requestId}/accept`);

// Từ chối lời mời
export const declineFriendRequest = (requestId: string) =>
  api.post(`/friends/requests/${requestId}/decline`);

// Xóa bạn bè (friendshipId)
export const removeFriend = (friendshipId: string) =>
  api.delete(`/friends/${friendshipId}`);