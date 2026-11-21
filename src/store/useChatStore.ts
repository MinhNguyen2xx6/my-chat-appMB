import { create } from 'zustand';
import { SERVER_URL } from '../config/constants';
import * as convApi from '../services/api/conversations';
import * as friendApi from '../services/api/friends';
import { useAuthStore } from './useAuthStore';
import {
  Conversation,
  Friend,
  FriendRequest,
  Member,
  Message,
  MessageType,
  OfficialAccount,
  TimelinePost,
} from '../types';

export const CURRENT_USER_ID = 'me';

const INITIAL_OAS: OfficialAccount[] = [
  {
    id: 'oa1',
    name: 'MyChat Official',
    category: 'Công nghệ',
    description: 'Cập nhật tính năng mới và mẹo sử dụng MyChat',
    verified: true,
    avatarEmoji: '💬',
    followersText: '128K quan tâm',
  },
  {
    id: 'oa2',
    name: 'Thời Tiết Việt Nam',
    category: 'Tiện ích',
    description: 'Dự báo thời tiết chính xác theo vị trí mỗi sáng',
    verified: true,
    avatarEmoji: '🌤️',
    followersText: '2.4M quan tâm',
  },
];

const INITIAL_TIMELINE_POSTS: TimelinePost[] = [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'MyChat',
    createdAt: Date.now() - 3600000,
    content: 'Chào mừng bạn đến với MyChat! Kết nối và nhắn tin thời gian thực với bạn bè ngay.',
    likes: 12,
    isLiked: false,
    commentsCount: 2,
  },
];

export const DIRECTORY_USERS: any[] = [];

interface SendMessagePayload {
  conversationId: string;
  type: MessageType;
  content: string;
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

interface ChatStoreState {
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  friends: Friend[];
  friendRequests: FriendRequest[];
  officialAccounts: OfficialAccount[];
  timelinePosts: TimelinePost[];
  sentFriendPhones: string[];
  loadingConversations: boolean;
  loadingFriends: boolean;
  loadingMessages: Record<string, boolean>;

  // Data fetching
  fetchConversations: () => Promise<void>;
  fetchFriends: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  fetchMessages: (convId: string) => Promise<void>;

  // Conversation actions
  togglePinConversation: (id: string) => void;
  toggleMuteConversation: (id: string) => void;
  markAsRead: (id: string) => void;
  toggleReadStatus: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearConversationHistory: (id: string) => void;
  leaveGroup: (id: string) => void;
  toggleBlockConversation: (id: string) => void;
  createGroup: (name: string, memberIds: string[]) => string;
  getOrCreateDirectConversation: (friend: Friend) => Promise<string>;

  // Messaging actions
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  handleIncomingMessage: (conversationId: string, backendMsg: any) => void;
  handlePresenceUpdate: (userId: string, isOnline: boolean, lastSeenAt?: string) => void;

  // Friends actions
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  sendFriendRequestByPhone: (userIdOrUsername: string) => Promise<void>;
  sendFriendRequestById: (userId: string) => Promise<void>;

  // Timeline actions
  toggleLikePost: (postId: string) => void;
  addTimelinePost: (content: string, authorName: string) => void;

  // Reset store (khi logout)
  reset: () => void;
}

const mapBackendConversation = (c: any): Conversation => {
  const p = c.participant || {};
  const convId = String(c._id);
  const avatarUrl = p.avatarUrl
    ? (p.avatarUrl.startsWith('http') ? p.avatarUrl : `${SERVER_URL}${p.avatarUrl}`)
    : undefined;

  const isOnline = Boolean(p.online);
  return {
    id: convId,
    name: p.displayName || p.username || 'Người dùng MyChat',
    isGroup: false,
    avatarUrl,
    members: [
      {
        id: String(p._id),
        name: p.displayName || p.username || 'Người dùng',
        avatarUrl,
        isOnline,
        lastActiveText: isOnline ? 'Đang hoạt động' : 'Hoạt động gần đây',
      },
    ],
    lastMessageText:
      c.lastMessage?.text ||
      (c.lastMessage?.type === 'image' ? '[Hình ảnh]' : 'Bắt đầu cuộc trò chuyện'),
    lastMessageSender: c.lastMessage?.sender,
    lastMessageTime: c.lastMessage?.createdAt
      ? new Date(c.lastMessage.createdAt).getTime()
      : (c.updatedAt ? new Date(c.updatedAt).getTime() : Date.now()),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline,
    lastActiveText: isOnline ? 'Đang hoạt động' : 'Hoạt động gần đây',
  };
};

const mapBackendMessage = (m: any, currentUserId?: string): Message => {
  const senderId = String(m.sender?._id || m.sender);
  const isMe = currentUserId ? senderId === String(currentUserId) : false;
  const imageUrl = m.imageUrl
    ? (m.imageUrl.startsWith('http') ? m.imageUrl : `${SERVER_URL}${m.imageUrl}`)
    : undefined;

  return {
    id: String(m._id),
    conversationId: String(m.conversation),
    senderId,
    senderName: isMe ? 'Bạn' : '',
    type: m.type === 'image' ? 'image' : 'text',
    content: m.text || (m.type === 'image' ? 'Hình ảnh' : ''),
    imageUrl,
    createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
    status: 'seen',
  };
};

const mapBackendFriend = (f: any): Friend => {
  const u = f.user || {};
  const avatarUrl = u.avatarUrl
    ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : `${SERVER_URL}${u.avatarUrl}`)
    : undefined;

  return {
    id: String(u._id),
    friendshipId: String(f.friendshipId),
    name: u.displayName || u.username || 'Bạn bè',
    phone: u.username || '',
    avatarUrl,
    isOnline: false,
    lastActiveText: 'Hoạt động gần đây',
    bio: `@${u.username}`,
  };
};

const mapBackendRequest = (r: any): FriendRequest => {
  const u = r.user || {};
  const avatarUrl = u.avatarUrl
    ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : `${SERVER_URL}${u.avatarUrl}`)
    : undefined;

  return {
    id: String(r._id),
    userId: String(u._id),
    name: u.displayName || u.username || 'Người dùng',
    phone: u.username || '',
    avatarUrl,
    message: `Lời mời kết bạn từ @${u.username || 'bạn bè'}`,
    createdAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
    mutualFriends: 0,
  };
};

export const useChatStore = create<ChatStoreState>((set, get) => ({
  conversations: [],
  messagesByConversation: {},
  friends: [],
  friendRequests: [],
  officialAccounts: INITIAL_OAS,
  timelinePosts: INITIAL_TIMELINE_POSTS,
  sentFriendPhones: [],
  loadingConversations: false,
  loadingFriends: false,
  loadingMessages: {},

  fetchConversations: async () => {
    try {
      set({ loadingConversations: true });
      const { data } = await convApi.getConversations();
      if (Array.isArray(data.conversations)) {
        const conversations = data.conversations.map(mapBackendConversation);
        set({ conversations });
      }
    } catch (err) {
      console.warn('Lỗi fetchConversations:', err);
    } finally {
      set({ loadingConversations: false });
    }
  },

  fetchFriends: async () => {
    try {
      set({ loadingFriends: true });
      const { data } = await friendApi.getFriends();
      if (Array.isArray(data.friends)) {
        const friends = data.friends.map(mapBackendFriend);
        set({ friends });
      }
    } catch (err) {
      console.warn('Lỗi fetchFriends:', err);
    } finally {
      set({ loadingFriends: false });
    }
  },

  fetchFriendRequests: async () => {
    try {
      const { data } = await friendApi.getFriendRequests();
      if (Array.isArray(data.requests)) {
        const friendRequests = data.requests.map(mapBackendRequest);
        set({ friendRequests });
      }
    } catch (err) {
      console.warn('Lỗi fetchFriendRequests:', err);
    }
  },

  fetchMessages: async (convId: string) => {
    try {
      set((s) => ({
        loadingMessages: { ...s.loadingMessages, [convId]: true },
      }));
      const { data } = await convApi.getMessages(convId);
      if (Array.isArray(data.messages)) {
        const myId = useAuthStore.getState().user?._id;
        // Backend trả về mảng sắp xếp mới nhất trước (desc), đảo lại để hiển thị từ cũ đến mới
        const rawMsgs = [...data.messages].reverse();
        const mapped = rawMsgs.map((m) => mapBackendMessage(m, myId));
        // Lọc trùng ID
        const uniqueMessages = Array.from(
          new Map(mapped.map((m) => [m.id, m])).values(),
        );
        set((s) => ({
          messagesByConversation: {
            ...s.messagesByConversation,
            [convId]: uniqueMessages,
          },
        }));
      }
    } catch (err) {
      console.warn('Lỗi fetchMessages:', err);
    } finally {
      set((s) => ({
        loadingMessages: { ...s.loadingMessages, [convId]: false },
      }));
    }
  },

  togglePinConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, isPinned: !c.isPinned } : c,
      ),
    })),

  toggleMuteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, isMuted: !c.isMuted } : c,
      ),
    })),

  markAsRead: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c,
      ),
    })),

  toggleReadStatus: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id
          ? { ...c, unreadCount: c.unreadCount > 0 ? 0 : 1 }
          : c,
      ),
    })),

  deleteConversation: (id) =>
    set((state) => {
      const nextMessages = { ...state.messagesByConversation };
      delete nextMessages[id];
      return {
        conversations: state.conversations.filter((c) => c.id !== id),
        messagesByConversation: nextMessages,
      };
    }),

  clearConversationHistory: (id) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [id]: [],
      },
      conversations: state.conversations.map((c) =>
        c.id === id
          ? { ...c, lastMessageText: 'Chưa có tin nhắn', unreadCount: 0 }
          : c,
      ),
    })),

  leaveGroup: (id) => {
    get().deleteConversation(id);
  },

  toggleBlockConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, isBlocked: !c.isBlocked } : c,
      ),
    })),

  createGroup: (name, memberIds) => {
    const id = `g_${Date.now()}`;
    return id;
  },

  getOrCreateDirectConversation: async (friend) => {
    try {
      const { data } = await convApi.openConversation(friend.id);
      const conv = data.conversation;
      if (conv?._id) {
        const convId = String(conv._id);
        const p = conv.participant || {};
        const newConv: Conversation = {
          id: convId,
          name: p.displayName || p.username || friend.name,
          isGroup: false,
          avatarUrl: friend.avatarUrl,
          members: [
            {
              id: friend.id,
              name: p.displayName || p.username || friend.name,
              avatarUrl: friend.avatarUrl,
              isOnline: friend.isOnline,
              lastActiveText: friend.lastActiveText,
            },
          ],
          lastMessageText: '',
          lastMessageTime: Date.now(),
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isOnline: friend.isOnline,
          lastActiveText: friend.lastActiveText,
        };
        set((s) => {
          if (!s.conversations.some((c) => c.id === convId)) {
            return { conversations: [newConv, ...s.conversations] };
          }
          return s;
        });
        await get().fetchConversations();
        return convId;
      }
    } catch (err) {
      console.warn('Lỗi getOrCreateDirectConversation:', err);
    }
    return '';
  },

  sendMessage: async (payload) => {
    const myId = useAuthStore.getState().user?._id || CURRENT_USER_ID;
    const tempId = `temp_${Date.now()}`;
    const now = Date.now();

    const optimisticMsg: Message = {
      id: tempId,
      conversationId: payload.conversationId,
      senderId: myId,
      senderName: 'Bạn',
      type: payload.type,
      content: payload.content,
      createdAt: now,
      status: 'sending',
      imageUrl: payload.imageUrl,
    };

    set((state) => {
      const prevMsgs = state.messagesByConversation[payload.conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [payload.conversationId]: [...prevMsgs, optimisticMsg],
        },
        conversations: state.conversations.map((c) =>
          c.id === payload.conversationId
            ? {
                ...c,
                lastMessageText: payload.content || (payload.type === 'image' ? '[Hình ảnh]' : ''),
                lastMessageSender: 'Bạn',
                lastMessageTime: now,
                unreadCount: 0,
              }
            : c,
        ),
      };
    });

    try {
      const { data } = await convApi.sendTextMessage(
        payload.conversationId,
        payload.content,
      );
      if (data?.message?._id) {
        const realId = String(data.message._id);
        set((state) => {
          const list = state.messagesByConversation[payload.conversationId] ?? [];
          const alreadyHasReal = list.some((m) => m.id === realId);
          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [payload.conversationId]: alreadyHasReal
                ? list.filter((m) => m.id !== tempId)
                : list.map((m) =>
                    m.id === tempId ? { ...m, id: realId, status: 'sent' } : m,
                  ),
            },
          };
        });
      }
    } catch (err) {
      console.warn('Lỗi gửi tin nhắn:', err);
    }
  },

  handleIncomingMessage: (conversationId: string, backendMsg: any) => {
    const myId = useAuthStore.getState().user?._id;
    const msg = mapBackendMessage(backendMsg, myId);

    set((state) => {
      const list = state.messagesByConversation[conversationId] ?? [];
      // Tránh trùng tin nhắn nếu đã có ID này
      if (list.some((m) => m.id === msg.id)) {
        return state;
      }

      // Nếu tin nhắn là từ chính mình (server echo qua socket), thay thế tin nhắn tạm (optimistic)
      const tempIndex = list.findIndex(
        (m) =>
          m.id.startsWith('temp_') &&
          m.senderId === msg.senderId &&
          m.content === msg.content,
      );

      let nextList: Message[];
      if (tempIndex !== -1) {
        nextList = [...list];
        nextList[tempIndex] = msg;
      } else {
        nextList = [...list, msg];
      }

      // Cập nhật hoặc bổ sung conversation
      const convExists = state.conversations.some((c) => c.id === conversationId);
      const updatedConversations = convExists
        ? state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessageText: msg.content || (msg.type === 'image' ? '[Hình ảnh]' : ''),
                  lastMessageTime: msg.createdAt,
                  lastMessageSender: msg.senderName,
                }
              : c,
          )
        : state.conversations;

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: nextList,
        },
        conversations: updatedConversations,
      };
    });

    if (!get().conversations.some((c) => c.id === conversationId)) {
      get().fetchConversations();
    }
  },

  handlePresenceUpdate: (userId: string, isOnline: boolean, lastSeenAt?: string) => {
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === userId
          ? {
              ...f,
              isOnline,
              lastActiveText: isOnline ? 'Đang hoạt động' : 'Hoạt động gần đây',
            }
          : f,
      ),
      conversations: state.conversations.map((c) => {
        if (c.members.some((m) => m.id === userId)) {
          return {
            ...c,
            isOnline,
            lastActiveText: isOnline ? 'Đang hoạt động' : 'Hoạt động gần đây',
            members: c.members.map((m) =>
              m.id === userId ? { ...m, isOnline } : m,
            ),
          };
        }
        return c;
      }),
    }));
  },

  acceptFriendRequest: async (requestId: string) => {
    try {
      await friendApi.acceptFriendRequest(requestId);
      set((state) => ({
        friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
      }));
      await get().fetchFriends();
      await get().fetchConversations();
    } catch (err) {
      console.warn('Lỗi acceptFriendRequest:', err);
    }
  },

  declineFriendRequest: async (requestId: string) => {
    try {
      await friendApi.declineFriendRequest(requestId);
      set((state) => ({
        friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
      }));
    } catch (err) {
      console.warn('Lỗi declineFriendRequest:', err);
    }
  },

  sendFriendRequestByPhone: async (userIdOrUsername: string) => {
    await get().sendFriendRequestById(userIdOrUsername);
  },

  sendFriendRequestById: async (userId: string) => {
    try {
      await friendApi.sendFriendRequest(userId);
      set((state) => ({
        sentFriendPhones: [...state.sentFriendPhones, userId],
      }));
    } catch (err) {
      console.warn('Lỗi sendFriendRequestById:', err);
      throw err;
    }
  },

  toggleLikePost: (postId) =>
    set((state) => ({
      timelinePosts: state.timelinePosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    })),

  addTimelinePost: (content, authorName) =>
    set((state) => ({
      timelinePosts: [
        {
          id: `p_${Date.now()}`,
          authorId: useAuthStore.getState().user?._id || CURRENT_USER_ID,
          authorName,
          createdAt: Date.now(),
          content,
          likes: 0,
          isLiked: false,
          commentsCount: 0,
        },
        ...state.timelinePosts,
      ],
    })),

  reset: () =>
    set({
      conversations: [],
      messagesByConversation: {},
      friends: [],
      friendRequests: [],
      sentFriendPhones: [],
    }),
}));

