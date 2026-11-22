import React, { useRef, useState } from 'react';
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
import { useAuthStore } from '../../store/useAuthStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._]{3,30}$/;

interface FieldErrors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);

  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');

  const clearFieldError = (key: keyof FieldErrors) => {
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    if (formError) {
      setFormError('');
    }
  };

  const handleSignUp = async () => {
    setFormError('');
    const nextErrors: FieldErrors = {};

    const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
    const trimmedUser = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (nameParts.length < 2) {
      nextErrors.fullName = 'Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ)';
    }

    if (!trimmedUser) {
      nextErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (!USERNAME_REGEX.test(trimmedUser)) {
      nextErrors.username =
        'Tên đăng nhập dài 3–30 ký tự, chỉ gồm chữ, số, dấu chấm hoặc gạch dưới';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Vui lòng nhập email';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = 'Định dạng email không hợp lệ';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu xác nhận';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const lastName = nameParts[nameParts.length - 1];
    const firstName = nameParts.slice(0, -1).join(' ');

    try {
      setLoading(true);
      await signUp({
        username: trimmedUser,
        password,
        email: trimmedEmail,
        firstName,
        lastName,
      });
    } catch (e: any) {
      setLoading(false);
      setFormError(
        e?.response?.data?.message ??
          'Đăng ký thất bại. Không thể kết nối tới máy chủ.',
      );
      return;
    }

    // Đăng ký xong thì đăng nhập luôn
    try {
      await signIn(trimmedUser, password);
    } catch {
      setLoading(false);
      navigation.navigate('SignIn', {
        successMessage: 'Đăng ký thành công! Hãy đăng nhập bằng tài khoản vừa tạo.',
      });
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
            <Text style={styles.title}>Tạo tài khoản MyChat</Text>
            <Text style={styles.subtitle}>
              Bắt đầu trò chuyện cùng bạn bè ngay hôm nay
            </Text>
          </View>

          <View style={styles.card}>
            {!!formError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {formError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={[styles.input, !!errors.fullName && styles.inputError]}
              placeholder="Ví dụ: Nguyễn Văn A"
              placeholderTextColor={Theme.colors.textMuted}
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                clearFieldError('fullName');
              }}
              returnKeyType="next"
              onSubmitEditing={() => usernameRef.current?.focus()}
            />
            {!!errors.fullName && (
              <Text style={styles.fieldError}>{errors.fullName}</Text>
            )}

            <Text style={styles.inputLabel}>Tên đăng nhập</Text>
            <TextInput
              ref={usernameRef}
              style={[styles.input, !!errors.username && styles.inputError]}
              placeholder="vd: nguyenvana"
              placeholderTextColor={Theme.colors.textMuted}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                clearFieldError('username');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            {!!errors.username && (
              <Text style={styles.fieldError}>{errors.username}</Text>
            )}

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, !!errors.email && styles.inputError]}
              placeholder="example@gmail.com"
              placeholderTextColor={Theme.colors.textMuted}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearFieldError('email');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {!!errors.email && (
              <Text style={styles.fieldError}>{errors.email}</Text>
            )}

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View
              style={[
                styles.passwordWrap,
                !!errors.password && styles.inputError,
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
                  clearFieldError('password');
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
            {!!errors.password && (
              <Text style={styles.fieldError}>{errors.password}</Text>
            )}

            <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
            <View
              style={[
                styles.passwordWrap,
                !!errors.confirmPassword && styles.inputError,
              ]}
            >
              <TextInput
                ref={confirmRef}
                style={styles.passwordInput}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={Theme.colors.textMuted}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  clearFieldError('confirmPassword');
                }}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
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
            {!!errors.confirmPassword && (
              <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Đăng ký</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignIn')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.linkText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: Theme.colors.primaryDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
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
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: Theme.colors.primaryDark,
    fontWeight: '700',
  },
});
