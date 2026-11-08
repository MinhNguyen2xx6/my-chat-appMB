import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/useAuthStore';

export default function SignInScreen() {
  const navigation = useNavigation<any>();
  const signIn = useAuthStore((s) => s.signIn);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }
    try {
      setLoading(true);
      await signIn(username.trim(), password);
      // Không cần navigate: user có giá trị thì AppNavigator tự chuyển sang Main
    } catch (e: any) {
      Alert.alert(
        'Đăng nhập thất bại',
        e.response?.data?.message ?? 'Không kết nối được server',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>💬</Text>
            </View>
            <Text style={styles.appName}>Chat Messenger</Text>
            <Text style={styles.subtitle}>Kết nối bạn bè mọi lúc, mọi nơi</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên đăng nhập"
              placeholderTextColor="#B0B0B0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.forgotPassBtn}>
              <Text style={styles.forgotPassText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={handleSignIn}
              disabled={loading}
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
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
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
    backgroundColor: '#FFF9F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF8A5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  logoIcon: {
    fontSize: 38,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FF7A45',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#8C8C8C',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#595959',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#262626',
    borderWidth: 1,
    borderColor: '#FFD8C2',
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 20,
  },
  forgotPassText: {
    fontSize: 13,
    color: '#FF7A45',
    fontWeight: '500',
  },
  primaryBtn: {
    height: 52,
    backgroundColor: '#FF8A5B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FF8A5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 14,
    color: '#8C8C8C',
  },
  linkText: {
    fontSize: 14,
    color: '#FF7A45',
    fontWeight: '700',
  },
});