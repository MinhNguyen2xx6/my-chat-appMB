import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../config/theme';

interface HeaderSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showQrButton?: boolean;
  onPressQr?: () => void;
  rightIcon?: string;
  onPressRight?: () => void;
  rightAccessibilityLabel?: string;
}

export default function HeaderSearchBar({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm bạn bè, nhóm, tin nhắn...',
  showQrButton = false,
  onPressQr,
  rightIcon = '＋',
  onPressRight,
  rightAccessibilityLabel = 'Thêm mới',
}: HeaderSearchBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) + 6 }]}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.88)"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showQrButton && (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onPressQr}
          accessibilityLabel="Quét mã QR"
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <View style={styles.qrGlyph}>
            <View style={[styles.qrCorner, styles.qrTL]} />
            <View style={[styles.qrCorner, styles.qrTR]} />
            <View style={[styles.qrCorner, styles.qrBL]} />
            <View style={[styles.qrCorner, styles.qrBR]} />
            <View style={styles.qrLine} />
          </View>
        </TouchableOpacity>
      )}

      {onPressRight && (
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onPressRight}
          accessibilityLabel={rightAccessibilityLabel}
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={styles.rightIconText}>{rightIcon}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.headerBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.headerSearchBg,
    borderRadius: Theme.radius.pill,
    paddingHorizontal: 12,
    height: 38,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14.5,
    paddingVertical: 0,
  },
  clearBtn: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    paddingLeft: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  qrGlyph: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrCorner: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderColor: '#FFFFFF',
  },
  qrTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  qrTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  qrBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  qrBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
  qrLine: {
    width: 14,
    height: 1.5,
    backgroundColor: '#FFFFFF',
  },
});
