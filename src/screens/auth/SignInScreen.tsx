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
import { useAuthStore } from '../../store/useAuthStore';

export default function SignInScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const signIn = useAuthStore((s) => s.signIn);
  const passwordRef = useRef<TextInput>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string>(
    route.params?.successMessage ?? '',
  );

  useEffect(() => {
    if (route.params?.successMessage) {
      setSuccessMessage(route.params.successMessage);
    }
  }, [route.params?.successMessage]);

  const handleSignIn = async () => {
    setFormError('');
    setSuccessMessage('');

    const trimmedUser = username.trim();
    let hasError = false;

    if (!trimmedUser) {
      setUsernameError('Vui lòng nhập tên đăng nhập');
      hasError = true;
    } else {
      setUsernameError('');
    }

    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) {
      return;
    }

    try {
      setLoading(true);
      await signIn(trimmedUser, password);
      // Khi user có giá trị, AppNavigator sẽ tự chuyển sang MainNavigator
    } catch (e: any) {
      const serverMsg = e?.response?.data?.message;
      if (serverMsg) {
        setFormError(serverMsg);
      } else if (e?.response?.status === 401 || e?.response?.status === 400) {
        setFormError('Tên đăng nhập hoặc mật khẩu không chính xác');
      } else {
        setFormError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
      }
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
              <Text style={styles.logoIcon}>💬</Text>
            </View>
            <Text style={styles.appName}>MyChat</Text>
            <Text style={styles.subtitle}>
              Kết nối bạn bè mọi lúc, mọi nơi
            </Text>
          </View>

          <View style={styles.card}>
            {!!successMessage && (
              <View style={styles.successBanner}>
                <Text style={styles.successBannerText}>✓ {successMessage}</Text>
              </View>
            )}

            {!!formError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {formError}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Tên đăng nhập</Text>
            <TextInput
              style={[styles.input, !!usernameError && styles.inputError]}
              placeholder="Nhập tên đăng nhập"
              placeholderTextColor={Theme.colors.textMuted}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (usernameError) setUsernameError('');
                if (formError) setFormError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            {!!usernameError && (
              <Text style={styles.fieldError}>{usernameError}</Text>
            )}

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View
              style={[
                styles.passwordWrap,
                !!passwordError && styles.inputError,
              ]}
            >
              <TextInput
                ref={passwordRef}
                style={styles.passwordInput}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={Theme.colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passwordError) setPasswordError('');
                  if (formError) setFormError('');
                }}
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={
                  showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                }
              >
                <Text style={styles.eyeBtnText}>
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </Text>
              </TouchableOpacity>
            </View>
            {!!passwordError && (
              <Text style={styles.fieldError}>{passwordError}</Text>
            )}

            <TouchableOpacity
              style={styles.forgotPassBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.linkText}>Đăng ký ngay</Text>
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
    paddingVertical: 28,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: Theme.colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: Theme.colors.primaryLight,
    ...Theme.shadow.md,
  },
  logoIcon: {
    fontSize: 38,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.colors.primaryDark,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginTop: 4,
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
  successBanner: {
    backgroundColor: Theme.colors.successSoft,
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  successBannerText: {
    color: '#15803D',
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
    height: 50,
    backgroundColor: Theme.colors.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  passwordWrap: {
    height: 50,
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
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 18,
  },
  forgotPassText: {
    fontSize: 13.5,
    color: Theme.colors.primaryDark,
    fontWeight: '600',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: Theme.colors.primaryDark,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
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
    marginTop: 24,
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
