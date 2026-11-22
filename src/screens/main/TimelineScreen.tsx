import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import HeaderSearchBar from '../../components/common/HeaderSearchBar';
import { Theme } from '../../config/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { formatConversationTime } from '../../utils/formatDate';
import { resolveMediaUrl } from '../../utils/url';

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { timelinePosts, friends, toggleLikePost, addTimelinePost } =
    useChatStore();

  const [query, setQuery] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [postText, setPostText] = useState('');

  const filteredPosts = timelinePosts.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return (
      p.authorName.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    );
  });

  const handleCreatePost = () => {
    const trimmed = postText.trim();
    if (!trimmed) {
      return;
    }
    addTimelinePost(trimmed, user?.displayName || 'Bạn');
    setPostText('');
    setComposerOpen(false);
  };

  return (
    <View style={styles.container}>
      <HeaderSearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm kiếm nhật ký, bạn bè..."
        rightIcon="✎"
        onPressRight={() => setComposerOpen(true)}
        rightAccessibilityLabel="Đăng bài mới"
      />

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.devBanner}>
              <Text style={styles.devBannerText}>
                🚧 Tính năng Nhật ký đang phát triển — bài đăng hiện chỉ hiển thị cục bộ trên thiết bị.
              </Text>
            </View>

            {/* Composer Box */}
            <TouchableOpacity
              style={styles.composerCard}
              activeOpacity={0.8}
              onPress={() => setComposerOpen(true)}
            >
              <Avatar
                name={user?.displayName || 'Bạn'}
                uri={resolveMediaUrl(user?.avatarUrl)}
                size={42}
                isOnline
              />
              <Text style={styles.composerPlaceholder}>
                Hôm nay bạn thế nào?
              </Text>
              <TouchableOpacity
                style={styles.composerTag}
                onPress={() =>
                  Alert.alert(
                    'Đang phát triển',
                    'Tính năng đăng ảnh lên Nhật ký đang được phát triển.',
                  )
                }
              >
                <Text style={styles.composerTagText}>🖼️ Ảnh</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Stories / Khoảnh khắc */}
            <View style={styles.storiesCard}>
              <View style={styles.storiesHeaderRow}>
                <Text style={styles.storiesTitle}>Khoảnh khắc</Text>
                <View style={styles.devBadge}>
                  <Text style={styles.devBadgeText}>Đang phát triển</Text>
                </View>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={friends.slice(0, 7)}
                keyExtractor={(f) => f.id}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.storyItem}
                    onPress={() =>
                      Alert.alert(
                        'Đang phát triển',
                        'Tính năng Khoảnh khắc hiện đang được phát triển.',
                      )
                    }
                  >
                    <View style={styles.storyRing}>
                      <Avatar name={item.name} uri={item.avatarUrl} size={50} />
                    </View>
                    <Text style={styles.storyName} numberOfLines={1}>
                      {item.name.split(' ').pop()}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <Avatar name={item.authorName} size={42} />
              <View style={styles.postAuthorCol}>
                <Text style={styles.postAuthor}>{item.authorName}</Text>
                <Text style={styles.postTime}>
                  {formatConversationTime(item.createdAt)}
                </Text>
              </View>
            </View>

            <Text style={styles.postContent}>{item.content}</Text>

            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.postActionBtn}
                onPress={() => toggleLikePost(item.id)}
              >
                <Text style={styles.postActionText}>
                  {item.isLiked ? '🩵' : '🤍'} Thích ({item.likes})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postActionBtn}
                onPress={() =>
                  Alert.alert(
                    'Đang phát triển',
                    'Tính năng bình luận bài viết đang được phát triển.',
                  )
                }
              >
                <Text style={styles.postActionText}>
                  💬 Bình luận ({item.commentsCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* New Post Modal */}
      <Modal
        visible={composerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setComposerOpen(false)}
      >
        <KeyboardAvoidingView behavior="height" style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setComposerOpen(false)}>
                <Text style={styles.modalCancel}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Đăng nhật ký</Text>
              <TouchableOpacity onPress={handleCreatePost}>
                <Text style={styles.modalSubmit}>Đăng</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              multiline
              autoFocus
              placeholder="Chia sẻ cảm nghĩ của bạn hôm nay..."
              placeholderTextColor={Theme.colors.textMuted}
              value={postText}
              onChangeText={setPostText}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  composerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  composerPlaceholder: {
    flex: 1,
    marginLeft: 12,
    color: Theme.colors.textMuted,
    fontSize: 15,
  },
  composerTag: {
    backgroundColor: Theme.colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  composerTagText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Theme.colors.primaryDark,
  },
  storiesCard: {
    backgroundColor: Theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  storiesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 10,
  },
  storyItem: {
    alignItems: 'center',
    width: 62,
  },
  storyRing: {
    padding: 2.5,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  storyName: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    marginTop: 5,
    fontWeight: '500',
  },
  postCard: {
    backgroundColor: Theme.colors.surface,
    marginBottom: 8,
    padding: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAuthorCol: {
    marginLeft: 10,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  postTime: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  postContent: {
    fontSize: 14.5,
    lineHeight: 21,
    color: Theme.colors.textPrimary,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: Theme.colors.primarySoft,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Theme.colors.divider,
    paddingTop: 10,
    gap: 16,
  },
  postActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  postActionText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: 240,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalCancel: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  modalSubmit: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
  },
  modalInput: {
    fontSize: 15.5,
    color: Theme.colors.textPrimary,
    minHeight: 130,
    textAlignVertical: 'top',
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
  storiesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
});
