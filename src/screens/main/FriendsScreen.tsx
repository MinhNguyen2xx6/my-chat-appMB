import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
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
    getOrCreateDirectConversation,
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
          f.name.toLowerCase().includes(q) || f.phone.includes(q)
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

  const handleOpenFriendChat = (friend: Friend) => {
    const convId = getOrCreateDirectConversation(friend);
    navigation.navigate('ChatDetail', { conversationId: convId });
  };

  return (
    <View style={styles.container}>
      <HeaderSearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm bạn bè, nhóm, số điện thoại..."
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
                <Badge count={friendRequests.length} />
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
                    Tìm theo số điện thoại hoặc quét mã QR
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              {/* Filter chips: All vs Online */}
              <View style={styles.friendFilterRow}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    !onlineOnly && styles.chipActive,
                  ]}
                  onPress={() => setOnlineOnly(false)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      !onlineOnly && styles.chipTextActive,
                    ]}
                  >
                    Tất cả ({friends.length})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    onlineOnly && styles.chipActive,
                  ]}
                  onPress={() => setOnlineOnly(true)}
                >
                  <View style={styles.chipOnlineDot} />
                  <Text
                    style={[
                      styles.chipText,
                      onlineOnly && styles.chipTextActive,
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
              activeOpacity={0.75}
              onPress={() => handleOpenFriendChat(item)}
            >
              <Avatar
                name={item.name}
                uri={item.avatarUrl}
                size={46}
                isOnline={item.isOnline}
              />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendStatus} numberOfLines={1}>
                  {item.isOnline ? 'Đang hoạt động' : item.lastActiveText}
                </Text>
              </View>

              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() =>
                    Alert.alert('Gọi thoại', `Đang gọi thoại cho ${item.name}...`)
                  }
                >
                  <Text style={styles.quickBtnIcon}>📞</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() =>
                    Alert.alert('Gọi video', `Đang gọi video cho ${item.name}...`)
                  }
                >
                  <Text style={styles.quickBtnIcon}>📹</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Không tìm thấy bạn bè phù hợp</Text>
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
              style={styles.createGroupBanner}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <View style={styles.createGroupIcon}>
                <Text style={{ fontSize: 22 }}>👥</Text>
              </View>
              <Text style={styles.createGroupText}>Tạo nhóm mới</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.friendRow}
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate('ChatDetail', { conversationId: item.id })
              }
            >
              <Avatar
                name={item.name}
                size={48}
                isGroup
                members={item.members}
              />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendStatus} numberOfLines={1}>
                  {item.members.length} thành viên • {item.lastMessageText}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Bạn chưa tham gia nhóm nào</Text>
            </View>
          }
        />
      )}

      {subTab === 'oa' && (
        <FlatList
          data={filteredOAs}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.oaHeader}>
              <Text style={styles.oaHeaderTitle}>
                Official Account đã quan tâm ({filteredOAs.length})
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.friendRow}
              activeOpacity={0.75}
              onPress={() =>
                Alert.alert(item.name, `${item.description}\n(${item.followersText})`)
              }
            >
              <View style={styles.oaAvatar}>
                <Text style={{ fontSize: 24 }}>{item.avatarEmoji}</Text>
              </View>
              <View style={styles.friendInfo}>
                <View style={styles.oaNameRow}>
                  <Text style={styles.friendName}>{item.name}</Text>
                  {item.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.friendStatus} numberOfLines={1}>
                  {item.category} • {item.followersText}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2.5,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  featureSubtitle: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: Theme.colors.textMuted,
    paddingLeft: 8,
  },
  friendFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Theme.colors.background,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    gap: 6,
  },
  chipActive: {
    backgroundColor: Theme.colors.primarySoft,
    borderColor: Theme.colors.primary,
  },
  chipOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.online,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  chipTextActive: {
    color: Theme.colors.primaryDark,
  },
  sectionHeader: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  sectionHeaderText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.divider,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  friendStatus: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 6,
  },
  quickBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickBtnIcon: {
    fontSize: 15,
  },
  createGroupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.divider,
  },
  createGroupIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createGroupText: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
  },
  oaHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  oaHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  oaAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.primaryTint,
    borderWidth: 1,
    borderColor: Theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oaNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Theme.colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
  },
});
