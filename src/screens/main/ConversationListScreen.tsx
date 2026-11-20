import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ConversationItem from '../../components/chat/ConversationItem';
import HeaderSearchBar from '../../components/common/HeaderSearchBar';
import { Theme } from '../../config/theme';
import { useChatStore } from '../../store/useChatStore';
import { Conversation, MainStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<MainStackParamList>;
type FilterKey = 'all' | 'unread' | 'groups';

export default function ConversationListScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    conversations,
    togglePinConversation,
    toggleMuteConversation,
    toggleReadStatus,
    markAsRead,
    deleteConversation,
  } = useChatStore();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...conversations]
      .filter((c) => {
        if (filter === 'unread' && c.unreadCount === 0) {
          return false;
        }
        if (filter === 'groups' && !c.isGroup) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          c.name.toLowerCase().includes(q) ||
          c.lastMessageText.toLowerCase().includes(q) ||
          c.members.some((m) => m.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return b.lastMessageTime - a.lastMessageTime;
      });
  }, [conversations, query, filter]);

  const unreadConversationsCount = useMemo(
    () => conversations.filter((c) => c.unreadCount > 0).length,
    [conversations],
  );

  const handleOpenConversation = (conv: Conversation) => {
    markAsRead(conv.id);
    navigation.navigate('ChatDetail', { conversationId: conv.id });
  };

  const confirmDelete = (id: string, name?: string) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      `Bạn có chắc muốn xóa cuộc trò chuyện${name ? ` với "${name}"` : ''}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteConversation(id),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <HeaderSearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm bạn bè, nhóm, tin nhắn..."
        showQrButton
        onPressQr={() => navigation.navigate('AddFriend', { initialTab: 'qr' })}
        rightIcon="＋"
        onPressRight={() => setShowAddMenu(true)}
        rightAccessibilityLabel="Tạo nhóm hoặc thêm bạn"
      />

      {/* Filter pills */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === 'unread' && styles.filterPillActive,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'unread' && styles.filterTextActive,
            ]}
          >
            Chưa đọc{unreadConversationsCount > 0 ? ` (${unreadConversationsCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterPill,
            filter === 'groups' && styles.filterPillActive,
          ]}
          onPress={() => setFilter('groups')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'groups' && styles.filterTextActive,
            ]}
          >
            Nhóm
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={handleOpenConversation}
            onLongPress={(conv) => setSelectedConv(conv)}
            onTogglePin={togglePinConversation}
            onToggleMute={toggleMuteConversation}
            onDelete={(id) => confirmDelete(id, item.name)}
          />
        )}
        contentContainerStyle={
          filteredConversations.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy cuộc trò chuyện</Text>
            <Text style={styles.emptySubtitle}>
              Thử từ khóa khác hoặc tạo cuộc trò chuyện mới
            </Text>
          </View>
        }
      />

      {/* Top-right "+" Popover Menu */}
      <Modal
        visible={showAddMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMenu(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setShowAddMenu(false)}
        >
          <View style={styles.popoverMenu}>
            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setShowAddMenu(false);
                navigation.navigate('AddFriend', { initialTab: 'phone' });
              }}
            >
              <Text style={styles.popoverIcon}>👤+</Text>
              <Text style={styles.popoverText}>Thêm bạn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.popoverItem}
              onPress={() => {
                setShowAddMenu(false);
                navigation.navigate('CreateGroup');
              }}
            >
              <Text style={styles.popoverIcon}>👥</Text>
              <Text style={styles.popoverText}>Tạo nhóm mới</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.popoverItem, styles.popoverLast]}
              onPress={() => {
                setShowAddMenu(false);
                navigation.navigate('AddFriend', { initialTab: 'qr' });
              }}
            >
              <Text style={styles.popoverIcon}>📷</Text>
              <Text style={styles.popoverText}>Quét mã QR</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Long-press Action Sheet */}
      <Modal
        visible={selectedConv !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedConv(null)}
      >
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setSelectedConv(null)}
        >
          <Pressable style={styles.sheetCard} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {selectedConv?.name}
            </Text>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                if (selectedConv) {
                  togglePinConversation(selectedConv.id);
                }
                setSelectedConv(null);
              }}
            >
              <Text style={styles.sheetActionIcon}>📌</Text>
              <Text style={styles.sheetActionText}>
                {selectedConv?.isPinned ? 'Bỏ ghim hội thoại' : 'Ghim lên đầu'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                if (selectedConv) {
                  toggleReadStatus(selectedConv.id);
                }
                setSelectedConv(null);
              }}
            >
              <Text style={styles.sheetActionIcon}>✓</Text>
              <Text style={styles.sheetActionText}>
                {selectedConv && selectedConv.unreadCount > 0
                  ? 'Đánh dấu đã đọc'
                  : 'Đánh dấu chưa đọc'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetAction}
              onPress={() => {
                if (selectedConv) {
                  toggleMuteConversation(selectedConv.id);
                }
                setSelectedConv(null);
              }}
            >
              <Text style={styles.sheetActionIcon}>
                {selectedConv?.isMuted ? '🔔' : '🔕'}
              </Text>
              <Text style={styles.sheetActionText}>
                {selectedConv?.isMuted ? 'Bật thông báo' : 'Tắt thông báo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetAction, styles.sheetDanger]}
              onPress={() => {
                const target = selectedConv;
                setSelectedConv(null);
                if (target) {
                  confirmDelete(target.id, target.name);
                }
              }}
            >
              <Text style={styles.sheetActionIcon}>🗑️</Text>
              <Text style={[styles.sheetActionText, styles.sheetDangerText]}>
                Xóa cuộc trò chuyện
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.primaryTint,
  },
  filterPillActive: {
    backgroundColor: Theme.colors.primary,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Theme.colors.primaryDark,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  // Popover
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    alignItems: 'flex-end',
    paddingTop: 94,
    paddingRight: 14,
  },
  popoverMenu: {
    width: 196,
    backgroundColor: Theme.colors.surface,
    borderRadius: 14,
    paddingVertical: 6,
    ...Theme.shadow.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.divider,
    gap: 12,
  },
  popoverLast: {
    borderBottomWidth: 0,
  },
  popoverIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  popoverText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  // Action Sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  sheetActionIcon: {
    fontSize: 18,
    width: 26,
    textAlign: 'center',
  },
  sheetActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  sheetDanger: {
    marginTop: 4,
    backgroundColor: '#FFF5F5',
  },
  sheetDangerText: {
    color: Theme.colors.danger,
  },
});
