import { create } from 'zustand';
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

const NOW = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const INITIAL_FRIENDS: Friend[] = [
  {
    id: 'u1',
    name: 'An Nguyễn',
    phone: '0901234561',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    bio: 'UI/UX Designer ✨',
    conversationId: 'c1',
  },
  {
    id: 'u2',
    name: 'Bảo Trân',
    phone: '0901234562',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    bio: 'Thích cà phê và đọc sách',
    conversationId: 'c3',
  },
  {
    id: 'u3',
    name: 'Chí Dũng',
    phone: '0901234563',
    isOnline: false,
    lastActiveText: 'Hoạt động 15 phút trước',
    bio: 'Mobile Developer',
    conversationId: 'c4',
  },
  {
    id: 'u4',
    name: 'Diệu Linh',
    phone: '0901234564',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    bio: 'Product Manager',
  },
  {
    id: 'u5',
    name: 'Gia Huy',
    phone: '0901234565',
    isOnline: false,
    lastActiveText: 'Hoạt động 2 giờ trước',
    bio: 'Backend & DevOps',
  },
  {
    id: 'u6',
    name: 'Hà My',
    phone: '0901234566',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    bio: 'Du lịch & Ẩm thực',
    conversationId: 'c5',
  },
  {
    id: 'u7',
    name: 'Khánh Vy',
    phone: '0901234567',
    isOnline: false,
    lastActiveText: 'Hoạt động 42 phút trước',
    bio: 'QA Engineer',
  },
  {
    id: 'u8',
    name: 'Minh Khôi',
    phone: '0901234568',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    bio: 'React Native Enthusiast',
    conversationId: 'c6',
  },
  {
    id: 'u9',
    name: 'Ngọc Hân',
    phone: '0901234569',
    isOnline: false,
    lastActiveText: 'Hoạt động 1 ngày trước',
    bio: 'Nhiếp ảnh & Thiết kế',
  },
  {
    id: 'u10',
    name: 'Phương Thảo',
    phone: '0901234570',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    bio: 'Marketing Lead',
  },
  {
    id: 'u11',
    name: 'Quốc Anh',
    phone: '0901234571',
    isOnline: false,
    lastActiveText: 'Hoạt động 3 giờ trước',
    bio: 'Tech Lead',
  },
  {
    id: 'u12',
    name: 'Tuấn Kiệt',
    phone: '0901234572',
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
    bio: 'Fullstack Developer',
  },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'An Nguyễn',
    isGroup: false,
    members: [
      {
        id: 'u1',
        name: 'An Nguyễn',
        isOnline: true,
        lastActiveText: 'Đang hoạt động',
        phone: '0901234561',
      },
    ],
    lastMessageText: 'Mình vừa gửi bản mockup xanh pastel mới nè, bạn xem thử nhé!',
    lastMessageSender: 'An Nguyễn',
    lastMessageTime: NOW - 2 * MIN,
    unreadCount: 3,
    isPinned: true,
    isMuted: false,
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
  },
  {
    id: 'c2',
    name: 'Nhóm Đồ Án MyChat',
    isGroup: true,
    members: [
      { id: CURRENT_USER_ID, name: 'Bạn', isOnline: true, role: 'admin' },
      { id: 'u1', name: 'An Nguyễn', isOnline: true, role: 'member' },
      { id: 'u3', name: 'Chí Dũng', isOnline: false, lastActiveText: 'Hoạt động 15 phút trước', role: 'member' },
      { id: 'u8', name: 'Minh Khôi', isOnline: true, role: 'member' },
      { id: 'u12', name: 'Tuấn Kiệt', isOnline: true, role: 'member' },
    ],
    lastMessageText: 'Đã gửi tệp: Spec_MainUI_v2.pdf',
    lastMessageSender: 'Minh Khôi',
    lastMessageTime: NOW - 12 * MIN,
    unreadCount: 5,
    isPinned: true,
    isMuted: false,
  },
  {
    id: 'c3',
    name: 'Bảo Trân',
    isGroup: false,
    members: [
      {
        id: 'u2',
        name: 'Bảo Trân',
        isOnline: true,
        lastActiveText: 'Đang hoạt động',
        phone: '0901234562',
      },
    ],
    lastMessageText: '[Tin nhắn thoại 0:18]',
    lastMessageSender: 'Bảo Trân',
    lastMessageTime: NOW - 38 * MIN,
    unreadCount: 1,
    isPinned: false,
    isMuted: false,
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
  },
  {
    id: 'c4',
    name: 'Chí Dũng',
    isGroup: false,
    members: [
      {
        id: 'u3',
        name: 'Chí Dũng',
        isOnline: false,
        lastActiveText: 'Hoạt động 15 phút trước',
        phone: '0901234563',
      },
    ],
    lastMessageText: 'Bạn: Ok để tối mình review PR nhé',
    lastMessageSender: 'Bạn',
    lastMessageTime: NOW - 2 * HOUR,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: false,
    lastActiveText: 'Hoạt động 15 phút trước',
  },
  {
    id: 'c7',
    name: 'Hội Cà Phê Cuối Tuần ☕',
    isGroup: true,
    members: [
      { id: CURRENT_USER_ID, name: 'Bạn', isOnline: true, role: 'member' },
      { id: 'u2', name: 'Bảo Trân', isOnline: true, role: 'admin' },
      { id: 'u6', name: 'Hà My', isOnline: true, role: 'member' },
      { id: 'u10', name: 'Phương Thảo', isOnline: true, role: 'member' },
    ],
    lastMessageText: 'Chủ nhật 9h quán quen quận 1 nha mọi người!',
    lastMessageSender: 'Hà My',
    lastMessageTime: NOW - 4 * HOUR,
    unreadCount: 12,
    isPinned: false,
    isMuted: true,
  },
  {
    id: 'c5',
    name: 'Hà My',
    isGroup: false,
    members: [
      {
        id: 'u6',
        name: 'Hà My',
        isOnline: true,
        lastActiveText: 'Đang hoạt động',
        phone: '0901234566',
      },
    ],
    lastMessageText: '[Hình ảnh]',
    lastMessageSender: 'Hà My',
    lastMessageTime: NOW - DAY - 2 * HOUR,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
  },
  {
    id: 'c6',
    name: 'Minh Khôi',
    isGroup: false,
    members: [
      {
        id: 'u8',
        name: 'Minh Khôi',
        isOnline: true,
        lastActiveText: 'Đang hoạt động',
        phone: '0901234568',
      },
    ],
    lastMessageText: 'Cảm ơn nhiều nha 🙌',
    lastMessageSender: 'Minh Khôi',
    lastMessageTime: NOW - 2 * DAY,
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isOnline: true,
    lastActiveText: 'Đang hoạt động',
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: 'm101',
      conversationId: 'c1',
      senderId: 'u1',
      senderName: 'An Nguyễn',
      type: 'text',
      content: 'Chào bạn! Tiến độ giao diện MainUI hôm nay sao rồi?',
      createdAt: NOW - 40 * MIN,
      status: 'seen',
    },
    {
      id: 'm102',
      conversationId: 'c1',
      senderId: CURRENT_USER_ID,
      senderName: 'Bạn',
      type: 'text',
      content: 'Mình đang làm xong phần Main Shell với 5 tab và bảng màu xanh pastel rồi nè!',
      createdAt: NOW - 35 * MIN,
      status: 'seen',
    },
    {
      id: 'm103',
      conversationId: 'c1',
      senderId: 'u1',
      senderName: 'An Nguyễn',
      type: 'image',
      content: 'Ảnh mockup tham khảo',
      imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&q=80',
      createdAt: NOW - 18 * MIN,
      status: 'seen',
    },
    {
      id: 'm104',
      conversationId: 'c1',
      senderId: 'u1',
      senderName: 'An Nguyễn',
      type: 'file',
      content: 'Tài liệu thiết kế',
      fileName: 'Design_System_PastelBlue.fig',
      fileSize: '4.2 MB',
      fileExt: 'FIG',
      createdAt: NOW - 15 * MIN,
      status: 'seen',
    },
    {
      id: 'm105',
      conversationId: 'c1',
      senderId: CURRENT_USER_ID,
      senderName: 'Bạn',
      type: 'sticker',
      content: 'Sticker Tuyệt vời',
      stickerEmoji: '🥳',
      stickerLabel: 'Tuyệt vời!',
      createdAt: NOW - 10 * MIN,
      status: 'seen',
    },
    {
      id: 'm106',
      conversationId: 'c1',
      senderId: 'u1',
      senderName: 'An Nguyễn',
      type: 'voice',
      content: 'Tin nhắn thoại',
      voiceDurationSec: 14,
      createdAt: NOW - 5 * MIN,
      status: 'seen',
    },
    {
      id: 'm107',
      conversationId: 'c1',
      senderId: 'u1',
      senderName: 'An Nguyễn',
      type: 'text',
      content: 'Mình vừa gửi bản mockup xanh pastel mới nè, bạn xem thử nhé!',
      createdAt: NOW - 2 * MIN,
      status: 'seen',
    },
  ],
  c2: [
    {
      id: 'm201',
      conversationId: 'c2',
      senderId: 'u3',
      senderName: 'Chí Dũng',
      type: 'text',
      content: 'Mọi người nhớ checkout sang branch MainUI mới trước khi code nhé!',
      createdAt: NOW - 50 * MIN,
      status: 'seen',
    },
    {
      id: 'm202',
      conversationId: 'c2',
      senderId: CURRENT_USER_ID,
      senderName: 'Bạn',
      type: 'text',
      content: 'Đã tạo branch MainUI và cập nhật toàn bộ màn hình chính rồi nhé 👍',
      createdAt: NOW - 25 * MIN,
      status: 'seen',
    },
    {
      id: 'm203',
      conversationId: 'c2',
      senderId: 'u8',
      senderName: 'Minh Khôi',
      type: 'file',
      content: 'Spec MainUI',
      fileName: 'Spec_MainUI_v2.pdf',
      fileSize: '1.8 MB',
      fileExt: 'PDF',
      createdAt: NOW - 12 * MIN,
      status: 'seen',
    },
  ],
  c3: [
    {
      id: 'm301',
      conversationId: 'c3',
      senderId: 'u2',
      senderName: 'Bảo Trân',
      type: 'voice',
      content: 'Tin nhắn thoại',
      voiceDurationSec: 18,
      createdAt: NOW - 38 * MIN,
      status: 'seen',
    },
  ],
  c4: [
    {
      id: 'm401',
      conversationId: 'c4',
      senderId: 'u3',
      senderName: 'Chí Dũng',
      type: 'text',
      content: 'Mình vừa push phần API auth lên rồi nha.',
      createdAt: NOW - 3 * HOUR,
      status: 'seen',
    },
    {
      id: 'm402',
      conversationId: 'c4',
      senderId: CURRENT_USER_ID,
      senderName: 'Bạn',
      type: 'text',
      content: 'Ok để tối mình review PR nhé',
      createdAt: NOW - 2 * HOUR,
      status: 'sent',
    },
  ],
  c7: [
    {
      id: 'm701',
      conversationId: 'c7',
      senderId: 'u6',
      senderName: 'Hà My',
      type: 'location',
      content: 'Vị trí quán cà phê',
      locationName: 'Pastel Coffee & Bakery',
      locationAddress: '42 Nguyễn Huệ, Quận 1, TP.HCM',
      createdAt: NOW - 4 * HOUR - 5 * MIN,
      status: 'seen',
    },
    {
      id: 'm702',
      conversationId: 'c7',
      senderId: 'u6',
      senderName: 'Hà My',
      type: 'text',
      content: 'Chủ nhật 9h quán quen quận 1 nha mọi người!',
      createdAt: NOW - 4 * HOUR,
      status: 'seen',
    },
  ],
};

const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'fr1',
    userId: 'u20',
    name: 'Hoàng Nam',
    phone: '0912345678',
    message: 'Xin chào, mình là Nam bên lớp React Native, kết bạn nhé!',
    createdAt: NOW - 30 * MIN,
    mutualFriends: 4,
  },
  {
    id: 'fr2',
    userId: 'u21',
    name: 'Thùy Dương',
    phone: '0987654321',
    message: 'Chào bạn, mình tìm thấy bạn qua số điện thoại.',
    createdAt: NOW - 5 * HOUR,
    mutualFriends: 2,
  },
  {
    id: 'fr3',
    userId: 'u22',
    name: 'Đức Thịnh',
    phone: '0933445566',
    message: 'Kết bạn để trao đổi dự án MyChat nha!',
    createdAt: NOW - DAY,
    mutualFriends: 6,
  },
];

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
  {
    id: 'oa3',
    name: 'Thanh Toán Hóa Đơn',
    category: 'Tài chính',
    description: 'Nhắc lịch đóng tiền điện, nước, internet tiện lợi',
    verified: true,
    avatarEmoji: '💳',
    followersText: '890K quan tâm',
  },
  {
    id: 'oa4',
    name: 'Tin Nhanh Công Nghệ',
    category: 'Báo chí',
    description: 'Tổng hợp tin tức công nghệ, AI và lập trình mỗi ngày',
    verified: false,
    avatarEmoji: '⚡',
    followersText: '410K quan tâm',
  },
];

const INITIAL_TIMELINE_POSTS: TimelinePost[] = [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'An Nguyễn',
    createdAt: NOW - 45 * MIN,
    content: 'Vừa hoàn thiện bảng màu xanh pastel cho giao diện mới, nhìn dịu mắt quá mọi người ơi 🩵✨',
    imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=700&q=80',
    likes: 24,
    isLiked: true,
    commentsCount: 6,
  },
  {
    id: 'p2',
    authorId: 'u6',
    authorName: 'Hà My',
    createdAt: NOW - 3 * HOUR,
    content: 'Một buổi chiều yên bình với ly matcha đá xay và chút gió mát 🍵🌿',
    imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=700&q=80',
    likes: 41,
    isLiked: false,
    commentsCount: 11,
  },
  {
    id: 'p3',
    authorId: 'u8',
    authorName: 'Minh Khôi',
    createdAt: NOW - 9 * HOUR,
    content: 'Code React Native mượt mà khi có kiến trúc sạch và state management gọn gàng 🚀',
    likes: 18,
    isLiked: false,
    commentsCount: 3,
  },
];

// Directory of searchable users by phone for Add Friend feature
export const DIRECTORY_USERS = [
  { id: 'dir1', name: 'Lê Minh Quân', phone: '0909111222', bio: 'Kỹ sư phần mềm' },
  { id: 'dir2', name: 'Trần Ngọc Ánh', phone: '0908333444', bio: 'Thiết kế đồ họa' },
  { id: 'dir3', name: 'Phạm Hoàng Sơn', phone: '0911555666', bio: 'Yêu thể thao & du lịch' },
];

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
  getOrCreateDirectConversation: (friend: Friend) => string;

  // Messaging actions
  sendMessage: (payload: SendMessagePayload) => void;

  // Friends actions
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  sendFriendRequestByPhone: (phone: string) => void;

  // Timeline actions
  toggleLikePost: (postId: string) => void;
  addTimelinePost: (content: string, authorName: string) => void;
}

function getLastMessagePreview(payload: SendMessagePayload): string {
  switch (payload.type) {
    case 'image':
      return 'Bạn: [Hình ảnh]';
    case 'file':
      return `Bạn: [Tệp tin] ${payload.fileName ?? ''}`.trim();
    case 'sticker':
      return `Bạn: [Sticker] ${payload.stickerEmoji ?? ''}`.trim();
    case 'voice':
      return `Bạn: [Tin nhắn thoại 0:${String(payload.voiceDurationSec ?? 5).padStart(2, '0')}]`;
    case 'location':
      return `Bạn: [Vị trí] ${payload.locationName ?? ''}`.trim();
    default:
      return `Bạn: ${payload.content}`;
  }
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  conversations: INITIAL_CONVERSATIONS,
  messagesByConversation: INITIAL_MESSAGES,
  friends: INITIAL_FRIENDS,
  friendRequests: INITIAL_FRIEND_REQUESTS,
  officialAccounts: INITIAL_OAS,
  timelinePosts: INITIAL_TIMELINE_POSTS,
  sentFriendPhones: [],

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
    const friends = get().friends;
    const selectedMembers: Member[] = [
      { id: CURRENT_USER_ID, name: 'Bạn', isOnline: true, role: 'admin' },
      ...friends
        .filter((f) => memberIds.includes(f.id))
        .map((f) => ({
          id: f.id,
          name: f.name,
          avatarUrl: f.avatarUrl,
          isOnline: f.isOnline,
          lastActiveText: f.lastActiveText,
          role: 'member' as const,
          phone: f.phone,
        })),
    ];

    const newConversation: Conversation = {
      id,
      name: name.trim() || 'Nhóm mới',
      isGroup: true,
      members: selectedMembers,
      lastMessageText: 'Bạn đã tạo nhóm mới',
      lastMessageSender: 'Bạn',
      lastMessageTime: Date.now(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
    };

    const welcomeMsg: Message = {
      id: `m_${Date.now()}`,
      conversationId: id,
      senderId: CURRENT_USER_ID,
      senderName: 'Bạn',
      type: 'text',
      content: `Chào mừng mọi người đến với nhóm "${newConversation.name}" 🎉`,
      createdAt: Date.now(),
      status: 'sent',
    };

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      messagesByConversation: {
        ...state.messagesByConversation,
        [id]: [welcomeMsg],
      },
    }));

    return id;
  },

  getOrCreateDirectConversation: (friend) => {
    const existing = get().conversations.find(
      (c) =>
        !c.isGroup &&
        (c.id === friend.conversationId ||
          c.members.some((m) => m.id === friend.id)),
    );
    if (existing) {
      return existing.id;
    }

    const id = `c_${friend.id}_${Date.now()}`;
    const newConversation: Conversation = {
      id,
      name: friend.name,
      isGroup: false,
      avatarUrl: friend.avatarUrl,
      members: [
        {
          id: friend.id,
          name: friend.name,
          avatarUrl: friend.avatarUrl,
          isOnline: friend.isOnline,
          lastActiveText: friend.lastActiveText,
          phone: friend.phone,
        },
      ],
      lastMessageText: 'Bắt đầu cuộc trò chuyện mới',
      lastMessageTime: Date.now(),
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isOnline: friend.isOnline,
      lastActiveText: friend.lastActiveText,
    };

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      messagesByConversation: {
        ...state.messagesByConversation,
        [id]: [],
      },
    }));

    return id;
  },

  sendMessage: (payload) => {
    const msgId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();
    const newMessage: Message = {
      id: msgId,
      conversationId: payload.conversationId,
      senderId: CURRENT_USER_ID,
      senderName: 'Bạn',
      type: payload.type,
      content: payload.content,
      createdAt: now,
      status: 'sending',
      imageUrl: payload.imageUrl,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      fileExt: payload.fileExt,
      stickerEmoji: payload.stickerEmoji,
      stickerLabel: payload.stickerLabel,
      voiceDurationSec: payload.voiceDurationSec,
      locationName: payload.locationName,
      locationAddress: payload.locationAddress,
    };

    const preview = getLastMessagePreview(payload);

    set((state) => {
      const prevMsgs = state.messagesByConversation[payload.conversationId] ?? [];
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [payload.conversationId]: [...prevMsgs, newMessage],
        },
        conversations: state.conversations.map((c) =>
          c.id === payload.conversationId
            ? {
                ...c,
                lastMessageText: preview,
                lastMessageSender: 'Bạn',
                lastMessageTime: now,
                unreadCount: 0,
              }
            : c,
        ),
      };
    });

    // Simulate realistic delivery status transitions: sending -> sent -> seen
    setTimeout(() => {
      set((state) => {
        const list = state.messagesByConversation[payload.conversationId];
        if (!list) {
          return state;
        }
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [payload.conversationId]: list.map((m) =>
              m.id === msgId ? { ...m, status: 'sent' } : m,
            ),
          },
        };
      });
    }, 450);

    setTimeout(() => {
      set((state) => {
        const list = state.messagesByConversation[payload.conversationId];
        if (!list) {
          return state;
        }
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [payload.conversationId]: list.map((m) =>
              m.id === msgId ? { ...m, status: 'seen' } : m,
            ),
          },
        };
      });
    }, 1500);
  },

  acceptFriendRequest: (requestId) =>
    set((state) => {
      const req = state.friendRequests.find((r) => r.id === requestId);
      if (!req) {
        return state;
      }
      const newFriend: Friend = {
        id: req.userId,
        name: req.name,
        phone: req.phone,
        avatarUrl: req.avatarUrl,
        isOnline: true,
        lastActiveText: 'Đang hoạt động',
        bio: 'Bạn mới kết nối trên MyChat',
      };
      return {
        friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
        friends: [...state.friends, newFriend],
      };
    }),

  declineFriendRequest: (requestId) =>
    set((state) => ({
      friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
    })),

  sendFriendRequestByPhone: (phone) =>
    set((state) => ({
      sentFriendPhones: state.sentFriendPhones.includes(phone)
        ? state.sentFriendPhones
        : [...state.sentFriendPhones, phone],
    })),

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
          authorId: CURRENT_USER_ID,
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
}));
