import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../../config/theme';
import { formatVoiceDuration } from '../../utils/formatDate';

interface ChatInputProps {
  disabled?: boolean;
  disabledText?: string;
  onSendText: (text: string) => void;
  onSendSticker: (emoji: string, label: string) => void;
  onSendImage: () => void;
  onSendFile: () => void;
  onSendLocation: () => void;
  onSendVoice: (durationSec: number) => void;
}

const EMOJIS = [
  '😊', '😂', '🥰', '😍', '🤩', '🥳', '😎', '🙌',
  '👍', '🩵', '🔥', '✨', '🎉', '🙏', '☕', '🚀',
  '😢', '😮', '🤔', '😴', '💯', '👌', '🌸', '🌈',
];

const STICKERS = [
  { emoji: '🐻', label: 'Chào bạn!' },
  { emoji: '🥳', label: 'Tuyệt vời!' },
  { emoji: '🫶', label: 'Yêu thương' },
  { emoji: '🚀', label: 'Triển thôi!' },
  { emoji: '☕', label: 'Cà phê nhé' },
  { emoji: '😴', label: 'Ngủ ngon' },
  { emoji: '👏', label: 'Xuất sắc' },
  { emoji: '🙏', label: 'Cảm ơn nha' },
];

type DrawerMode = 'none' | 'emoji' | 'attach';

export default function ChatInput({
  disabled = false,
  disabledText,
  onSendText,
  onSendSticker,
  onSendImage,
  onSendFile,
  onSendLocation,
  onSendVoice,
}: ChatInputProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [drawer, setDrawer] = useState<DrawerMode>('none');
  const [emojiTab, setEmojiTab] = useState<'emoji' | 'sticker'>('sticker');
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      return;
    }
    const timer = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    onSendText(trimmed);
    setText('');
  };

  const handleStartRecord = () => {
    setDrawer('none');
    setRecordSeconds(1);
    setIsRecording(true);
  };

  const handleCancelRecord = () => {
    setIsRecording(false);
    setRecordSeconds(0);
  };

  const handleFinishRecord = () => {
    const duration = Math.max(1, recordSeconds);
    setIsRecording(false);
    setRecordSeconds(0);
    onSendVoice(duration);
  };

  if (disabled) {
    return (
      <View
        style={[
          styles.disabledBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <Text style={styles.disabledText}>
          {disabledText ?? 'Bạn không thể gửi tin nhắn cho cuộc trò chuyện này.'}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {isRecording ? (
        <View style={styles.recordingBar}>
          <TouchableOpacity
            style={styles.cancelRecBtn}
            onPress={handleCancelRecord}
          >
            <Text style={styles.cancelRecText}>Hủy</Text>
          </TouchableOpacity>

          <View style={styles.recordingCenter}>
            <View style={styles.redDot} />
            <Text style={styles.recordingText}>
              Đang ghi âm {formatVoiceDuration(recordSeconds)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.sendRecBtn}
            onPress={handleFinishRecord}
          >
            <Text style={styles.sendRecText}>Gửi ➤</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              drawer === 'emoji' && styles.iconBtnActive,
            ]}
            onPress={() =>
              setDrawer((d) => (d === 'emoji' ? 'none' : 'emoji'))
            }
          >
            <Text style={styles.iconText}>😊</Text>
          </TouchableOpacity>

          <View style={styles.textInputWrap}>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={setText}
              onFocus={() => setDrawer('none')}
              placeholder="Tin nhắn..."
              placeholderTextColor={Theme.colors.textMuted}
              multiline
              maxLength={1000}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              drawer === 'attach' && styles.iconBtnActive,
            ]}
            onPress={() =>
              setDrawer((d) => (d === 'attach' ? 'none' : 'attach'))
            }
          >
            <Text style={styles.iconText}>📎</Text>
          </TouchableOpacity>

          {text.trim().length > 0 ? (
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.micBtn}
              onPress={handleStartRecord}
            >
              <Text style={styles.iconText}>🎙️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Emoji / Sticker Drawer */}
      {drawer === 'emoji' && (
        <View style={styles.drawer}>
          <View style={styles.drawerTabs}>
            <TouchableOpacity
              style={[
                styles.drawerTab,
                emojiTab === 'sticker' && styles.drawerTabActive,
              ]}
              onPress={() => setEmojiTab('sticker')}
            >
              <Text
                style={[
                  styles.drawerTabText,
                  emojiTab === 'sticker' && styles.drawerTabTextActive,
                ]}
              >
                Sticker
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.drawerTab,
                emojiTab === 'emoji' && styles.drawerTabActive,
              ]}
              onPress={() => setEmojiTab('emoji')}
            >
              <Text
                style={[
                  styles.drawerTabText,
                  emojiTab === 'emoji' && styles.drawerTabTextActive,
                ]}
              >
                Emoji
              </Text>
            </TouchableOpacity>
          </View>

          {emojiTab === 'sticker' ? (
            <ScrollView
              contentContainerStyle={styles.stickerGrid}
              showsVerticalScrollIndicator={false}
            >
              {STICKERS.map((s) => (
                <TouchableOpacity
                  key={s.label}
                  style={styles.stickerItem}
                  onPress={() => {
                    onSendSticker(s.emoji, s.label);
                    setDrawer('none');
                  }}
                >
                  <Text style={styles.stickerItemEmoji}>{s.emoji}</Text>
                  <Text style={styles.stickerItemLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emojiGrid}>
              {EMOJIS.map((em) => (
                <TouchableOpacity
                  key={em}
                  style={styles.emojiItem}
                  onPress={() => setText((prev) => prev + em)}
                >
                  <Text style={styles.emojiChar}>{em}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Attachment Drawer */}
      {drawer === 'attach' && (
        <View style={styles.attachDrawer}>
          <TouchableOpacity
            style={styles.attachItem}
            onPress={() => {
              setDrawer('none');
              onSendImage();
            }}
          >
            <View style={[styles.attachCircle, { backgroundColor: '#DCEEFF' }]}>
              <Text style={styles.attachEmoji}>🖼️</Text>
            </View>
            <Text style={styles.attachLabel}>Hình ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachItem}
            onPress={() => {
              setDrawer('none');
              onSendFile();
            }}
          >
            <View style={[styles.attachCircle, { backgroundColor: '#E0F2FE' }]}>
              <Text style={styles.attachEmoji}>📄</Text>
            </View>
            <Text style={styles.attachLabel}>Tài liệu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachItem}
            onPress={() => {
              setDrawer('none');
              onSendLocation();
            }}
          >
            <View style={[styles.attachCircle, { backgroundColor: '#DCFCE7' }]}>
              <Text style={styles.attachEmoji}>📍</Text>
            </View>
            <Text style={styles.attachLabel}>Vị trí</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachItem}
            onPress={handleStartRecord}
          >
            <View style={[styles.attachCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.attachEmoji}>🎙️</Text>
            </View>
            <Text style={styles.attachLabel}>Ghi âm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  disabledBar: {
    backgroundColor: Theme.colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  disabledText: {
    color: Theme.colors.textSecondary,
    fontSize: 13.5,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnActive: {
    backgroundColor: Theme.colors.primaryTint,
  },
  iconText: {
    fontSize: 21,
  },
  textInputWrap: {
    flex: 1,
    backgroundColor: Theme.colors.primaryTint,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 38,
    maxHeight: 110,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  textInput: {
    fontSize: 15,
    color: Theme.colors.textPrimary,
    paddingVertical: 0,
  },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primaryTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  // Recording bar
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFF5F6',
  },
  cancelRecBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFE4E6',
  },
  cancelRecText: {
    color: Theme.colors.danger,
    fontWeight: '600',
    fontSize: 13.5,
  },
  recordingCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.badgeRed,
  },
  recordingText: {
    color: Theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  sendRecBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary,
  },
  sendRecText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  // Drawers
  drawer: {
    height: 215,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
    backgroundColor: Theme.colors.surfaceAlt,
  },
  drawerTabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  drawerTab: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Theme.radius.pill,
  },
  drawerTabActive: {
    backgroundColor: Theme.colors.primarySoft,
  },
  drawerTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textSecondary,
  },
  drawerTabTextActive: {
    color: Theme.colors.primaryDark,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  stickerItem: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Theme.colors.surface,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  stickerItemEmoji: {
    fontSize: 30,
  },
  stickerItemLabel: {
    fontSize: 10.5,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  emojiItem: {
    width: '12.5%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiChar: {
    fontSize: 24,
  },
  attachDrawer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.divider,
    backgroundColor: Theme.colors.surfaceAlt,
  },
  attachItem: {
    alignItems: 'center',
    gap: 6,
  },
  attachCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachEmoji: {
    fontSize: 24,
  },
  attachLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
});
