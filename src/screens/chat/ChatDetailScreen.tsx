import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatInput from '../../components/chat/ChatInput';
import MessageBubble from '../../components/chat/MessageBubble';
import Avatar from '../../components/common/Avatar';
import { Theme } from '../../config/theme';
import { CURRENT_USER_ID, useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { MainStackParamList, Message } from '../../types';

type ChatRouteProp = RouteProp<MainStackParamList, 'ChatDetail'>;
type NavProp = NativeStackNavigationProp<MainStackParamList>;

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=600&q=80',
];

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
  const markAsRead = useChatStore((s) => s.markAsRead);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const fetchConversationById = useChatStore((s) => s.fetchConversationById);
  const myUserId = useAuthStore((s) => s.user?._id);

  const listRef = useRef<FlatList<Message>>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingConv, setLoadingConv] = useState(!conversation);

  useEffect(() => {
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
  }, [conversationId, markAsRead, fetchMessages, fetchConversationById]);

  const lastOwnMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (
        (myUserId && messages[i].senderId === myUserId) ||
        messages[i].senderId === CURRENT_USER_ID
      ) {
        return messages[i].id;
      }
    }
    return null;
  }, [messages, myUserId]);

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
        <Text style={styles.missingText}>Cuộc trò chuyện không còn tồn tại.</Text>
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

  const scrollToEndSoon = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

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
            onPress={() =>
              Alert.alert(
                'Gọi thoại',
                `Đang bắt đầu cuộc gọi thoại với ${conversation.name}...`,
              )
            }
          >
            <Text style={styles.headerActionIcon}>📞</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() =>
              Alert.alert(
                'Gọi video',
                `Đang bắt đầu cuộc gọi video với ${conversation.name}...`,
              )
            }
          >
            <Text style={styles.headerActionIcon}>📹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() =>
              navigation.navigate('ConversationInfo', { conversationId })
            }
          >
            <Text style={styles.headerActionIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body + Input */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          ListHeaderComponent={
            <View style={styles.datePillWrap}>
              <View style={styles.datePill}>
                <Text style={styles.datePillText}>Hôm nay</Text>
              </View>
            </View>
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
            const showSenderInfo = !prev || prev.senderId !== item.senderId;
            return (
              <MessageBubble
                message={item}
                isGroup={conversation.isGroup}
                showSenderInfo={showSenderInfo}
                isLastOwnMessage={item.id === lastOwnMessageId}
                onPressImage={(uri) => setPreviewImage(uri)}
              />
            );
          }}
        />

        <ChatInput
          disabled={Boolean(conversation.isBlocked)}
          disabledText="Bạn đã chặn người dùng này. Mở chặn trong Thông tin hội thoại để nhắn tin."
          onSendText={(text) => {
            sendMessage({ conversationId, type: 'text', content: text });
            scrollToEndSoon();
          }}
          onSendSticker={(emoji, label) => {
            sendMessage({
              conversationId,
              type: 'sticker',
              content: label,
              stickerEmoji: emoji,
              stickerLabel: label,
            });
            scrollToEndSoon();
          }}
          onSendImage={() => {
            const img =
              SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
            sendMessage({
              conversationId,
              type: 'image',
              content: 'Hình ảnh',
              imageUrl: img,
            });
            scrollToEndSoon();
          }}
          onSendFile={() => {
            sendMessage({
              conversationId,
              type: 'file',
              content: 'Tài liệu',
              fileName: `BaoCao_MyChat_${new Date().getDate()}.pdf`,
              fileSize: '2.4 MB',
              fileExt: 'PDF',
            });
            scrollToEndSoon();
          }}
          onSendLocation={() => {
            sendMessage({
              conversationId,
              type: 'location',
              content: 'Vị trí hiện tại',
              locationName: 'Trung tâm Quận 1',
              locationAddress: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
            });
            scrollToEndSoon();
          }}
          onSendVoice={(durationSec) => {
            sendMessage({
              conversationId,
              type: 'voice',
              content: 'Tin nhắn thoại',
              voiceDurationSec: durationSec,
            });
            scrollToEndSoon();
          }}
        />
      </KeyboardAvoidingView>

      {/* Fullscreen Image Lightbox */}
      <Modal
        visible={previewImage !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={styles.lightboxClose}
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
        </View>
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
    width: 34,
    height: 34,
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
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.18)',
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
  datePillWrap: {
    alignItems: 'center',
    marginBottom: 12,
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
    backgroundColor: Theme.colors.primary,
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
    top: 48,
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
