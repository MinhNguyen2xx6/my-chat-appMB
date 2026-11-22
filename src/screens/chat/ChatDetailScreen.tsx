import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import ChatInput from '../../components/chat/ChatInput';
import MessageBubble from '../../components/chat/MessageBubble';
import Avatar from '../../components/common/Avatar';
import { Theme } from '../../config/theme';
import { CURRENT_USER_ID, useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { MainStackParamList, Message } from '../../types';
import { formatDateSeparator, isSameCalendarDay } from '../../utils/formatDate';

type ChatRouteProp = RouteProp<MainStackParamList, 'ChatDetail'>;
type NavProp = NativeStackNavigationProp<MainStackParamList>;

const EMPTY_MESSAGES: Message[] = [];

export default function ChatDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<ChatRouteProp>();
  const { conversationId } = route.params;

  const conversation = useChatStore((s) =>
    s.conversations.find((c) => c.id === conversationId),
  );
  const rawMessages = useChatStore(
    (s) => s.messagesByConversation[conversationId],
  );
  const messages = rawMessages || EMPTY_MESSAGES;
  const hasMore = useChatStore(
    (s) => s.hasMoreMessages[conversationId] ?? false,
  );
  const loadingMore = useChatStore(
    (s) => s.loadingMoreMessages[conversationId] ?? false,
  );
  const markAsRead = useChatStore((s) => s.markAsRead);
  const setActiveConversationId = useChatStore(
    (s) => s.setActiveConversationId,
  );
  const sendMessage = useChatStore((s) => s.sendMessage);
  const retryMessage = useChatStore((s) => s.retryMessage);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const loadMoreMessages = useChatStore((s) => s.loadMoreMessages);
  const fetchConversationById = useChatStore((s) => s.fetchConversationById);
  const myUserId = useAuthStore((s) => s.user?._id);

  const listRef = useRef<FlatList<Message>>(null);
  const isNearBottomRef = useRef(true);
  const hasInitialScrolledRef = useRef(false);
  const prevLastMsgIdRef = useRef<string | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingConv, setLoadingConv] = useState(!conversation);

  useEffect(() => {
    hasInitialScrolledRef.current = false;
    prevLastMsgIdRef.current = null;
    isNearBottomRef.current = true;

    setActiveConversationId(conversationId);
    markAsRead(conversationId);
    fetchMessages(conversationId);

    const exists = useChatStore
      .getState()
      .conversations.some((c) => c.id === conversationId);
    if (!exists) {
      setLoadingConv(true);
      fetchConversationById(conversationId).finally(() =>
        setLoadingConv(false),
      );
    } else {
      setLoadingConv(false);
    }

    return () => {
      setActiveConversationId(null);
    };
  }, [
    conversationId,
    setActiveConversationId,
    markAsRead,
    fetchMessages,
    fetchConversationById,
  ]);

  // Chỉ tự cuộn xuống đáy khi mới mở hội thoại hoặc khi có tin mới ở cuối lúc người dùng đang ở gần đáy
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    const lastId = messages[messages.length - 1]?.id ?? null;
    if (!hasInitialScrolledRef.current) {
      hasInitialScrolledRef.current = true;
      prevLastMsgIdRef.current = lastId;
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 60);
      return;
    }

    if (lastId !== prevLastMsgIdRef.current) {
      prevLastMsgIdRef.current = lastId;
      if (isNearBottomRef.current) {
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: true });
        }, 60);
      }
    }
  }, [messages]);

  const lastOwnMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (
        (myUserId && messages[i].senderId === String(myUserId)) ||
        messages[i].senderId === CURRENT_USER_ID
      ) {
        return messages[i].id;
      }
    }
    return null;
  }, [messages, myUserId]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    isNearBottomRef.current = distanceFromBottom < 120;
  };

  const scrollToEndSoon = () => {
    isNearBottomRef.current = true;
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  const showComingSoon = (featureName: string) => {
    Alert.alert(
      'Đang phát triển',
      `Tính năng "${featureName}" hiện đang được phát triển và sẽ sớm ra mắt.`,
    );
  };

  const handlePickAndSendImage = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });
      if (res.didCancel) {
        return;
      }
      if (res.errorCode) {
        Alert.alert(
          'Không thể chọn ảnh',
          res.errorMessage || 'Vui lòng cấp quyền truy cập thư viện ảnh.',
        );
        return;
      }
      const asset = res.assets?.[0];
      if (!asset?.uri) {
        return;
      }
      sendMessage({
        conversationId,
        type: 'image',
        content: '[Hình ảnh]',
        imageUrl: asset.uri,
        imageType: asset.type,
        imageFileName: asset.fileName,
      });
      scrollToEndSoon();
    } catch {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  if (!conversation) {
    if (loadingConv) {
      return (
        <View style={styles.missingBox}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      );
    }
    return (
      <View style={styles.missingBox}>
        <Text style={styles.missingText}>
          Cuộc trò chuyện không còn tồn tại.
        </Text>
        <TouchableOpacity
          style={styles.backFallbackBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backFallbackText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subtitle = conversation.isGroup
    ? `${conversation.members.length} thành viên`
    : conversation.isOnline
      ? 'Đang hoạt động'
      : conversation.lastActiveText || 'Hoạt động gần đây';

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Theme.colors.headerBg}
      />

      {/* Chat Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 10) + 6 },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerCenter}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('ConversationInfo', { conversationId })
          }
        >
          <Avatar
            name={conversation.name}
            uri={conversation.avatarUrl}
            size={38}
            isOnline={conversation.isOnline}
            isGroup={conversation.isGroup}
            members={conversation.members}
          />
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerName} numberOfLines={1}>
              {conversation.name}
            </Text>
            <Text style={styles.headerStatus} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => showComingSoon('Gọi thoại')}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityLabel="Gọi thoại (Đang phát triển)"
          >
            <Text style={styles.headerActionIcon}>📞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => showComingSoon('Gọi video')}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityLabel="Gọi video (Đang phát triển)"
          >
            <Text style={styles.headerActionIcon}>📹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() =>
              navigation.navigate('ConversationInfo', { conversationId })
            }
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            accessibilityLabel="Thông tin hội thoại"
          >
            <Text style={styles.headerActionIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body + Input (Android windowSoftInputMode="adjustResize" tự co layout) */}
      <View style={styles.flex}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onScroll={handleScroll}
          scrollEventThrottle={100}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            hasMore ? (
              <View style={styles.loadMoreWrap}>
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={() => loadMoreMessages(conversationId)}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator
                      size="small"
                      color={Theme.colors.primaryDark}
                    />
                  ) : (
                    <Text style={styles.loadMoreText}>
                      ↑ Tải thêm tin nhắn cũ
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Avatar
                name={conversation.name}
                uri={conversation.avatarUrl}
                size={68}
                isGroup={conversation.isGroup}
                members={conversation.members}
              />
              <Text style={styles.emptyChatName}>{conversation.name}</Text>
              <Text style={styles.emptyChatSub}>
                Hãy gửi lời chào để bắt đầu cuộc trò chuyện!
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const prev = index > 0 ? messages[index - 1] : null;
            const showDateHeader =
              !prev || !isSameCalendarDay(prev.createdAt, item.createdAt);
            const showSenderInfo =
              showDateHeader || !prev || prev.senderId !== item.senderId;

            return (
              <View>
                {showDateHeader && (
                  <View style={styles.datePillWrap}>
                    <View style={styles.datePill}>
                      <Text style={styles.datePillText}>
                        {formatDateSeparator(item.createdAt)}
                      </Text>
                    </View>
                  </View>
                )}
                <MessageBubble
                  message={item}
                  isGroup={conversation.isGroup}
                  showSenderInfo={showSenderInfo}
                  isLastOwnMessage={item.id === lastOwnMessageId}
                  onPressImage={(uri) => setPreviewImage(uri)}
                  onRetry={(msg) => retryMessage(conversationId, msg.id)}
                />
              </View>
            );
          }}
        />

        <ChatInput
          disabled={Boolean(conversation.isBlocked)}
          disabledText="Bạn không thể gửi tin nhắn cho cuộc trò chuyện này."
          onSendText={(text) => {
            sendMessage({ conversationId, type: 'text', content: text });
            scrollToEndSoon();
          }}
          onSendSticker={() => showComingSoon('Gửi Sticker')}
          onSendImage={handlePickAndSendImage}
          onSendFile={() => showComingSoon('Gửi tài liệu')}
          onSendLocation={() => showComingSoon('Chia sẻ vị trí')}
          onSendVoice={() => showComingSoon('Ghi âm tin nhắn thoại')}
        />
      </View>

      {/* Fullscreen Image Lightbox */}
      <Modal
        visible={previewImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <Pressable
          style={styles.lightbox}
          onPress={() => setPreviewImage(null)}
        >
          <TouchableOpacity
            style={[
              styles.lightboxClose,
              { top: Math.max(insets.top, 16) + 12 },
            ]}
            onPress={() => setPreviewImage(null)}
          >
            <Text style={styles.lightboxCloseText}>✕ Đóng</Text>
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={styles.lightboxImg}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.chatBackground,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: Theme.colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 11,
    gap: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerStatus: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  listContent: {
    paddingVertical: 12,
  },
  loadMoreWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  loadMoreBtn: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Theme.radius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  loadMoreText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Theme.colors.primaryDark,
  },
  datePillWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  datePill: {
    backgroundColor: 'rgba(46, 127, 217, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Theme.radius.pill,
  },
  datePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Theme.colors.primaryDark,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 28,
  },
  emptyChatName: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: 12,
  },
  emptyChatSub: {
    fontSize: 13.5,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  missingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    gap: 12,
  },
  missingText: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
  },
  backFallbackBtn: {
    backgroundColor: Theme.colors.primaryDark,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backFallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    right: 20,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  lightboxCloseText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  lightboxImg: {
    width: '92%',
    height: '72%',
  },
});
