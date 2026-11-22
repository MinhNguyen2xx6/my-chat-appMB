import React, { useEffect, useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Badge from '../../components/common/Badge';
import { Theme } from '../../config/theme';
import { useChatStore } from '../../store/useChatStore';
import { MainTabKey } from '../../types';
import ConversationListScreen from './ConversationListScreen';
import FriendsScreen from './FriendsScreen';
import ProfileScreen from './ProfileScreen';
import TimelineScreen from './TimelineScreen';

interface TabConfig {
  key: MainTabKey;
  label: string;
  icon: string;
  activeIcon: string;
}

const TABS: TabConfig[] = [
  { key: 'messages', label: 'Tin nhắn', icon: '💬', activeIcon: '💬' },
  { key: 'contacts', label: 'Danh bạ', icon: '📒', activeIcon: '📒' },
  { key: 'timeline', label: 'Nhật ký', icon: '🕒', activeIcon: '🕒' },
  { key: 'profile', label: 'Cá nhân', icon: '👤', activeIcon: '👤' },
];

export default function MainShellScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<MainTabKey>('messages');
  // Giữ các tab đã mở mounted để không mất vị trí cuộn & bộ lọc khi chuyển tab
  const [mountedTabs, setMountedTabs] = useState<Record<MainTabKey, boolean>>({
    messages: true,
    contacts: false,
    timeline: false,
    profile: false,
  });

  const conversations = useChatStore((s) => s.conversations);
  const friendRequestsCount = useChatStore((s) => s.friendRequests.length);
  const fetchConversations = useChatStore((s) => s.fetchConversations);
  const fetchFriends = useChatStore((s) => s.fetchFriends);
  const fetchFriendRequests = useChatStore((s) => s.fetchFriendRequests);

  useEffect(() => {
    fetchConversations();
    fetchFriends();
    fetchFriendRequests();
  }, [fetchConversations, fetchFriends, fetchFriendRequests]);

  const handleSelectTab = (key: MainTabKey) => {
    setActiveTab(key);
    if (!mountedTabs[key]) {
      setMountedTabs((prev) => ({ ...prev, [key]: true }));
    }
  };

  // Tổng số tin nhắn chưa đọc trên các hội thoại không tắt thông báo
  const totalUnreadMessages = useMemo(
    () =>
      conversations.reduce(
        (sum, conv) => sum + (conv.isMuted ? 0 : conv.unreadCount),
        0,
      ),
    [conversations],
  );

  const getTabBadge = (key: MainTabKey): number => {
    if (key === 'messages') {
      return totalUnreadMessages;
    }
    if (key === 'contacts') {
      return friendRequestsCount;
    }
    return 0;
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Theme.colors.headerBg}
      />

      {/* Top content viewport (preserve tab state) */}
      <View style={styles.contentArea}>
        {mountedTabs.messages && (
          <View
            style={[
              styles.tabPane,
              activeTab !== 'messages' && styles.tabPaneHidden,
            ]}
          >
            <ConversationListScreen />
          </View>
        )}
        {mountedTabs.contacts && (
          <View
            style={[
              styles.tabPane,
              activeTab !== 'contacts' && styles.tabPaneHidden,
            ]}
          >
            <FriendsScreen />
          </View>
        )}
        {mountedTabs.timeline && (
          <View
            style={[
              styles.tabPane,
              activeTab !== 'timeline' && styles.tabPaneHidden,
            ]}
          >
            <TimelineScreen />
          </View>
        )}
        {mountedTabs.profile && (
          <View
            style={[
              styles.tabPane,
              activeTab !== 'profile' && styles.tabPaneHidden,
            ]}
          >
            <ProfileScreen />
          </View>
        )}
      </View>

      {/* 4-Tab Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 6) },
        ]}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const badgeCount = getTabBadge(tab.key);

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabBtn}
              activeOpacity={0.75}
              onPress={() => handleSelectTab(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View
                style={[
                  styles.iconWrap,
                  isActive && styles.iconWrapActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabIcon,
                    !isActive && styles.tabIconInactive,
                  ]}
                >
                  {isActive ? tab.activeIcon : tab.icon}
                </Text>

                {badgeCount > 0 && (
                  <Badge
                    count={badgeCount}
                    size="sm"
                    style={styles.tabBadge}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  contentArea: {
    flex: 1,
  },
  tabPane: {
    flex: 1,
  },
  tabPaneHidden: {
    display: 'none',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: 6,
    paddingHorizontal: 4,
    ...Theme.shadow.sm,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconWrap: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapActive: {
    backgroundColor: Theme.colors.primaryTint,
  },
  tabIcon: {
    fontSize: 19,
  },
  tabIconInactive: {
    opacity: 0.58,
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    right: -4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Theme.colors.textSecondary,
    marginTop: 3,
  },
  tabLabelActive: {
    color: Theme.colors.primaryDark,
    fontWeight: '700',
  },
});
