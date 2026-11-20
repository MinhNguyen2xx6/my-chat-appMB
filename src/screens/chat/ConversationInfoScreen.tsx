import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import { Theme } from '../../config/theme';
import { useChatStore } from '../../store/useChatStore';
import { MainStackParamList } from '../../types';

type InfoRouteProp = RouteProp<MainStackParamList, 'ConversationInfo'>;
type NavProp = NativeStackNavigationProp<MainStackParamList>;

export default function ConversationInfoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<InfoRouteProp>();
  const { conversationId } = route.params;

  const conversation = useChatStore((s) =>
    s.conversations.find((c) => c.id === conversationId),
  );
  const messages = useChatStore(
    (s) => s.messagesByConversation[conversationId] ?? [],
  );
  const {
    toggleMuteConversation,
    togglePinConversation,
    toggleBlockConversation,
    leaveGroup,
    clearConversationHistory,
  } = useChatStore();

  const sharedImages = useMemo(
    () => messages.filter((m) => m.type === 'image' && m.imageUrl),
    [messages],
  );

  const sharedFiles = useMemo(
    () => messages.filter((m) => m.type === 'file'),
    [messages],
  );

  if (!conversation) {
    return null;
  }

  const handleLeaveGroup = () => {
    Alert.alert(
      'Rời nhóm',
      `Bạn có chắc muốn rời khỏi nhóm "${conversation.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rời nhóm',
          style: 'destructive',
          onPress: () => {
            leaveGroup(conversation.id);
            navigation.popToTop();
          },
        },
      ],
    );
  };

  const handleToggleBlock = () => {
    const nextAction = conversation.isBlocked ? 'Bỏ chặn' : 'Chặn';
    Alert.alert(
      `${nextAction} ${conversation.name}`,
      conversation.isBlocked
        ? 'Bạn sẽ có thể nhắn tin và gọi điện lại với người này.'
        : 'Người này sẽ không thể gửi tin nhắn cho bạn nữa.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: nextAction,
          style: conversation.isBlocked ? 'default' : 'destructive',
          onPress: () => toggleBlockConversation(conversation.id),
        },
      ],
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Xóa lịch sử trò chuyện',
      'Toàn bộ tin nhắn trong cuộc trò chuyện này sẽ bị xóa khỏi thiết bị.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => clearConversationHistory(conversation.id),
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 10) + 6 },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {conversation.isGroup ? 'Thông tin nhóm' : 'Tùy chọn hội thoại'}
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Avatar
            name={conversation.name}
            uri={conversation.avatarUrl}
            size={78}
            isOnline={conversation.isOnline}
            isGroup={conversation.isGroup}
            members={conversation.members}
          />
          <Text style={styles.heroName}>{conversation.name}</Text>
          <Text style={styles.heroSub}>
            {conversation.isGroup
              ? `${conversation.members.length} thành viên`
              : conversation.isOnline
                ? 'Đang hoạt động'
                : conversation.lastActiveText || 'Hoạt động gần đây'}
          </Text>

          {/* 4 Quick Action Buttons */}
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickItem}
              onPress={() =>
                Alert.alert('Tìm tin nhắn', 'Nhập từ khóa để tìm trong hội thoại.')
              }
            >
              <View style={styles.quickCircle}>
                <Text style={styles.quickIcon}>🔍</Text>
              </View>
              <Text style={styles.quickLabel}>Tìm tin nhắn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => togglePinConversation(conversation.id)}
            >
              <View
                style={[
                  styles.quickCircle,
                  conversation.isPinned && styles.quickCircleActive,
                ]}
              >
                <Text style={styles.quickIcon}>📌</Text>
              </View>
              <Text style={styles.quickLabel}>
                {conversation.isPinned ? 'Bỏ ghim' : 'Ghim'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickItem}
              onPress={() => toggleMuteConversation(conversation.id)}
            >
              <View
                style={[
                  styles.quickCircle,
                  conversation.isMuted && styles.quickCircleActive,
                ]}
              >
                <Text style={styles.quickIcon}>
                  {conversation.isMuted ? '🔕' : '🔔'}
                </Text>
              </View>
              <Text style={styles.quickLabel}>
                {conversation.isMuted ? 'Bật TB' : 'Tắt TB'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickItem}
              onPress={() =>
                Alert.alert(
                  conversation.isGroup ? 'Thêm thành viên' : 'Trang cá nhân',
                  conversation.isGroup
                    ? 'Chọn bạn bè để mời vào nhóm.'
                    : `Xem trang cá nhân của ${conversation.name}`,
                )
              }
            >
              <View style={styles.quickCircle}>
                <Text style={styles.quickIcon}>
                  {conversation.isGroup ? '👤+' : '👤'}
                </Text>
              </View>
              <Text style={styles.quickLabel}>
                {conversation.isGroup ? 'Thêm bạn' : 'Trang cá nhân'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shared Media & Files */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ảnh & File đã chia sẻ</Text>

          {sharedImages.length > 0 ? (
            <View style={styles.mediaGrid}>
              {sharedImages.map((img) => (
                <Image
                  key={img.id}
                  source={{ uri: img.imageUrl }}
                  style={styles.mediaThumb}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyMeta}>Chưa có hình ảnh nào được chia sẻ</Text>
          )}

          {sharedFiles.length > 0 && (
            <View style={styles.filesList}>
              {sharedFiles.map((file) => (
                <View key={file.id} style={styles.fileRow}>
                  <View style={styles.fileBadge}>
                    <Text style={styles.fileBadgeText}>
                      {file.fileExt ?? 'FILE'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.fileName}
                    </Text>
                    <Text style={styles.fileSize}>{file.fileSize}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Group Members */}
        {conversation.isGroup && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Thành viên nhóm ({conversation.members.length})
            </Text>
            {conversation.members.map((m, idx) => (
              <View
                key={m.id}
                style={[
                  styles.memberRow,
                  idx < conversation.members.length - 1 && styles.rowDivider,
                ]}
              >
                <Avatar name={m.name} size={40} isOnline={m.isOnline} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberSub}>
                    {m.role === 'admin' ? 'Trưởng nhóm' : 'Thành viên'}
                  </Text>
                </View>
                {m.role === 'admin' && (
                  <View style={styles.adminPill}>
                    <Text style={styles.adminPillText}>Admin</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Settings Switches */}
        <View style={styles.card}>
          <View style={[styles.switchRow, styles.rowDivider]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Tắt thông báo</Text>
              <Text style={styles.switchSub}>
                Không nhận chuông báo khi có tin nhắn mới
              </Text>
            </View>
            <Switch
              value={conversation.isMuted}
              onValueChange={() => toggleMuteConversation(conversation.id)}
              trackColor={{ false: '#CBD5E1', true: Theme.colors.primaryLight }}
              thumbColor={
                conversation.isMuted ? Theme.colors.primaryDark : '#FFFFFF'
              }
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Ghim trò chuyện</Text>
              <Text style={styles.switchSub}>
                Luôn hiển thị ở đầu danh sách Tin nhắn
              </Text>
            </View>
            <Switch
              value={conversation.isPinned}
              onValueChange={() => togglePinConversation(conversation.id)}
              trackColor={{ false: '#CBD5E1', true: Theme.colors.primaryLight }}
              thumbColor={
                conversation.isPinned ? Theme.colors.primaryDark : '#FFFFFF'
              }
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.dangerRow, styles.rowDivider]}
            onPress={handleClearHistory}
          >
            <Text style={styles.dangerIcon}>🧹</Text>
            <Text style={styles.dangerText}>Xóa lịch sử trò chuyện</Text>
          </TouchableOpacity>

          {conversation.isGroup ? (
            <TouchableOpacity
              style={styles.dangerRow}
              onPress={handleLeaveGroup}
            >
              <Text style={styles.dangerIcon}>🚪</Text>
              <Text style={styles.dangerText}>Rời nhóm</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.dangerRow}
              onPress={handleToggleBlock}
            >
              <Text style={styles.dangerIcon}>🚫</Text>
              <Text style={styles.dangerText}>
                {conversation.isBlocked
                  ? 'Bỏ chặn người dùng này'
                  : 'Chặn người dùng này'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    backgroundColor: Theme.colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 12,
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  scroll: {
    padding: 14,
    gap: 12,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  heroName: {
    fontSize: 19,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginTop: 12,
  },
  heroSub: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 3,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCircleActive: {
    backgroundColor: Theme.colors.primarySoft,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  quickIcon: {
    fontSize: 18,
  },
  quickLabel: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaThumb: {
    width: 74,
    height: 74,
    borderRadius: 10,
    backgroundColor: Theme.colors.primarySoft,
  },
  emptyMeta: {
    fontSize: 13,
    color: Theme.colors.textMuted,
  },
  filesList: {
    marginTop: 12,
    gap: 8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primaryTint,
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  fileBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  fileName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  fileSize: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.divider,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  memberSub: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
  },
  adminPill: {
    backgroundColor: Theme.colors.primarySoft,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Theme.radius.pill,
  },
  adminPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  switchTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  switchSub: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  dangerIcon: {
    fontSize: 17,
  },
  dangerText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Theme.colors.danger,
  },
});
