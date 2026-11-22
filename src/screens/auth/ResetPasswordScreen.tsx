import React, { useEffect, useRef, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../config/theme';
import { forgotPassword, resetPassword } from '../../services/api/auth';

const RESEND_COOLDOWN_SEC = 60;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email: string = route.params?.email ?? '';

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);

  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [formError, setFormError] = useState('');
  const [infoMessage, setInfoMessage] = useState<string>(
    route.params?.infoMessage ?? '',
  );

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleReset = async () => {
    setFormError('');
    setInfoMessage('');

    if (!email) {
      setFormError('Thiếu thông tin email. Vui lòng quay lại bước Quên mật khẩu.');
      return;
    }

    let hasError = false;
    if (otp.trim().length !== 6) {
      setOtpError('Vui lòng nhập đủ mã xác nhận 6 số');
      hasError = true;
    } else {
      setOtpError('');
    }

    if (password.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmError('Mật khẩu xác nhận không khớp');
      hasError = true;
    } else {
      setConfirmError('');
    }

    if (hasError) {
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        email,
        otp: otp.trim(),
        password,
      });
      navigation.navigate('SignIn', {
        successMessage:
          'Mật khẩu đã được đặt lại thành công. Hãy đăng nhập lại.',
      });
    } catch (e: any) {
      setFormError(
        e?.response?.data?.message ??
          'Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã OTP và thử lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resending || cooldown > 0) {
      return;
    }
    setFormError('');
    try {
      setResending(true);
      await forgotPassword(email);
      setCooldown(RESEND_COOLDOWN_SEC);
      setInfoMessage('Đã gửi lại mã xác nhận mới. Vui lòng kiểm tra email.');
    } catch (e: any) {
      setFormError(
        e?.response?.data?.message ??
          'Gửi lại mã thất bại. Không thể kết nối tới máy chủ.',
      );
    } finally {
      setResending(false);
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
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập mã 6 số đã gửi tới{'\n'}
              <Text style={styles.emailText}>{email || '(Chưa có email)'}</Text>
            </Text>
          </View>

          <View style={styles.card}>
            {!!infoMessage && (
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>ℹ️ {infoMessage}</Text>
              </View>
            )}

            {!!formError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {formError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Mã xác nhận (6 số)</Text>
            <TextInput
              style={[
                styles.input,
                styles.otpInput,
                !!otpError && styles.inputError,
              ]}
              placeholder="000000"
              placeholderTextColor={Theme.colors.textMuted}
              value={otp}
              onChangeText={(t) => {
                setOtp(t.replace(/\D/g, '').slice(0, 6));
                if (otpError) setOtpError('');
                if (formError) setFormError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {!!otpError && <Text style={styles.fieldError}>{otpError}</Text>}

            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <View
              style={[
                styles.passwordWrap,
                !!passwordError && styles.inputError,
              ]}
            >
              <TextInput
                ref={passwordRef}
                style={styles.passwordInput}
                placeholder="Tối thiểu 6 ký tự"
                placeholderTextColor={Theme.colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passwordError) setPasswordError('');
                  if (formError) setFormError('');
                }}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.eyeBtnText}>
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </Text>
              </TouchableOpacity>
            </View>
            {!!passwordError && (
              <Text style={styles.fieldError}>{passwordError}</Text>
            )}

            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <View
              style={[
                styles.passwordWrap,
                !!confirmError && styles.inputError,
              ]}
            >
              <TextInput
                ref={confirmRef}
                style={styles.passwordInput}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor={Theme.colors.textMuted}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (confirmError) setConfirmError('');
                  if (formError) setFormError('');
                }}
                returnKeyType="done"
                onSubmitEditing={handleReset}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirm((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.eyeBtnText}>
                  {showConfirm ? 'Ẩn' : 'Hiện'}
                </Text>
              </TouchableOpacity>
            </View>
            {!!confirmError && (
              <Text style={styles.fieldError}>{confirmError}</Text>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Đặt lại mật khẩu</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Chưa nhận được mã? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resending || cooldown > 0 || !email}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text
                style={[
                  styles.linkText,
                  (resending || cooldown > 0 || !email) && { opacity: 0.5 },
                ]}
              >
                {resending
                  ? 'Đang gửi...'
                  : cooldown > 0
                    ? `Gửi lại (${cooldown}s)`
                    : 'Gửi lại'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backLinkWrap}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backLinkText}>← Đổi email khác</Text>
          </TouchableOpacity>
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
  headerContainer: { alignItems: 'center', marginBottom: 22 },
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
  },
  emailText: { color: Theme.colors.textPrimary, fontWeight: '700' },
  card: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow.sm,
  },
  infoBanner: {
    backgroundColor: Theme.colors.primaryTint,
    borderWidth: 1,
    borderColor: Theme.colors.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  infoBannerText: {
    color: Theme.colors.primaryDark,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
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
    marginTop: 12,
  },
  input: {
    height: 48,
    backgroundColor: Theme.colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 8,
  },
  passwordWrap: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceAlt,
    borderRadius: 14,
    paddingLeft: 16,
    paddingRight: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: Theme.colors.textPrimary,
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  eyeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.primaryDark,
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
    marginTop: 22,
    ...Theme.shadow.md,
  },
  primaryBtnDisabled: { opacity: 0.65 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: { fontSize: 14, color: Theme.colors.textSecondary },
  linkText: {
    fontSize: 14,
    color: Theme.colors.primaryDark,
    fontWeight: '700',
  },
  backLinkWrap: {
    alignSelf: 'center',
    marginTop: 14,
  },
  backLinkText: {
    fontSize: 13.5,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
});
