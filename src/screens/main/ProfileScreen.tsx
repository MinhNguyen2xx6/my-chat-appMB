import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import { Theme } from '../../config/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { MainStackParamList } from '../../types';
import { resolveMediaUrl } from '../../utils/url';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

const SETTINGS_ITEMS = [
  { id: 'cloud', icon: '☁️', title: 'Cloud của tôi', subtitle: 'Lưu trữ tin nhắn và tệp quan trọng' },
  { id: 'storage', icon: '💾', title: 'Dung lượng và dữ liệu', subtitle: 'Quản lý bộ nhớ đệm và tải xuống' },
  { id: 'security', icon: '🛡️', title: 'Tài khoản và bảo mật', subtitle: 'Mật khẩu, thiết bị đã đăng nhập' },
  { id: 'privacy', icon: '🔒', title: 'Quyền riêng tư', subtitle: 'Hiển thị trạng thái online, lời mời kết bạn' },
  { id: 'theme', icon: '🎨', title: 'Giao diện & Ngôn ngữ', subtitle: 'Xanh Pastel • Tiếng Việt' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const displayName = user?.displayName || 'Người dùng MyChat';
  const username = user?.username ? `@${user.username}` : '@mychat_user';

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi tài khoản này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Pastel Blue Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 10) + 8 },
        ]}
      >
        <Text style={styles.headerTitle}>Cá nhân</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() =>
            Alert.alert(
              'Đang phát triển',
              'Trang cài đặt nâng cao đang được phát triển.',
            )
          }
          accessibilityLabel="Cài đặt (Đang phát triển)"
        >
          <Text style={styles.headerBtnIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.85}
          onPress={() =>
            Alert.alert(
              displayName,
              `${username}\n${user?.email || 'Chưa cập nhật email'}`,
            )
          }
        >
          <Avatar
            name={displayName}
            uri={resolveMediaUrl(user?.avatarUrl)}
            size={60}
            isOnline
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileSub}>{username}</Text>
          </View>
          <TouchableOpacity
            style={styles.qrPill}
            onPress={() =>
              navigation.navigate('AddFriend', { initialTab: 'qr' })
            }
          >
            <Text style={styles.qrPillText}>Mã QR</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Settings List */}
        <View style={styles.menuCard}>
          {SETTINGS_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                idx < SETTINGS_ITEMS.length - 1 && styles.menuDivider,
              ]}
              onPress={() =>
                Alert.alert(
                  'Đang phát triển',
                  `Tính năng "${item.title}" hiện đang được phát triển và sẽ sớm ra mắt.`,
                )
              }
            >
              <View style={styles.menuIconWrap}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuBody}>
                <View style={styles.menuTitleRow}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <View style={styles.devBadge}>
                    <Text style={styles.devBadgeText}>Đang phát triển</Text>
                  </View>
                </View>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.8}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    backgroundColor: Theme.colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnIcon: {
    fontSize: 18,
  },
  scroll: {
    padding: 14,
    gap: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17.5,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  profileSub: {
    fontSize: 13.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  qrPill: {
    backgroundColor: Theme.colors.primaryTint,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Theme.radius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.primarySoft,
  },
  qrPillText: {
    color: Theme.colors.primaryDark,
    fontSize: 12.5,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.divider,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 19,
  },
  menuBody: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: Theme.colors.textMuted,
  },
  signOutBtn: {
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: Theme.colors.danger,
    fontSize: 15.5,
    fontWeight: '700',
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  devBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  devBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
});
