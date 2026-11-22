import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import Avatar from '../../components/common/Avatar';
import { Theme } from '../../config/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import {
  findUserByQr,
  getMyQrCode,
  scanQrImage,
  searchUsersByName,
} from '../../services/api/users';
import { MainStackParamList } from '../../types';

type AddFriendRouteProp = RouteProp<MainStackParamList, 'AddFriend'>;

export default function AddFriendScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<AddFriendRouteProp>();
  const user = useAuthStore((s) => s.user);
  const { sentFriendPhones, sendFriendRequestById } = useChatStore();

  const [tab, setTab] = useState<'username' | 'qr'>(
    route.params?.initialTab === 'qr' ? 'qr' : 'username',
  );

  // Tab Tên người dùng
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Tab Mã QR
  const [myQrCode, setMyQrCode] = useState<string>('');
  const [myQrImage, setMyQrImage] = useState<string>('');
  const [loadingMyQr, setLoadingMyQr] = useState(false);

  const [qrInput, setQrInput] = useState('');
  const [qrResult, setQrResult] = useState<any | null>(null);
  const [qrError, setQrError] = useState('');
  const [searchingQr, setSearchingQr] = useState(false);

  // Camera Scanner Modal
  const [scannerOpen, setScannerOpen] = useState(false);
  const scanLockRef = useRef(false);
  const backDevice = useCameraDevice('back');

  // Tìm kiếm theo tên người dùng
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

  // Tải mã QR của bản thân (tự động sinh cho cả tài khoản cũ lẫn mới)
  useEffect(() => {
    if (tab !== 'qr' || myQrImage) {
      return;
    }
    let active = true;
    (async () => {
      try {
        setLoadingMyQr(true);
        const { data } = await getMyQrCode();
        if (active) {
          setMyQrCode(data.qrCode || '');
          setMyQrImage(data.qrImage || '');
        }
      } catch (err) {
        console.warn('Lỗi tải mã QR:', err);
      } finally {
        if (active) {
          setLoadingMyQr(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [tab, myQrImage]);

  const handleSend = async (targetId: string, targetName: string) => {
    try {
      const data = await sendFriendRequestById(targetId);
      const nextRelation = data?.status === 'friend' ? 'friend' : 'sent';
      setSearchResults((prev) =>
        prev.map((u) =>
          u._id === targetId ? { ...u, relation: nextRelation } : u,
        ),
      );
      if (qrResult && qrResult._id === targetId) {
        setQrResult({ ...qrResult, relation: nextRelation });
      }
      Alert.alert(
        nextRelation === 'friend' ? 'Thành công' : 'Đã gửi lời mời',
        nextRelation === 'friend'
          ? `Bạn và ${targetName} đã trở thành bạn bè!`
          : `Đã gửi lời mời kết bạn tới ${targetName}!`,
      );
    } catch (err: any) {
      Alert.alert(
        'Thông báo',
        err?.response?.data?.message || 'Không thể gửi lời mời kết bạn',
      );
    }
  };

  const lookupQrCode = useCallback(async (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) {
      Alert.alert('Thiếu mã QR', 'Vui lòng nhập hoặc quét mã QR của bạn bè.');
      return;
    }
    try {
      setSearchingQr(true);
      setQrError('');
      setQrResult(null);
      setQrInput(code);
      const { data } = await findUserByQr(code);
      setQrResult(data.user || null);
    } catch (err: any) {
      setQrError(
        err?.response?.data?.message || 'Không tìm thấy tài khoản với mã QR này',
      );
    } finally {
      setSearchingQr(false);
    }
  }, []);

  // Mở camera quét mã QR
  const handleOpenCameraScanner = async () => {
    try {
      const currentStatus = Camera.getCameraPermissionStatus();
      let granted = currentStatus === 'granted';
      if (!granted) {
        const result = await Camera.requestCameraPermission();
        granted = result === 'granted';
      }

      if (!granted) {
        Alert.alert(
          'Cần quyền Camera',
          'Vui lòng cấp quyền truy cập Camera trong Cài đặt để quét mã QR.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }

      if (!backDevice) {
        Alert.alert(
          'Không tìm thấy Camera',
          'Thiết bị không có camera sau. Bạn có thể chọn ảnh mã QR từ thư viện để quét.',
        );
        return;
      }

      scanLockRef.current = false;
      setScannerOpen(true);
    } catch (err) {
      console.warn('Lỗi mở camera:', err);
      Alert.alert('Lỗi', 'Không thể mở camera quét mã QR.');
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (scanLockRef.current || !codes.length) {
        return;
      }
      const value = codes[0]?.value?.trim();
      if (!value) {
        return;
      }
      scanLockRef.current = true;
      setScannerOpen(false);
      lookupQrCode(value);
    },
  });

  // Chọn ảnh QR từ thư viện để quét
  const handlePickQrImage = async () => {
    try {
      setScannerOpen(false);
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (res.didCancel) {
        return;
      }
      if (res.errorCode) {
        Alert.alert(
          'Không thể chọn ảnh',
          res.errorMessage || 'Vui lòng cấp quyền truy cập thư viện ảnh.',
        );
        return;
      }

      const asset = res.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      setSearchingQr(true);
      setQrError('');
      setQrResult(null);

      const { data } = await scanQrImage(
        asset.uri,
        asset.type,
        asset.fileName,
      );
      if (data?.qrCode) {
        setQrInput(data.qrCode);
      }
      setQrResult(data?.user || null);
    } catch (err: any) {
      setQrError(
        err?.response?.data?.message ||
          'Không nhận diện được mã QR trong hình ảnh đã chọn',
      );
    } finally {
      setSearchingQr(false);
    }
  };

  const handleShareQr = async () => {
    if (!myQrCode) return;
    try {
      await Share.share({
        message: `Kết bạn với mình trên MyChat bằng mã QR: ${myQrCode}`,
      });
    } catch {}
  };

  const renderUserCard = (u: any) => {
    const isSent = u.relation === 'sent' || sentFriendPhones.includes(u._id);
    const isFriend = u.relation === 'friend';
    const isReceived = u.relation === 'received';

    let btnLabel = 'Kết bạn';
    if (isFriend) btnLabel = 'Bạn bè';
    else if (isSent) btnLabel = 'Đã gửi';
    else if (isReceived) btnLabel = 'Chấp nhận';

    return (
      <View key={u._id} style={styles.userCard}>
        <Avatar
          name={u.displayName || u.username}
          uri={u.avatarUrl}
          size={48}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{u.displayName || u.username}</Text>
          <Text style={styles.userPhone}>@{u.username}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, (isSent || isFriend) && styles.addBtnSent]}
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

      {/* Tabs: Tên người dùng / Mã QR */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'username' && styles.tabBtnActive]}
          onPress={() => setTab('username')}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'username' && styles.tabTextActive,
            ]}
          >
            Tên người dùng
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

      {tab === 'username' ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.searchCard}>
            <Text style={styles.label}>Tìm bạn bè theo tên người dùng</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.phoneInput}
                value={keyword}
                onChangeText={setKeyword}
                placeholder="Nhập tên hiển thị hoặc username..."
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
            {keyword.trim()
              ? 'Kết quả tìm kiếm'
              : 'Nhập tên người dùng để tìm kiếm bạn bè'}
          </Text>

          {keyword.trim() && searchResults.length === 0 && !searching ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Không tìm thấy người dùng phù hợp với "{keyword.trim()}"
              </Text>
            </View>
          ) : (
            searchResults.map(renderUserCard)
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.qrScroll}>
          {/* Quét mã QR (Camera + Tải ảnh lên) */}
          <View style={styles.qrLookupCard}>
            <Text style={styles.label}>Quét mã QR để kết bạn</Text>

            <View style={styles.scanActionsRow}>
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={handleOpenCameraScanner}
                disabled={searchingQr}
              >
                <Text style={styles.cameraBtnText}>📷 Quét bằng Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.galleryBtn}
                onPress={handlePickQrImage}
                disabled={searchingQr}
              >
                <Text style={styles.galleryBtnText}>🖼️ Tải ảnh QR lên</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputRow, { marginTop: 12 }]}>
              <TextInput
                style={styles.phoneInput}
                value={qrInput}
                onChangeText={(t) => {
                  setQrInput(t);
                  if (qrError) setQrError('');
                }}
                placeholder="Hoặc nhập mã QR (vd: MYCHAT-A1B2C3D4)"
                placeholderTextColor={Theme.colors.textMuted}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={() => lookupQrCode(qrInput)}
              />
              <TouchableOpacity
                style={styles.qrSearchBtn}
                onPress={() => lookupQrCode(qrInput)}
                disabled={searchingQr}
              >
                {searchingQr ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.qrSearchBtnText}>Tìm</Text>
                )}
              </TouchableOpacity>
            </View>

            {searchingQr && (
              <View style={styles.scanningStatusRow}>
                <ActivityIndicator size="small" color={Theme.colors.primary} />
                <Text style={styles.scanningStatusText}>
                  Đang quét và tìm kiếm tài khoản...
                </Text>
              </View>
            )}

            {!!qrError && <Text style={styles.qrErrorText}>{qrError}</Text>}

            {qrResult && (
              <View style={{ marginTop: 12 }}>{renderUserCard(qrResult)}</View>
            )}
          </View>

          {/* Mã QR của bản thân */}
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>
              {user?.displayName || 'Người dùng MyChat'}
            </Text>
            <Text style={styles.qrSub}>
              Đưa mã QR này cho bạn bè quét hoặc chia sẻ để kết bạn nhanh
            </Text>

            <View style={styles.qrFrame}>
              {loadingMyQr ? (
                <ActivityIndicator size="large" color={Theme.colors.primary} />
              ) : myQrImage ? (
                <Image
                  source={{ uri: myQrImage }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.qrPattern}>
                  <Text style={styles.qrEmoji}>🏁</Text>
                  <Text style={styles.qrCodeLabel}>MYCHAT-QR</Text>
                </View>
              )}
            </View>

            {!!myQrCode && (
              <View style={styles.qrCodeBadge}>
                <Text style={styles.qrCodeValue}>{myQrCode}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.scanBtn}
              onPress={handleShareQr}
              disabled={!myQrCode}
            >
              <Text style={styles.scanBtnText}>📤 Chia sẻ mã QR của tôi</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Fullscreen Camera QR Scanner Modal */}
      <Modal
        visible={scannerOpen}
        animationType="slide"
        onRequestClose={() => setScannerOpen(false)}
      >
        <View style={styles.scannerRoot}>
          {backDevice && scannerOpen && (
            <Camera
              style={StyleSheet.absoluteFill}
              device={backDevice}
              isActive={scannerOpen}
              codeScanner={codeScanner}
            />
          )}

          {/* Top Bar */}
          <View
            style={[
              styles.scannerTopBar,
              { paddingTop: Math.max(insets.top, 14) + 8 },
            ]}
          >
            <TouchableOpacity
              style={styles.scannerCloseBtn}
              onPress={() => setScannerOpen(false)}
            >
              <Text style={styles.scannerCloseText}>✕ Đóng</Text>
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Quét mã QR</Text>
            <View style={{ width: 72 }} />
          </View>

          {/* Center Scan Frame */}
          <View style={styles.scannerCenter}>
            <View style={styles.scannerBox}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.scannerHint}>
              Di chuyển camera vào mã QR của bạn bè để tự động quét
            </Text>
          </View>

          {/* Bottom Bar: Upload QR image from gallery */}
          <View
            style={[
              styles.scannerBottomBar,
              { paddingBottom: Math.max(insets.bottom, 20) + 12 },
            ]}
          >
            <TouchableOpacity
              style={styles.scannerGalleryBtn}
              onPress={handlePickQrImage}
            >
              <Text style={styles.scannerGalleryText}>
                🖼️ Chọn ảnh QR từ thư viện
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  phoneInput: {
    flex: 1,
    height: 44,
    backgroundColor: Theme.colors.primaryTint,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
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
    padding: 16,
    gap: 14,
  },
  scanActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cameraBtn: {
    flex: 1,
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  galleryBtn: {
    flex: 1,
    backgroundColor: Theme.colors.primaryTint,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  galleryBtnText: {
    color: Theme.colors.primaryDark,
    fontSize: 13.5,
    fontWeight: '700',
  },
  scanningStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  scanningStatusText: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
  },
  qrCard: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 20,
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
    marginBottom: 16,
  },
  qrFrame: {
    width: 210,
    height: 210,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  qrImage: {
    width: 192,
    height: 192,
  },
  qrPattern: {
    width: 168,
    height: 168,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  qrCodeBadge: {
    backgroundColor: Theme.colors.primaryTint,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Theme.radius.pill,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 16,
  },
  qrCodeValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: Theme.colors.primaryDark,
  },
  scanBtn: {
    width: '100%',
    backgroundColor: Theme.colors.primary,
    paddingVertical: 12,
    borderRadius: Theme.radius.pill,
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  qrLookupCard: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  qrSearchBtn: {
    height: 44,
    paddingHorizontal: 18,
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  qrErrorText: {
    marginTop: 10,
    color: Theme.colors.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  // Fullscreen Camera Scanner Modal
  scannerRoot: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  scannerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  scannerCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  scannerCloseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  scannerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scannerBox: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#38BDF8',
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scannerHint: {
    marginTop: 22,
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scannerBottomBar: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  scannerGalleryBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    paddingVertical: 13,
    borderRadius: Theme.radius.pill,
    alignItems: 'center',
  },
  scannerGalleryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
