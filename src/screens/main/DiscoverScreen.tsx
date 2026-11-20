import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HeaderSearchBar from '../../components/common/HeaderSearchBar';
import { Theme } from '../../config/theme';

const MINI_APPS = [
  { id: 'ma1', icon: '⚡', title: 'Hóa đơn', bg: '#E0F2FE' },
  { id: 'ma2', icon: '🛍️', title: 'Mua sắm', bg: '#FCE7F3' },
  { id: 'ma3', icon: '🚗', title: 'Đặt xe', bg: '#DCFCE7' },
  { id: 'ma4', icon: '🎬', title: 'Vé phim', bg: '#FEF3C7' },
  { id: 'ma5', icon: '🎵', title: 'Nhạc chill', bg: '#EDE9FE' },
  { id: 'ma6', icon: '🎮', title: 'Trò chơi', bg: '#FFE4E6' },
  { id: 'ma7', icon: '🌤️', title: 'Thời tiết', bg: '#DBEAFE' },
  { id: 'ma8', icon: '📍', title: 'Quanh đây', bg: '#CCFBF1' },
];

const FEATURE_CARDS = [
  {
    id: 'f1',
    icon: '🎮',
    title: 'Trung tâm Trò chơi',
    desc: 'Chơi ngay các mini game giải trí cùng bạn bè',
  },
  {
    id: 'f2',
    icon: '📰',
    title: 'Tin tức nổi bật hôm nay',
    desc: 'Cập nhật nhanh công nghệ, đời sống, giải trí',
  },
  {
    id: 'f3',
    icon: '🎁',
    title: 'Ưu đãi & Quà tặng',
    desc: 'Săn voucher cà phê, ăn uống giảm đến 50%',
  },
  {
    id: 'f4',
    icon: '☁️',
    title: 'Tiện ích Cloud & Ghi chú',
    desc: 'Lưu trữ nhanh tài liệu và đồng bộ mọi thiết bị',
  },
];

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');

  const filteredApps = MINI_APPS.filter((a) =>
    a.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <HeaderSearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm tiện ích, Mini App..."
        showQrButton
        onPressQr={() => Alert.alert('Quét mã QR', 'Mở trình quét mã QR')}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tiện ích & Mini Apps</Text>
          <View style={styles.grid}>
            {filteredApps.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.gridItem}
                onPress={() => Alert.alert(app.title, `Đang mở tiện ích ${app.title}...`)}
              >
                <View style={[styles.appIconBox, { backgroundColor: app.bg }]}>
                  <Text style={styles.appIcon}>{app.icon}</Text>
                </View>
                <Text style={styles.appTitle}>{app.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Khám phá thêm</Text>
          {FEATURE_CARDS.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.featureRow,
                idx < FEATURE_CARDS.length - 1 && styles.featureDivider,
              ]}
              onPress={() => Alert.alert(item.title, item.desc)}
            >
              <View style={styles.featureIconWrap}>
                <Text style={styles.featureEmoji}>{item.icon}</Text>
              </View>
              <View style={styles.featureBody}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.desc}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scroll: {
    padding: 14,
    gap: 14,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 14,
  },
  appIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  appIcon: {
    fontSize: 23,
  },
  appTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  featureDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Theme.colors.divider,
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Theme.colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureBody: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  featureDesc: {
    fontSize: 12.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: Theme.colors.textMuted,
    paddingLeft: 8,
  },
});
