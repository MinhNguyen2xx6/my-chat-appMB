import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Theme } from '../../config/theme';
import { CURRENT_USER_ID } from '../../store/useChatStore';
import { Message } from '../../types';
import { formatClockTime, formatVoiceDuration } from '../../utils/formatDate';
import Avatar from '../common/Avatar';

interface MessageBubbleProps {
  message: Message;
  isGroup: boolean;
  showSenderInfo: boolean;
  isLastOwnMessage: boolean;
  onPressImage?: (uri: string) => void;
}

const WAVE_BARS = [8, 16, 12, 22, 14, 18, 10, 24, 16, 12, 20, 14, 10, 16, 12];

export default function MessageBubble({
  message,
  isGroup,
  showSenderInfo,
  isLastOwnMessage,
  onPressImage,
}: MessageBubbleProps) {
  const isMe = message.senderId === CURRENT_USER_ID;
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);

  const duration = message.voiceDurationSec ?? 10;

  useEffect(() => {
    if (!isPlayingVoice) {
      return;
    }
    const timer = setInterval(() => {
      setVoiceProgress((prev) => {
        if (prev + 1 >= duration) {
          setIsPlayingVoice(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlayingVoice, duration]);

  const renderStatus = () => {
    if (!isMe || !isLastOwnMessage) {
      return null;
    }
    let label = 'Đã gửi';
    let icon = '✓';
    if (message.status === 'sending') {
      label = 'Đang gửi...';
      icon = '○';
    } else if (message.status === 'seen') {
      label = 'Đã xem';
      icon = '✓✓';
    }
    return (
      <View style={styles.statusRow}>
        <Text
          style={[
            styles.statusText,
            message.status === 'seen' && styles.statusSeen,
          ]}
        >
          {icon} {label}
        </Text>
      </View>
    );
  };

  const renderBody = () => {
    switch (message.type) {
      case 'sticker':
        return (
          <View style={styles.stickerBox}>
            <Text style={styles.stickerEmoji}>{message.stickerEmoji ?? '😊'}</Text>
            {message.stickerLabel && (
              <Text style={styles.stickerLabel}>{message.stickerLabel}</Text>
            )}
            <Text style={styles.stickerTime}>{formatClockTime(message.createdAt)}</Text>
          </View>
        );

      case 'image':
        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => message.imageUrl && onPressImage?.(message.imageUrl)}
            style={[styles.mediaBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
          >
            {message.imageUrl ? (
              <Image
                source={{ uri: message.imageUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.messageImage, styles.imagePlaceholder]}>
                <Text style={{ fontSize: 32 }}>🖼️</Text>
              </View>
            )}
            <View style={styles.imageTimePill}>
              <Text style={styles.imageTimeText}>
                {formatClockTime(message.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>
        );

      case 'file':
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              Alert.alert(
                'Tệp đính kèm',
                `${message.fileName ?? 'Tài liệu'} (${message.fileSize ?? '1.0 MB'})`,
              )
            }
            style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
          >
            <View style={styles.fileRow}>
              <View style={styles.fileIconBadge}>
                <Text style={styles.fileExtText}>{message.fileExt ?? 'FILE'}</Text>
              </View>
              <View style={styles.fileMeta}>
                <Text style={styles.fileName} numberOfLines={2}>
                  {message.fileName ?? 'Tai_lieu.pdf'}
                </Text>
                <Text style={styles.fileSize}>
                  {message.fileSize ?? '1.2 MB'} • Nhấn để xem
                </Text>
              </View>
            </View>
            <Text style={[styles.timeText, isMe && styles.timeMe]}>
              {formatClockTime(message.createdAt)}
            </Text>
          </TouchableOpacity>
        );

      case 'voice': {
        const playedRatio = duration > 0 ? voiceProgress / duration : 0;
        const activeBars = Math.floor(playedRatio * WAVE_BARS.length);
        return (
          <View
            style={[
              styles.bubble,
              styles.voiceBubble,
              isMe ? styles.bubbleMe : styles.bubbleOther,
            ]}
          >
            <View style={styles.voiceRow}>
              <TouchableOpacity
                style={styles.voicePlayBtn}
                onPress={() => setIsPlayingVoice((v) => !v)}
              >
                <Text style={styles.voicePlayIcon}>
                  {isPlayingVoice ? '❚❚' : '▶'}
                </Text>
              </TouchableOpacity>

              <View style={styles.waveContainer}>
                {WAVE_BARS.map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: h,
                        backgroundColor:
                          i <= activeBars && isPlayingVoice
                            ? Theme.colors.primaryDark
                            : Theme.colors.primaryLight,
                      },
                    ]}
                  />
                ))}
              </View>

              <Text style={styles.voiceDuration}>
                {formatVoiceDuration(isPlayingVoice ? voiceProgress : duration)}
              </Text>
            </View>
            <Text style={[styles.timeText, isMe && styles.timeMe]}>
              {formatClockTime(message.createdAt)}
            </Text>
          </View>
        );
      }

      case 'location':
        return (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              Alert.alert(
                message.locationName ?? 'Vị trí đã chia sẻ',
                message.locationAddress ?? 'Đang mở bản đồ...',
              )
            }
            style={[
              styles.bubble,
              styles.locationBubble,
              isMe ? styles.bubbleMe : styles.bubbleOther,
            ]}
          >
            <View style={styles.locationMapPreview}>
              <Text style={styles.locationPin}>📍</Text>
              <Text style={styles.locationMapLabel}>Vị trí trực tiếp</Text>
            </View>
            <Text style={styles.locationTitle}>
              {message.locationName ?? 'Địa điểm đã ghim'}
            </Text>
            <Text style={styles.locationAddress} numberOfLines={2}>
              {message.locationAddress ?? 'TP. Hồ Chí Minh'}
            </Text>
            <Text style={[styles.timeText, isMe && styles.timeMe]}>
              {formatClockTime(message.createdAt)}
            </Text>
          </TouchableOpacity>
        );

      default:
        return (
          <View
            style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
          >
            {!isMe && isGroup && showSenderInfo && (
              <Text style={styles.senderName}>{message.senderName}</Text>
            )}
            <Text style={styles.messageText}>{message.content}</Text>
            <Text style={[styles.timeText, isMe && styles.timeMe]}>
              {formatClockTime(message.createdAt)}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
      <View style={[styles.row, isMe && styles.rowReverse]}>
        {!isMe && (
          <View style={styles.avatarCol}>
            {showSenderInfo ? (
              <Avatar name={message.senderName} size={32} />
            ) : (
              <View style={{ width: 32 }} />
            )}
          </View>
        )}

        <View style={[styles.bubbleCol, isMe && styles.bubbleColMe]}>
          {!isMe &&
            isGroup &&
            showSenderInfo &&
            message.type !== 'text' && (
              <Text style={styles.senderNameOutside}>{message.senderName}</Text>
            )}
          {renderBody()}
          {renderStatus()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 3,
    paddingHorizontal: 12,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '84%',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  avatarCol: {
    marginRight: 8,
    marginBottom: 2,
  },
  bubbleCol: {
    flexShrink: 1,
    alignItems: 'flex-start',
  },
  bubbleColMe: {
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
  },
  bubbleMe: {
    backgroundColor: Theme.colors.bubbleMe,
    borderColor: Theme.colors.bubbleMeBorder,
    borderBottomRightRadius: 5,
  },
  bubbleOther: {
    backgroundColor: Theme.colors.bubbleOther,
    borderColor: Theme.colors.bubbleOtherBorder,
    borderBottomLeftRadius: 5,
  },
  senderName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
    marginBottom: 3,
  },
  senderNameOutside: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
    marginBottom: 3,
    marginLeft: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.textPrimary,
  },
  timeText: {
    fontSize: 10.5,
    color: Theme.colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: '#5B82A8',
  },
  statusRow: {
    marginTop: 3,
    marginRight: 2,
  },
  statusText: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  statusSeen: {
    color: Theme.colors.primaryDark,
  },
  // Sticker
  stickerBox: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  stickerEmoji: {
    fontSize: 64,
    lineHeight: 74,
  },
  stickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stickerTime: {
    fontSize: 10.5,
    color: Theme.colors.textMuted,
    marginTop: 3,
  },
  // Image
  mediaBubble: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  messageImage: {
    width: 220,
    height: 165,
    backgroundColor: Theme.colors.primarySoft,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTimePill: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  imageTimeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '600',
  },
  // File
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 200,
  },
  fileIconBadge: {
    width: 42,
    height: 46,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileExtText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  fileMeta: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  fileSize: {
    fontSize: 11.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  // Voice
  voiceBubble: {
    minWidth: 210,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voicePlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voicePlayIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  waveContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 26,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.primaryDark,
    minWidth: 32,
    textAlign: 'right',
  },
  // Location
  locationBubble: {
    width: 230,
    padding: 8,
  },
  locationMapPreview: {
    height: 82,
    borderRadius: 12,
    backgroundColor: '#CFE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationPin: {
    fontSize: 28,
  },
  locationMapLabel: {
    fontSize: 11,
    color: Theme.colors.primaryDark,
    fontWeight: '600',
    marginTop: 2,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  locationAddress: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
});
