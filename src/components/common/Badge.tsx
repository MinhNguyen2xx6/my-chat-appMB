import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Theme } from '../../config/theme';

interface BadgeProps {
  count: number;
  muted?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export default function Badge({
  count,
  muted = false,
  size = 'md',
  style,
}: BadgeProps) {
  if (count <= 0) {
    return null;
  }

  const label = count > 99 ? '99+' : String(count);
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        isSmall ? styles.sm : styles.md,
        { backgroundColor: muted ? Theme.colors.badgeMuted : Theme.colors.badgeRed },
        style,
      ]}
    >
      <Text style={[styles.text, isSmall && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.radius.pill,
  },
  md: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
  },
  sm: {
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 10,
  },
});
