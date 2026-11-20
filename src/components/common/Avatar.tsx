import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getAvatarColor, Theme } from '../../config/theme';
import { Member } from '../../types';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  isOnline?: boolean;
  isGroup?: boolean;
  members?: Member[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  name,
  uri,
  size = 50,
  isOnline = false,
  isGroup = false,
  members = [],
}: AvatarProps) {
  const dotSize = Math.max(10, Math.round(size * 0.26));

  // Group composite avatar (Zalo-style 2x2 collage)
  if (isGroup && !uri && members.length >= 2) {
    const tiles = members.slice(0, 4);
    const tileSize = Math.floor((size - 4) / 2);

    return (
      <View
        style={[
          styles.groupWrapper,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <View style={styles.groupGrid}>
          {tiles.map((m, idx) => (
            <View
              key={m.id || idx}
              style={[
                styles.groupTile,
                {
                  width: tileSize,
                  height: tileSize,
                  borderRadius: tileSize / 2,
                  backgroundColor: getAvatarColor(m.name),
                },
              ]}
            >
              {m.avatarUrl ? (
                <Image
                  source={{ uri: m.avatarUrl }}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: tileSize / 2,
                  }}
                />
              ) : (
                <Text
                  style={[
                    styles.groupTileText,
                    { fontSize: Math.max(8, Math.round(tileSize * 0.44)) },
                  ]}
                >
                  {getInitials(m.name)}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: Theme.colors.primarySoft,
          }}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: getAvatarColor(name),
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              { fontSize: Math.max(12, Math.round(size * 0.36)) },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {isOnline && !isGroup && (
        <View
          style={[
            styles.onlineDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              borderWidth: size >= 44 ? 2.5 : 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.online,
    borderColor: '#FFFFFF',
  },
  groupWrapper: {
    backgroundColor: Theme.colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    borderWidth: 1,
    borderColor: Theme.colors.primarySoft,
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1.5,
  },
  groupTile: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  groupTileText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
