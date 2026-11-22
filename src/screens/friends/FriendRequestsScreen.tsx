import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import { Theme } from '../../config/theme';
import { useChatStore } from '../../store/useChatStore';
import { formatConversationTime } from '../../utils/formatDate';

export default function FriendRequestsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    friendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    fetchFriendRequests,
  } = useChatStore();

  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchFriendRequests();
    } finally {
      setRefreshing(false);
    }
  };

  const handleAction = async (
    requestId: string,
    action: 'accept' | 'decline',
  ) => {
    if (processingIds[requestId]) {
      return;
    }
    setProcessingIds((prev) => ({ ...prev, [requestId]: true }));
    try {
      if (action === 'accept') {
        await acceptFriendRequest(requestId);
      } else {
        await declineFriendRequest(requestId);
      }
    } catch (err: any) {
      Alert.alert(
        'Lỗi',
        err?.response?.data?.message ||
          'Không thể xử lý lời mời kết bạn. Vui lòng thử lại.',
      );
    } finally {
      setProcessingIds((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <View style={styles.root}>
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
        <Text style={styles.headerTitle}>
          Lời mời kết bạn ({friendRequests.length})
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <FlatList
        data={friendRequests}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Theme.colors.primaryDark]}
          />
        }
        contentContainerStyle={
          friendRequests.length === 0 ? styles.emptyContainer : styles.list
        }
        renderItem={({ item }) => {
          const busy = Boolean(processingIds[item.id]);
          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <Avatar name={item.name} uri={item.avatarUrl} size={52} />
                <View style={styles.infoCol}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {formatConversationTime(item.createdAt)} •{' '}
                    {item.mutualFriends} bạn chung
                  </Text>
                </View>
              </View>

              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={[styles.declineBtn, busy && styles.btnDisabled]}
                  disabled={busy}
                  onPress={() => handleAction(item.id, 'decline')}
                >
                  <Text style={styles.declineText}>Từ chối</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.acceptBtn, busy && styles.btnDisabled]}
                  disabled={busy}
                  onPress={() => handleAction(item.id, 'accept')}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.acceptText}>Đồng ý</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyTitle}>Không còn lời mời kết bạn</Text>
            <Text style={styles.emptySub}>
              Khi có người gửi lời mời kết bạn, danh sách sẽ hiển thị tại đây.
            </Text>
          </View>
        }
      />
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
  list: {
    padding: 14,
    gap: 12,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  meta: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  messageBox: {
    marginTop: 10,
    backgroundColor: Theme.colors.primaryTint,
    borderRadius: 10,
    padding: 10,
  },
  messageText: {
    fontSize: 13.5,
    color: Theme.colors.textPrimary,
    lineHeight: 19,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  declineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  declineText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.primaryDark,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
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
  emptySub: {
    fontSize: 13.5,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
