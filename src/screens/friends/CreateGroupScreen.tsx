import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import { Theme } from '../../config/theme';
import { useChatStore } from '../../store/useChatStore';
import { MainStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<MainStackParamList>;

export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const friends = useChatStore((s) => s.friends);

  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleCreate = () => {
    Alert.alert(
      'Đang phát triển',
      'Tính năng Tạo nhóm mới hiện đang được phát triển và sẽ sớm ra mắt khi hoàn thiện API máy chủ.',
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
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhóm mới</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={styles.createAction}>Tạo ({selectedIds.length})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.devBanner}>
        <Text style={styles.devBannerText}>
          🚧 Tính năng Tạo nhóm mới đang phát triển — chưa kết nối API máy chủ.
        </Text>
      </View>

      <View style={styles.nameCard}>
        <View style={styles.groupAvatarPlaceholder}>
          <Text style={{ fontSize: 24 }}>👥</Text>
        </View>
        <TextInput
          style={styles.nameInput}
          value={groupName}
          onChangeText={setGroupName}
          placeholder="Đặt tên nhóm..."
          placeholderTextColor={Theme.colors.textMuted}
        />
      </View>

      <Text style={styles.sectionLabel}>Chọn thành viên</Text>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const checked = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => toggleSelect(item.id)}
            >
              <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Avatar
                name={item.name}
                uri={item.avatarUrl}
                size={44}
                isOnline={item.isOnline}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.phone}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Chưa có bạn bè nào</Text>
            <Text style={styles.emptySub}>
              Hãy kết bạn trước khi tạo nhóm trò chuyện.
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
    paddingHorizontal: 12,
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
  createAction: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.pill,
    overflow: 'hidden',
  },
  devBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  devBannerText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#92400E',
  },
  nameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  groupAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.primarySoft,
    paddingVertical: 6,
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.divider,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Theme.colors.primaryDark,
    borderColor: Theme.colors.primaryDark,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  sub: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
