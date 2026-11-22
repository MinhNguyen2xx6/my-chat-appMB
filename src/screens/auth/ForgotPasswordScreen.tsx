import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../config/theme';
import { forgotPassword } from '../../services/api/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');

  const handleSend = async () => {
    setFormError('');
    const value = email.trim().toLowerCase();

    if (!value) {
      setEmailError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Địa chỉ email không hợp lệ');
      return;
    }

    setEmailError('');

    try {
      setLoading(true);
      await forgotPassword(value);
      navigation.navigate('ResetPassword', {
        email: value,
        infoMessage:
          'Nếu email tồn tại, mã xác nhận 6 số đã được gửi. Mã có hiệu lực trong 10 phút.',
      });
    } catch (e: any) {
      setFormError(
        e?.response?.data?.message ??
          'Không thể gửi mã xác nhận. Vui lòng kiểm tra kết nối mạng.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Theme.colors.background}
      />
      <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🔑</Text>
            </View>
            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>
              Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận để bạn đặt lại
              mật khẩu
            </Text>
          </View>

          <View style={styles.card}>
            {!!formError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {formError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, !!emailError && styles.inputError]}
              placeholder="example@gmail.com"
              placeholderTextColor={Theme.colors.textMuted}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError('');
                if (formError) setFormError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSend}
            />
            {!!emailError && (
              <Text style={styles.fieldError}>{emailError}</Text>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleSend}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Gửi mã xác nhận</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.linkText}>← Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: Theme.colors.primaryLight,
    ...Theme.shadow.md,
  },
  logoIcon: { fontSize: 36 },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: Theme.colors.primaryDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  card: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.sm,
  },
  errorBanner: {
    backgroundColor: Theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  errorBannerText: {
    color: Theme.colors.danger,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 50,
    backgroundColor: Theme.colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  inputError: {
    borderColor: Theme.colors.danger,
    backgroundColor: '#FFF8F8',
  },
  fieldError: {
    color: Theme.colors.danger,
    fontSize: 12.5,
    marginTop: 5,
    marginLeft: 2,
    fontWeight: '500',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: Theme.colors.primaryDark,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    ...Theme.shadow.md,
  },
  primaryBtnDisabled: { opacity: 0.65 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
    color: Theme.colors.primaryDark,
    fontWeight: '700',
  },
});
