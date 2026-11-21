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
import DiscoverScreen from './DiscoverScreen';
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
  { key: 'discover', label: 'Khám phá', icon: '🧭', activeIcon: '🧭' },
  { key: 'timeline', label: 'Nhật ký', icon: '🕒', activeIcon: '🕒' },
  { key: 'profile', label: 'Cá nhân', icon: '👤', activeIcon: '👤' },
];

export default function MainShellScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<MainTabKey>('messages');

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

  // Total unread count across non-muted conversations (or all unread)
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

  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return <ConversationListScreen />;
      case 'contacts':
        return <FriendsScreen />;
      case 'discover':
        return <DiscoverScreen />;
      case 'timeline':
        return <TimelineScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Theme.colors.headerBg}
      />

      {/* Top content viewport */}
      <View style={styles.contentArea}>{renderContent()}</View>

      {/* 5-Tab Bottom Navigation Bar */}
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
              onPress={() => setActiveTab(tab.key)}
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
    width: 42,
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
