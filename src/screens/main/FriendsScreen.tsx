import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import HeaderSearchBar from '../../components/common/HeaderSearchBar';
import { Theme } from '../../config/theme';
import { useChatStore } from '../../store/useChatStore';
import { Friend, MainStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<MainStackParamList>;
type SubTab = 'friends' | 'groups' | 'oa';

interface FriendSection {
  title: string;
  data: Friend[];
}

export default function FriendsScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    friends,
    friendRequests,
    conversations,
    officialAccounts,
    loadingFriends,
    fetchFriends,
    getOrCreateDirectConversation,
    removeFriend,
  } = useChatStore();

  const [query, setQuery] = useState('');
  const [subTab, setSubTab] = useState<SubTab>('friends');
  const [onlineOnly, setOnlineOnly] = useState(false);

  const onlineCount = useMemo(
    () => friends.filter((f) => f.isOnline).length,
    [friends],
  );

  // Group friends alphabetically A-Z
  const friendSections: FriendSection[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = friends
      .filter((f) => {
        if (onlineOnly && !f.isOnline) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          f.name.toLowerCase().includes(q) || (f.phone && f.phone.includes(q))
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    const map = new Map<string, Friend[]>();
    for (const friend of filtered) {
      const letter = friend.name
        .trim()
        .charAt(0)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      const list = map.get(key) ?? [];
      list.push(friend);
      map.set(key, list);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, data]) => ({ title, data }));
  }, [friends, query, onlineOnly]);

  const groupConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter(
      (c) =>
        c.isGroup &&
        (!q || c.name.toLowerCase().includes(q)),
    );
  }, [conversations, query]);

  const filteredOAs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return officialAccounts.filter(
      (oa) =>
        !q ||
        oa.name.toLowerCase().includes(q) ||
        oa.category.toLowerCase().includes(q),
    );
  }, [officialAccounts, query]);

  const handleOpenFriendChat = async (friend: Friend) => {
    const convId = await getOrCreateDirectConversation(friend);
    if (convId) {
      navigation.navigate('ChatDetail', { conversationId: convId });
    }
  };

  const handleRemoveFriend = (friend: Friend) => {
    const targetId = friend.friendshipId;
    if (!targetId) {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin kết bạn để hủy.');
      return;
    }
    Alert.alert(
      'Hủy kết bạn',
      `Bạn có chắc muốn hủy kết bạn với "${friend.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hủy kết bạn',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(targetId);
              Alert.alert('Thành công', `Đã hủy kết bạn với ${friend.name}.`);
            } catch (err: any) {
              Alert.alert(
                'Lỗi',
                err?.response?.data?.message || 'Không thể hủy kết bạn',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <HeaderSearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm bạn bè, nhóm..."
        rightIcon="👤+"
        onPressRight={() =>
          navigation.navigate('AddFriend', { initialTab: 'phone' })
        }
        rightAccessibilityLabel="Thêm bạn"
      />

      {/* Sub-tabs: Bạn bè / Nhóm / OA */}
      <View style={styles.subTabBar}>
        {(
          [
            { key: 'friends', label: 'Bạn bè' },
            { key: 'groups', label: 'Nhóm' },
            { key: 'oa', label: 'OA' },
          ] as { key: SubTab; label: string }[]
        ).map((tab) => {
          const active = subTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.subTabBtn, active && styles.subTabBtnActive]}
              onPress={() => setSubTab(tab.key)}
            >
              <Text
                style={[styles.subTabText, active && styles.subTabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {subTab === 'friends' && (
        <SectionList
          sections={friendSections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl
              refreshing={loadingFriends}
              onRefresh={fetchFriends}
              colors={[Theme.colors.primary]}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Friend Requests Row */}
              <TouchableOpacity
                style={styles.featureRow}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('FriendRequests')}
              >
                <View style={styles.featureIconBox}>
                  <Text style={styles.featureIcon}>🤝</Text>
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Lời mời kết bạn</Text>
                  <Text style={styles.featureSubtitle}>
                    {friendRequests.length > 0
                      ? `${friendRequests.length} lời mời đang chờ xác nhận`
                      : 'Không có lời mời mới'}
                  </Text>
                </View>
                {friendRequests.length > 0 && <Badge count={friendRequests.length} />}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              {/* Add Friend Shortcut */}
              <TouchableOpacity
                style={[styles.featureRow, styles.featureRowBorder]}
                activeOpacity={0.75}
                onPress={() =>
                  navigation.navigate('AddFriend', { initialTab: 'phone' })
                }
              >
                <View
                  style={[
                    styles.featureIconBox,
                    { backgroundColor: '#DCFCE7' },
                  ]}
                >
                  <Text style={styles.featureIcon}>📱</Text>
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Thêm bạn mới</Text>
                  <Text style={styles.featureSubtitle}>
                    Tìm theo tên người dùng hoặc mã QR
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              {/* Filter chips: All vs Online */}
              <View style={styles.friendFilterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    !onlineOnly && styles.filterChipActive,
                  ]}
                  onPress={() => setOnlineOnly(false)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      !onlineOnly && styles.filterChipTextActive,
                    ]}
                  >
                    Tất cả ({friends.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    onlineOnly && styles.filterChipActive,
                  ]}
                  onPress={() => setOnlineOnly(true)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      onlineOnly && styles.filterChipTextActive,
                    ]}
                  >
                    Đang online ({onlineCount})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.friendRow}
              activeOpacity={0.7}
              onPress={() => handleOpenFriendChat(item)}
              onLongPress={() => handleRemoveFriend(item)}
            >
              <Avatar
                name={item.name}
                uri={item.avatarUrl}
                size={46}
                isOnline={item.isOnline}
              />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text
                  style={[
                    styles.friendStatus,
                    item.isOnline && styles.friendStatusOnline,
                  ]}
                  numberOfLines={1}
                >
                  {item.isOnline
                    ? 'Đang hoạt động'
                    : item.bio || item.lastActiveText}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.callIconBtn}
                onPress={() =>
                  Alert.alert(
                    'Đang phát triển',
                    'Tính năng gọi thoại hiện đang được phát triển và sẽ sớm ra mắt.',
                  )
                }
                accessibilityLabel="Gọi thoại (Đang phát triển)"
              >
                <Text style={styles.callIconText}>📞</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.unfriendIconBtn}
                onPress={() => handleRemoveFriend(item)}
                accessibilityLabel="Hủy kết bạn"
              >
                <Text style={styles.unfriendIconText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyTitle}>Chưa có bạn bè nào</Text>
              <Text style={styles.emptySubtitle}>
                Hãy nhấn "Thêm bạn mới" để tìm kiếm và kết nối nhé!
              </Text>
            </View>
          }
        />
      )}

      {subTab === 'groups' && (
        <FlatList
          data={groupConversations}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.featureRow}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <View
                style={[
                  styles.featureIconBox,
                  { backgroundColor: Theme.colors.primaryTint },
                ]}
              >
                <Text style={styles.featureIcon}>👥</Text>
              </View>
                <View style={styles.featureTextCol}>
                  <View style={styles.titleWithBadge}>
                    <Text style={styles.featureTitle}>Tạo nhóm mới</Text>
                    <View style={styles.devBadge}>
                      <Text style={styles.devBadgeText}>Đang phát triển</Text>
                    </View>
                  </View>
                  <Text style={styles.featureSubtitle}>
                    Trò chuyện cùng bạn bè và đồng nghiệp
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.friendRow}
              onPress={() =>
                navigation.navigate('ChatDetail', { conversationId: item.id })
              }
            >
              <Avatar
                name={item.name}
                uri={item.avatarUrl}
                size={46}
                isGroup
                members={item.members}
              />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendStatus}>
                  {item.members.length} thành viên
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Chưa tham gia nhóm nào</Text>
              <Text style={styles.emptySubtitle}>
                Tính năng nhắn tin nhóm đang được phát triển.
              </Text>
            </View>
          }
        />
      )}

      {subTab === 'oa' && (
        <FlatList
          data={filteredOAs}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.devBanner}>
              <Text style={styles.devBannerText}>
                🚧 Official Account (OA) đang phát triển — dữ liệu minh họa.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.friendRow}
              onPress={() =>
                Alert.alert(
                  'Đang phát triển',
                  `${item.name}: ${item.description}\n\nTính năng OA đang được phát triển.`,
                )
              }
            >
              <View style={styles.oaAvatar}>
                <Text style={{ fontSize: 24 }}>{item.avatarEmoji}</Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendStatus}>{item.followersText}</Text>
              </View>
              <View style={styles.devBadge}>
                <Text style={styles.devBadgeText}>Đang phát triển</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Không tìm thấy OA phù hợp</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabBtnActive: {
    borderBottomColor: Theme.colors.primary,
  },
  subTabText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  subTabTextActive: {
    color: Theme.colors.primaryDark,
    fontWeight: '700',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  featureRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.colors.divider,
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Theme.colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15.5,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  featureSubtitle: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: Theme.colors.textMuted,
    marginLeft: 8,
  },
  friendFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Theme.colors.background,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: Theme.colors.primaryTint,
    borderColor: Theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Theme.colors.primaryDark,
    fontWeight: '700',
  },
  sectionHeader: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textMuted,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.divider,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 15.5,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  friendStatus: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  friendStatusOnline: {
    color: Theme.colors.success,
    fontWeight: '600',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  devBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  devBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
  },
  devBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  devBannerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#92400E',
  },
  callIconBtn: {
    padding: 8,
  },
  callIconText: {
    fontSize: 18,
  },
  unfriendIconBtn: {
    padding: 8,
    marginLeft: 2,
  },
  unfriendIconText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.danger,
  },
  oaAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
