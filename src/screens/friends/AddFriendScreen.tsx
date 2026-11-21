import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import { Theme } from '../../config/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { searchUsersByName } from '../../services/api/users';
import { MainStackParamList } from '../../types';

type AddFriendRouteProp = RouteProp<MainStackParamList, 'AddFriend'>;

export default function AddFriendScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<AddFriendRouteProp>();
  const user = useAuthStore((s) => s.user);
  const { sentFriendPhones, sendFriendRequestById } = useChatStore();

  const [tab, setTab] = useState<'phone' | 'qr'>(
    route.params?.initialTab ?? 'phone',
  );
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = keyword.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const { data } = await searchUsersByName(q);
        setSearchResults(data.users || []);
      } catch (err) {
        console.warn('Lỗi tìm kiếm bạn bè:', err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSend = async (targetId: string, targetName: string) => {
    try {
      await sendFriendRequestById(targetId);
      setSearchResults((prev) =>
        prev.map((u) => (u._id === targetId ? { ...u, relation: 'sent' } : u)),
      );
      Alert.alert('Đã gửi lời mời', `Đã gửi lời mời kết bạn tới ${targetName}!`);
    } catch (err: any) {
      Alert.alert('Thông báo', err?.response?.data?.message || 'Không thể gửi lời mời kết bạn');
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
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm bạn</Text>
        <View style={{ width: 34 }} />
      </View>

      {/* Tabs: Số điện thoại / Mã QR */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'phone' && styles.tabBtnActive]}
          onPress={() => setTab('phone')}
        >
          <Text
            style={[styles.tabText, tab === 'phone' && styles.tabTextActive]}
          >
            Số điện thoại
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'qr' && styles.tabBtnActive]}
          onPress={() => setTab('qr')}
        >
          <Text style={[styles.tabText, tab === 'qr' && styles.tabTextActive]}>
            Quét / Mã QR
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'phone' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.searchCard}>
            <Text style={styles.label}>Tìm bạn bè theo tên hoặc username</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.phoneInput}
                value={keyword}
                onChangeText={setKeyword}
                placeholder="Nhập tên hiển thị (vd: An, Minh, Nam...)"
                placeholderTextColor={Theme.colors.textMuted}
                autoCapitalize="none"
              />
              {searching && (
                <ActivityIndicator
                  size="small"
                  color={Theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
              )}
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            {keyword.trim() ? 'Kết quả tìm kiếm' : 'Nhập tên để tìm kiếm bạn bè'}
          </Text>

          {keyword.trim() && searchResults.length === 0 && !searching ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Không tìm thấy người dùng phù hợp với "{keyword.trim()}"
              </Text>
            </View>
          ) : (
            searchResults.map((u) => {
              const isSent = u.relation === 'sent' || sentFriendPhones.includes(u._id);
              const isFriend = u.relation === 'friend';
              const isReceived = u.relation === 'received';

              let btnLabel = 'Kết bạn';
              if (isFriend) btnLabel = 'Bạn bè';
              else if (isSent) btnLabel = 'Đã gửi';
              else if (isReceived) btnLabel = 'Chấp nhận';

              return (
                <View key={u._id} style={styles.userCard}>
                  <Avatar name={u.displayName || u.username} uri={u.avatarUrl} size={48} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.displayName || u.username}</Text>
                    <Text style={styles.userPhone}>@{u.username}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addBtn,
                      (isSent || isFriend) && styles.addBtnSent,
                    ]}
                    disabled={isSent || isFriend}
                    onPress={() => handleSend(u._id, u.displayName || u.username)}
                  >
                    <Text
                      style={[
                        styles.addBtnText,
                        (isSent || isFriend) && styles.addBtnTextSent,
                      ]}
                    >
                      {btnLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.qrScroll}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>
              {user?.displayName || 'Người dùng MyChat'}
            </Text>
            <Text style={styles.qrSub}>
              Quét mã QR này để kết bạn nhanh trên MyChat
            </Text>

            <View style={styles.qrFrame}>
              <View style={styles.qrPattern}>
                <Text style={styles.qrEmoji}>🏁</Text>
                <Text style={styles.qrCodeLabel}>MYCHAT-QR</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() =>
                Alert.alert(
                  'Quét mã QR',
                  'Đang mở camera quét mã QR của bạn bè...',
                )
              }
            >
              <Text style={styles.scanBtnText}>📷 Mở camera quét mã QR</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  tabTextActive: {
    color: Theme.colors.primaryDark,
    fontWeight: '700',
  },
  scroll: {
    padding: 14,
    gap: 12,
  },
  searchCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryPill: {
    backgroundColor: Theme.colors.primaryTint,
    paddingHorizontal: 10,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  countryText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
  },
  phoneInput: {
    flex: 1,
    height: 44,
    backgroundColor: Theme.colors.primaryTint,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14.5,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  userPhone: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Theme.radius.pill,
  },
  addBtnSent: {
    backgroundColor: Theme.colors.primaryTint,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  addBtnTextSent: {
    color: Theme.colors.primaryDark,
  },
  emptyCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Theme.colors.textSecondary,
    fontSize: 13.5,
  },
  qrScroll: {
    padding: 20,
    alignItems: 'center',
  },
  qrCard: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  qrSub: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  qrFrame: {
    width: 210,
    height: 210,
    borderRadius: 20,
    backgroundColor: Theme.colors.primaryTint,
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  qrPattern: {
    width: 168,
    height: 168,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.primarySoft,
  },
  qrEmoji: {
    fontSize: 54,
  },
  qrCodeLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: Theme.colors.primaryDark,
  },
  scanBtn: {
    width: '100%',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 13,
    borderRadius: Theme.radius.pill,
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
