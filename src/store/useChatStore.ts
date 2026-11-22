import { create } from 'zustand';
import * as convApi from '../services/api/conversations';
import * as friendApi from '../services/api/friends';
import { useAuthStore } from './useAuthStore';
import { formatConversationTime } from '../utils/formatDate';
import { resolveMediaUrl } from '../utils/url';
import {
  Conversation,
  Friend,
  FriendRequest,
  Message,
  MessageType,
  OfficialAccount,
  TimelinePost,
} from '../types';

export const CURRENT_USER_ID = 'me';

const PAGE_SIZE = 30;

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

const createInitialTimelinePosts = (): TimelinePost[] => [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'MyChat',
    createdAt: Date.now() - 3600000,
    content:
      'Chào mừng bạn đến với MyChat! Tính năng Nhật ký đang trong quá trình phát triển và sẽ sớm đồng bộ dữ liệu trực tuyến.',
    likes: 12,
    isLiked: false,
    commentsCount: 2,
  },
];

const makeTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const formatLastSeenText = (isOnline: boolean, lastSeenAt?: string): string => {
  if (isOnline) {
    return 'Đang hoạt động';
  }
  if (lastSeenAt) {
    const ts = new Date(lastSeenAt).getTime();
    if (Number.isFinite(ts)) {
      return `Hoạt động ${formatConversationTime(ts)}`;
    }
  }
  return 'Hoạt động gần đây';
};

export interface SendMessagePayload {
  conversationId: string;
  type: MessageType;
  content: string;
  imageUrl?: string;
  imageType?: string;
  imageFileName?: string;
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
  activeConversationId: string | null;
  loadingConversations: boolean;
  loadingFriends: boolean;
  loadingMessages: Record<string, boolean>;
  loadingMoreMessages: Record<string, boolean>;
  hasMoreMessages: Record<string, boolean>;
  nextCursorByConversation: Record<string, string | undefined>;

  // Data fetching
  fetchConversations: () => Promise<void>;
  fetchFriends: () => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  fetchMessages: (convId: string) => Promise<void>;
  loadMoreMessages: (convId: string) => Promise<void>;
  fetchConversationById: (id: string) => Promise<Conversation | null>;

  // Conversation actions
  setActiveConversationId: (id: string | null) => void;
  togglePinConversation: (id: string) => void;
  toggleMuteConversation: (id: string) => void;
  markAsRead: (id: string) => void;
  toggleReadStatus: (id: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  clearConversationHistory: (id: string) => Promise<void>;
  leaveGroup: (id: string) => Promise<void>;
  toggleBlockConversation: (id: string) => void;
  getOrCreateDirectConversation: (friend: Friend) => Promise<string>;

  // Messaging actions
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  retryMessage: (conversationId: string, messageId: string) => Promise<void>;
  handleIncomingMessage: (conversationId: string, backendMsg: any) => void;
  handlePresenceUpdate: (
    userId: string,
    isOnline: boolean,
    lastSeenAt?: string,
  ) => void;

  // Friends actions
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  sendFriendRequestByPhone: (userIdOrUsername: string) => Promise<void>;
  sendFriendRequestById: (userId: string) => Promise<any>;
  removeFriend: (friendshipId: string) => Promise<void>;

  // Timeline actions (local preview - đang phát triển)
  toggleLikePost: (postId: string) => void;
  addTimelinePost: (content: string, authorName: string) => void;

  // Reset store (khi logout)
  reset: () => void;
}

const mapBackendConversation = (
  c: any,
  existing?: Conversation,
): Conversation => {
  const p = c.participant || {};
  const convId = String(c._id);
  const avatarUrl = resolveMediaUrl(p.avatarUrl);
  const isOnline = Boolean(p.online);
  const lastActiveText = formatLastSeenText(isOnline, p.lastSeenAt);

  const serverUnread =
    typeof c.unreadCount === 'number' ? c.unreadCount : undefined;

  return {
    id: convId,
    name: p.displayName || p.username || 'Người dùng MyChat',
    isGroup: Boolean(c.isGroup),
    avatarUrl,
    members: [
      {
        id: String(p._id),
        name: p.displayName || p.username || 'Người dùng',
        avatarUrl,
        isOnline,
        lastActiveText,
      },
    ],
    lastMessageText:
      c.lastMessage?.text ||
      (c.lastMessage?.type === 'image'
        ? '[Hình ảnh]'
        : existing?.lastMessageText || 'Bắt đầu cuộc trò chuyện'),
    lastMessageSender: c.lastMessage?.sender ?? existing?.lastMessageSender,
    lastMessageTime: c.lastMessage?.createdAt
      ? new Date(c.lastMessage.createdAt).getTime()
      : c.updatedAt
        ? new Date(c.updatedAt).getTime()
        : existing?.lastMessageTime ?? Date.now(),
    unreadCount: serverUnread ?? existing?.unreadCount ?? 0,
    isPinned: existing?.isPinned ?? false,
    isMuted: existing?.isMuted ?? false,
    isBlocked: existing?.isBlocked,
    isOnline,
    lastActiveText,
  };
};

const mapBackendMessage = (m: any, currentUserId?: string): Message => {
  const senderId = String(m.sender?._id || m.sender);
  const isMe = currentUserId ? senderId === String(currentUserId) : false;
  const imageUrl = resolveMediaUrl(m.imageUrl);
  const senderName = isMe
    ? 'Bạn'
    : m.sender?.displayName || m.sender?.username || '';

  return {
    id: String(m._id),
    conversationId: String(m.conversation),
    senderId,
    senderName,
    type: m.type === 'image' ? 'image' : 'text',
    content: m.text || (m.type === 'image' ? '[Hình ảnh]' : ''),
    imageUrl,
    createdAt: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
    status: 'seen',
  };
};

const mapBackendFriend = (f: any): Friend => {
  const u = f.user || {};
  const avatarUrl = resolveMediaUrl(u.avatarUrl);
  const isOnline = Boolean(u.online);

  return {
    id: String(u._id),
    friendshipId: String(f.friendshipId),
    name: u.displayName || u.username || 'Bạn bè',
    phone: u.username || '',
    avatarUrl,
    isOnline,
    lastActiveText: formatLastSeenText(isOnline, u.lastSeenAt),
    bio: u.username ? `@${u.username}` : undefined,
  };
};

const mapBackendRequest = (r: any): FriendRequest => {
  const u = r.user || {};
  const avatarUrl = resolveMediaUrl(u.avatarUrl);

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
  timelinePosts: createInitialTimelinePosts(),
  sentFriendPhones: [],
  activeConversationId: null,
  loadingConversations: false,
  loadingFriends: false,
  loadingMessages: {},
  loadingMoreMessages: {},
  hasMoreMessages: {},
  nextCursorByConversation: {},

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  fetchConversations: async () => {
    try {
      set({ loadingConversations: true });
      const { data } = await convApi.getConversations();
      if (Array.isArray(data.conversations)) {
        set((state) => {
          const existingMap = new Map(
            state.conversations.map((c) => [c.id, c]),
          );
          const serverConvs: Conversation[] = data.conversations.map((c: any) =>
            mapBackendConversation(c, existingMap.get(String(c._id))),
          );
          const serverIds = new Set(serverConvs.map((c) => c.id));
          // Giữ lại các cuộc hội thoại vừa mở chưa có tin nhắn trên server
          const pendingConvs = state.conversations.filter(
            (c) =>
              !serverIds.has(c.id) &&
              (!c.lastMessageText ||
                c.lastMessageText === 'Bắt đầu cuộc trò chuyện' ||
                c.lastMessageText === ''),
          );
          return { conversations: [...serverConvs, ...pendingConvs] };
        });
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('Lỗi fetchConversations:', err);
      }
    } finally {
      set({ loadingConversations: false });
    }
  },

  fetchConversationById: async (id: string) => {
    try {
      const { data } = await convApi.getConversationById(id);
      if (data?.conversation) {
        const existing = get().conversations.find((c) => c.id === id);
        const mapped = mapBackendConversation(data.conversation, existing);
        set((s) => ({
          conversations: s.conversations.some((c) => c.id === id)
            ? s.conversations.map((c) => (c.id === id ? mapped : c))
            : [mapped, ...s.conversations],
        }));
        return mapped;
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('Lỗi fetchConversationById:', err);
      }
    }
    return null;
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
      if (__DEV__) {
        console.warn('Lỗi fetchFriends:', err);
      }
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
      if (__DEV__) {
        console.warn('Lỗi fetchFriendRequests:', err);
      }
    }
  },

  fetchMessages: async (convId: string) => {
    try {
      set((s) => ({
        loadingMessages: { ...s.loadingMessages, [convId]: true },
      }));
      const { data } = await convApi.getMessages(convId, undefined, PAGE_SIZE);
      if (Array.isArray(data.messages)) {
        const myId = useAuthStore.getState().user?._id;
        // Backend trả về mảng sắp xếp mới nhất trước (desc), đảo lại để hiển thị từ cũ đến mới
        const rawMsgs = [...data.messages].reverse();
        const mapped = rawMsgs.map((m) => mapBackendMessage(m, myId));
        const uniqueMessages = Array.from(
          new Map(mapped.map((m) => [m.id, m])).values(),
        );
        const hasMore =
          typeof data.hasMore === 'boolean'
            ? data.hasMore
            : data.messages.length >= PAGE_SIZE;
        const nextCursor =
          data.nextCursor ??
          (rawMsgs[0]?._id ? String(rawMsgs[0]._id) : undefined);

        set((s) => {
          // Giữ lại các tin nhắn tạm đang gửi lỗi (failed) để người dùng có thể bấm thử lại
          const failedLocal = (s.messagesByConversation[convId] ?? []).filter(
            (m) => m.status === 'failed',
          );
          return {
            messagesByConversation: {
              ...s.messagesByConversation,
              [convId]: [...uniqueMessages, ...failedLocal],
            },
            hasMoreMessages: {
              ...s.hasMoreMessages,
              [convId]: hasMore,
            },
            nextCursorByConversation: {
              ...s.nextCursorByConversation,
              [convId]: nextCursor,
            },
          };
        });
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('Lỗi fetchMessages:', err);
      }
    } finally {
      set((s) => ({
        loadingMessages: { ...s.loadingMessages, [convId]: false },
      }));
    }
  },

  loadMoreMessages: async (convId: string) => {
    const state = get();
    if (
      state.loadingMoreMessages[convId] ||
      state.loadingMessages[convId] ||
      state.hasMoreMessages[convId] === false
    ) {
      return;
    }

    const currentList = state.messagesByConversation[convId] ?? [];
    const oldestRealMsg = currentList.find((m) => !m.id.startsWith('temp_'));
    const cursor = state.nextCursorByConversation[convId] ?? oldestRealMsg?.id;
    if (!cursor) {
      set((s) => ({
        hasMoreMessages: { ...s.hasMoreMessages, [convId]: false },
      }));
      return;
    }

    try {
      set((s) => ({
        loadingMoreMessages: { ...s.loadingMoreMessages, [convId]: true },
      }));
      const { data } = await convApi.getMessages(convId, cursor, PAGE_SIZE);
      if (Array.isArray(data.messages)) {
        const myId = useAuthStore.getState().user?._id;
        const rawMsgs = [...data.messages].reverse();
        const olderMapped = rawMsgs.map((m) => mapBackendMessage(m, myId));
        const hasMore =
          typeof data.hasMore === 'boolean'
            ? data.hasMore
            : data.messages.length >= PAGE_SIZE;
        const nextCursor =
          data.nextCursor ??
          (rawMsgs[0]?._id ? String(rawMsgs[0]._id) : undefined);

        set((s) => {
          const existing = s.messagesByConversation[convId] ?? [];
          const mergedMap = new Map<string, Message>();
          for (const m of olderMapped) {
            mergedMap.set(m.id, m);
          }
          for (const m of existing) {
            mergedMap.set(m.id, m);
          }
          return {
            messagesByConversation: {
              ...s.messagesByConversation,
              [convId]: Array.from(mergedMap.values()),
            },
            hasMoreMessages: {
              ...s.hasMoreMessages,
              [convId]: hasMore && olderMapped.length > 0,
            },
            nextCursorByConversation: {
              ...s.nextCursorByConversation,
              [convId]: nextCursor,
            },
          };
        });
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('Lỗi loadMoreMessages:', err);
      }
      set((s) => ({
        hasMoreMessages: { ...s.hasMoreMessages, [convId]: false },
      }));
    } finally {
      set((s) => ({
        loadingMoreMessages: { ...s.loadingMoreMessages, [convId]: false },
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
    set((state) => {
      const target = state.conversations.find((c) => c.id === id);
      if (!target || target.unreadCount === 0) {
        return state;
      }
      return {
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, unreadCount: 0 } : c,
        ),
      };
    }),

  toggleReadStatus: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id
          ? { ...c, unreadCount: c.unreadCount > 0 ? 0 : 1 }
          : c,
      ),
    })),

  deleteConversation: async (id) => {
    // Chỉ xóa ở UI sau khi API xóa thành công trên server
    await convApi.deleteConversation(id);
    set((state) => {
      const nextMessages = { ...state.messagesByConversation };
      delete nextMessages[id];
      return {
        conversations: state.conversations.filter((c) => c.id !== id),
        messagesByConversation: nextMessages,
      };
    });
  },

  clearConversationHistory: async (id) => {
    // Chỉ xóa lịch sử ở UI sau khi API xóa thành công trên server
    await convApi.clearMessages(id);
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [id]: [],
      },
      hasMoreMessages: {
        ...state.hasMoreMessages,
        [id]: false,
      },
      conversations: state.conversations.map((c) =>
        c.id === id
          ? { ...c, lastMessageText: 'Chưa có tin nhắn', unreadCount: 0 }
          : c,
      ),
    }));
  },

  leaveGroup: async (id) => {
    await get().deleteConversation(id);
  },

  toggleBlockConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, isBlocked: !c.isBlocked } : c,
      ),
    })),

  getOrCreateDirectConversation: async (friend) => {
    try {
      const { data } = await convApi.openConversation(friend.id);
      const conv = data.conversation;
      if (conv?._id) {
        const convId = String(conv._id);
        const p = conv.participant || {};
        const participantAvatar =
          resolveMediaUrl(p.avatarUrl) ?? friend.avatarUrl;
        const participantOnline =
          typeof p.online === 'boolean' ? p.online : friend.isOnline;
        const participantLastActive = formatLastSeenText(
          participantOnline,
          p.lastSeenAt,
        );
        const participantName = p.displayName || p.username || friend.name;

        set((s) => {
          const existing = s.conversations.find((c) => c.id === convId);
          if (existing) {
            // Không ghi đè lastMessageText / unreadCount / isPinned / isMuted của hội thoại đã có
            return {
              conversations: s.conversations.map((c) =>
                c.id === convId
                  ? {
                      ...c,
                      name: participantName,
                      avatarUrl: participantAvatar,
                      isOnline: participantOnline,
                      lastActiveText: participantLastActive,
                      members: [
                        {
                          id: friend.id,
                          name: participantName,
                          avatarUrl: participantAvatar,
                          isOnline: participantOnline,
                          lastActiveText: participantLastActive,
                        },
                      ],
                    }
                  : c,
              ),
            };
          }

          const newConv: Conversation = {
            id: convId,
            name: participantName,
            isGroup: false,
            avatarUrl: participantAvatar,
            members: [
              {
                id: friend.id,
                name: participantName,
                avatarUrl: participantAvatar,
                isOnline: participantOnline,
                lastActiveText: participantLastActive,
              },
            ],
            lastMessageText:
              conv.lastMessage?.text ||
              (conv.lastMessage?.type === 'image' ? '[Hình ảnh]' : ''),
            lastMessageSender: conv.lastMessage?.sender,
            lastMessageTime: conv.lastMessage?.createdAt
              ? new Date(conv.lastMessage.createdAt).getTime()
              : Date.now(),
            unreadCount: 0,
            isPinned: false,
            isMuted: false,
            isOnline: participantOnline,
            lastActiveText: participantLastActive,
          };

          return {
            conversations: [newConv, ...s.conversations],
          };
        });
        return convId;
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('Lỗi getOrCreateDirectConversation:', err);
      }
    }
    return '';
  },

  sendMessage: async (payload) => {
    if (payload.type !== 'text' && payload.type !== 'image') {
      return;
    }

    const myId = useAuthStore.getState().user?._id || CURRENT_USER_ID;
    const tempId = makeTempId();
    const now = Date.now();
    const previewText =
      payload.type === 'image' ? '[Hình ảnh]' : payload.content;

    const optimisticMsg: Message = {
      id: tempId,
      conversationId: payload.conversationId,
      senderId: myId,
      senderName: 'Bạn',
      type: payload.type,
      content: previewText,
      createdAt: now,
      status: 'sending',
      imageUrl: payload.imageUrl,
      imageType: payload.imageType,
      imageFileName: payload.imageFileName,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      fileExt: payload.fileExt,
      stickerEmoji: payload.stickerEmoji,
      stickerLabel: payload.stickerLabel,
      voiceDurationSec: payload.voiceDurationSec,
      locationName: payload.locationName,
      locationAddress: payload.locationAddress,
    };

    const prevConv = get().conversations.find(
      (c) => c.id === payload.conversationId,
    );

    set((state) => {
      const prevMsgs =
        state.messagesByConversation[payload.conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [payload.conversationId]: [...prevMsgs, optimisticMsg],
        },
        conversations: state.conversations.map((c) =>
          c.id === payload.conversationId
            ? {
                ...c,
                lastMessageText: previewText,
                lastMessageSender: 'Bạn',
                lastMessageTime: now,
                unreadCount: 0,
              }
            : c,
        ),
      };
    });

    try {
      let data: any;
      if (payload.type === 'image' && payload.imageUrl) {
        const formData = new FormData();
        formData.append('image', {
          uri: payload.imageUrl,
          type: payload.imageType || 'image/jpeg',
          name: payload.imageFileName || `img_${Date.now()}.jpg`,
        } as any);
        const res = await convApi.sendImageMessage(
          payload.conversationId,
          formData,
        );
        data = res.data;
      } else {
        const res = await convApi.sendTextMessage(
          payload.conversationId,
          payload.content,
        );
        data = res.data;
      }

      if (data?.message?._id) {
        const realId = String(data.message._id);
        const serverImageUrl = resolveMediaUrl(data.message.imageUrl);
        set((state) => {
          const list =
            state.messagesByConversation[payload.conversationId] ?? [];
          const alreadyHasReal = list.some((m) => m.id === realId);
          return {
            messagesByConversation: {
              ...state.messagesByConversation,
              [payload.conversationId]: alreadyHasReal
                ? list.filter((m) => m.id !== tempId)
                : list.map((m) =>
                    m.id === tempId
                      ? {
                          ...m,
                          id: realId,
                          imageUrl: serverImageUrl ?? m.imageUrl,
                          status: 'sent',
                        }
                      : m,
                  ),
            },
          };
        });
      }
    } catch (err) {
      if (__DEV__) {
        console.warn('Lỗi gửi tin nhắn:', err);
      }
      // Đánh dấu thất bại để người dùng thấy rõ và có thể bấm gửi lại
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [payload.conversationId]: (
            state.messagesByConversation[payload.conversationId] ?? []
          ).map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)),
        },
        conversations: prevConv
          ? state.conversations.map((c) =>
              c.id === payload.conversationId
                ? {
                    ...c,
                    lastMessageText: prevConv.lastMessageText,
                    lastMessageSender: prevConv.lastMessageSender,
                    lastMessageTime: prevConv.lastMessageTime,
                  }
                : c,
            )
          : state.conversations,
      }));
    }
  },

  retryMessage: async (conversationId, messageId) => {
    const list = get().messagesByConversation[conversationId] ?? [];
    const target = list.find(
      (m) => m.id === messageId && m.status === 'failed',
    );
    if (!target) {
      return;
    }

    // Xóa tin nhắn lỗi cũ trước khi gửi lại
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (
          state.messagesByConversation[conversationId] ?? []
        ).filter((m) => m.id !== messageId),
      },
    }));

    await get().sendMessage({
      conversationId,
      type: target.type,
      content: target.content,
      imageUrl: target.imageUrl,
      imageType: target.imageType,
      imageFileName: target.imageFileName,
    });
  },

  handleIncomingMessage: (conversationId: string, backendMsg: any) => {
    const myId = useAuthStore.getState().user?._id;
    const msg = mapBackendMessage(backendMsg, myId);
    const isFromMe = Boolean(myId && msg.senderId === String(myId));

    set((state) => {
      const list = state.messagesByConversation[conversationId] ?? [];
      if (list.some((m) => m.id === msg.id)) {
        return state;
      }

      // Nếu tin nhắn là từ chính mình (server echo qua socket), thay thế tin nhắn tạm (optimistic)
      const tempIndex = list.findIndex(
        (m) =>
          m.id.startsWith('temp_') &&
          m.status === 'sending' &&
          m.senderId === msg.senderId &&
          m.type === msg.type &&
          (m.type === 'image' || m.content === msg.content),
      );

      let nextList: Message[];
      if (tempIndex !== -1) {
        nextList = [...list];
        nextList[tempIndex] = { ...msg, status: 'sent' };
      } else {
        nextList = [...list, msg];
      }

      const isCurrentlyViewing = state.activeConversationId === conversationId;
      const shouldIncrementUnread = !isFromMe && !isCurrentlyViewing;

      const convExists = state.conversations.some(
        (c) => c.id === conversationId,
      );
      const updatedConversations = convExists
        ? state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessageText:
                    msg.type === 'image' ? '[Hình ảnh]' : msg.content,
                  lastMessageTime: msg.createdAt,
                  lastMessageSender: msg.senderName,
                  unreadCount: shouldIncrementUnread
                    ? c.unreadCount + 1
                    : c.unreadCount,
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

  handlePresenceUpdate: (
    userId: string,
    isOnline: boolean,
    lastSeenAt?: string,
  ) => {
    const lastActiveText = formatLastSeenText(isOnline, lastSeenAt);
    set((state) => ({
      friends: state.friends.map((f) =>
        f.id === userId
          ? {
              ...f,
              isOnline,
              lastActiveText,
            }
          : f,
      ),
      conversations: state.conversations.map((c) => {
        if (c.members.some((m) => m.id === userId)) {
          return {
            ...c,
            isOnline,
            lastActiveText,
            members: c.members.map((m) =>
              m.id === userId ? { ...m, isOnline, lastActiveText } : m,
            ),
          };
        }
        return c;
      }),
    }));
  },

  acceptFriendRequest: async (requestId: string) => {
    await friendApi.acceptFriendRequest(requestId);
    set((state) => ({
      friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
    }));
    await get().fetchFriends();
    await get().fetchConversations();
  },

  declineFriendRequest: async (requestId: string) => {
    await friendApi.declineFriendRequest(requestId);
    set((state) => ({
      friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
    }));
  },

  sendFriendRequestByPhone: async (userIdOrUsername: string) => {
    await get().sendFriendRequestById(userIdOrUsername);
  },

  sendFriendRequestById: async (userId: string) => {
    const { data } = await friendApi.sendFriendRequest(userId);
    if (data?.status === 'friend') {
      await get().fetchFriends();
      await get().fetchFriendRequests();
    } else {
      set((state) => ({
        sentFriendPhones: state.sentFriendPhones.includes(userId)
          ? state.sentFriendPhones
          : [...state.sentFriendPhones, userId],
      }));
    }
    return data;
  },

  removeFriend: async (friendshipId: string) => {
    await friendApi.removeFriend(friendshipId);
    set((state) => ({
      friends: state.friends.filter(
        (f) => f.friendshipId !== friendshipId && f.id !== friendshipId,
      ),
    }));
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
      timelinePosts: createInitialTimelinePosts(),
      sentFriendPhones: [],
      activeConversationId: null,
      loadingConversations: false,
      loadingFriends: false,
      loadingMessages: {},
      loadingMoreMessages: {},
      hasMoreMessages: {},
      nextCursorByConversation: {},
    }),
}));
