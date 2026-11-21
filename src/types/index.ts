export type MainTabKey =
  | 'messages'
  | 'contacts'
  | 'discover'
  | 'timeline'
  | 'profile';

export type MessageType =
  | 'text'
  | 'image'
  | 'file'
  | 'sticker'
  | 'voice'
  | 'location';

export type MessageStatus = 'sending' | 'sent' | 'seen';

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastActiveText?: string;
  role?: 'admin' | 'member';
  phone?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  content: string;
  createdAt: number; // epoch ms
  status: MessageStatus;
  // Optional payloads by type
  imageUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileExt?: string;
  stickerEmoji?: string;
  stickerLabel?: string;
  voiceDurationSec?: number;
  locationName?: string;
  locationAddress?: string;
}

export interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  avatarUrl?: string;
  members: Member[];
  lastMessageText: string;
  lastMessageSender?: string;
  lastMessageTime: number;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isBlocked?: boolean;
  isOnline?: boolean;
  lastActiveText?: string;
}

export interface Friend {
  id: string;
  friendshipId?: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastActiveText: string;
  bio?: string;
  conversationId?: string;
}

export interface FriendRequest {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  message: string;
  createdAt: number;
  mutualFriends: number;
}

export interface OfficialAccount {
  id: string;
  name: string;
  category: string;
  description: string;
  verified: boolean;
  avatarEmoji: string;
  followersText: string;
}

export interface TimelinePost {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  content: string;
  imageUrl?: string;
  likes: number;
  isLiked: boolean;
  commentsCount: number;
}

export type MainStackParamList = {
  MainShell: undefined;
  ChatDetail: { conversationId: string };
  ConversationInfo: { conversationId: string };
  FriendRequests: undefined;
  AddFriend: { initialTab?: 'phone' | 'qr' } | undefined;
  CreateGroup: undefined;
};
