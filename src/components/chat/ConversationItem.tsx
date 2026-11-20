import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Theme } from '../../config/theme';
import { Conversation } from '../../types';
import { formatConversationTime } from '../../utils/formatDate';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
  onLongPress: (conversation: Conversation) => void;
  onTogglePin: (id: string) => void;
  onToggleMute: (id: string) => void;
  onDelete: (id: string) => void;
}

const ACTION_WIDTH = 204; // 3 buttons * 68

export default function ConversationItem({
  conversation,
  onPress,
  onLongPress,
  onTogglePin,
  onToggleMute,
  onDelete,
}: ConversationItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);

  const closeSwipe = () => {
    isOpen.current = false;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const openSwipe = () => {
    isOpen.current = true;
    Animated.spring(translateX, {
      toValue: -ACTION_WIDTH,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
      onPanResponderMove: (_, gesture) => {
        const base = isOpen.current ? -ACTION_WIDTH : 0;
        const next = Math.max(-ACTION_WIDTH - 20, Math.min(0, base + gesture.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const base = isOpen.current ? -ACTION_WIDTH : 0;
        const finalX = base + gesture.dx;
        if (finalX < -ACTION_WIDTH * 0.35 || gesture.vx < -0.5) {
          openSwipe();
        } else {
          closeSwipe();
        }
      },
    }),
  ).current;

  const hasUnread = conversation.unreadCount > 0;

  return (
    <View style={styles.outer}>
      {/* Swipe actions behind row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.pinBtn]}
          onPress={() => {
            closeSwipe();
            onTogglePin(conversation.id);
          }}
        >
          <Text style={styles.actionIcon}>📌</Text>
          <Text style={styles.actionLabel}>
            {conversation.isPinned ? 'Bỏ ghim' : 'Ghim'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.muteBtn]}
          onPress={() => {
            closeSwipe();
            onToggleMute(conversation.id);
          }}
        >
          <Text style={styles.actionIcon}>
            {conversation.isMuted ? '🔔' : '🔕'}
          </Text>
          <Text style={styles.actionLabel}>
            {conversation.isMuted ? 'Bật TB' : 'Tắt TB'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => {
            closeSwipe();
            onDelete(conversation.id);
          }}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionLabel}>Xóa</Text>
        </TouchableOpacity>
      </View>

      {/* Foreground swipeable card */}
      <Animated.View
        style={[
          styles.rowWrapper,
          conversation.isPinned && styles.pinnedRow,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.75}
          onPress={() => {
            if (isOpen.current) {
              closeSwipe();
            } else {
              onPress(conversation);
            }
          }}
          onLongPress={() => onLongPress(conversation)}
          delayLongPress={320}
        >
          <Avatar
            name={conversation.name}
            uri={conversation.avatarUrl}
            size={54}
            isOnline={conversation.isOnline}
            isGroup={conversation.isGroup}
            members={conversation.members}
          />

          <View style={styles.content}>
            <View style={styles.topLine}>
              <View style={styles.nameWrap}>
                {conversation.isGroup && (
                  <View style={styles.groupTag}>
                    <Text style={styles.groupTagText}>Nhóm</Text>
                  </View>
                )}
                <Text
                  style={[styles.name, hasUnread && styles.nameUnread]}
                  numberOfLines={1}
                >
                  {conversation.name}
                </Text>
              </View>

              <View style={styles.timeWrap}>
                {conversation.isPinned && (
                  <Text style={styles.statusIcon}>📌</Text>
                )}
                {conversation.isMuted && (
                  <Text style={styles.statusIcon}>🔕</Text>
                )}
                <Text
                  style={[styles.time, hasUnread && styles.timeUnread]}
                >
                  {formatConversationTime(conversation.lastMessageTime)}
                </Text>
              </View>
            </View>

            <View style={styles.bottomLine}>
              <Text
                style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
                numberOfLines={1}
              >
                {conversation.isGroup &&
                conversation.lastMessageSender &&
                conversation.lastMessageSender !== 'Bạn'
                  ? `${conversation.lastMessageSender}: ${conversation.lastMessageText}`
                  : conversation.lastMessageText}
              </Text>

              <Badge
                count={conversation.unreadCount}
                muted={conversation.isMuted}
                size="sm"
                style={styles.badge}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.divider,
  },
  actionsRow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    width: ACTION_WIDTH,
  },
  actionBtn: {
    width: 68,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  pinBtn: {
    backgroundColor: '#7CB9F8',
  },
  muteBtn: {
    backgroundColor: '#94A3B8',
  },
  deleteBtn: {
    backgroundColor: Theme.colors.badgeRed,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  rowWrapper: {
    backgroundColor: Theme.colors.surface,
  },
  pinnedRow: {
    backgroundColor: '#F6FAFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  topLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  groupTag: {
    backgroundColor: Theme.colors.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginRight: 6,
  },
  groupTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
  },
  name: {
    flexShrink: 1,
    fontSize: 15.5,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  nameUnread: {
    fontWeight: '700',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIcon: {
    fontSize: 11,
  },
  time: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  timeUnread: {
    color: Theme.colors.primaryDark,
    fontWeight: '600',
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 13.5,
    color: Theme.colors.textSecondary,
    marginRight: 8,
  },
  lastMessageUnread: {
    color: Theme.colors.textPrimary,
    fontWeight: '500',
  },
  badge: {
    marginLeft: 4,
  },
});
