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
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api/client';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const email: string = route.params?.email ?? '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleReset = async () => {
    if (otp.trim().length !== 6) {
      Alert.alert('Mã xác nhận', 'Vui lòng nhập đủ 6 số');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu', 'Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu', 'Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        email,
        otp: otp.trim(),
        password,
      });
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại, hãy đăng nhập lại.', [
        { text: 'Đăng nhập', onPress: () => navigation.popToTop() },
      ]);
    } catch (e: any) {
      Alert.alert(
        'Đặt lại mật khẩu thất bại',
        e.response?.data?.message ?? 'Không kết nối được server',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await api.post('/auth/forgot-password', { email });
      Alert.alert('Đã gửi lại', 'Vui lòng kiểm tra email để lấy mã mới.');
    } catch (e: any) {
      Alert.alert(
        'Gửi lại thất bại',
        e.response?.data?.message ?? 'Không kết nối được server',
      );
    } finally {
      setResending(false);
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
            <Text style={styles.title}>Đặt lại mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập mã 6 số đã gửi tới{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Mã xác nhận</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="000000"
              placeholderTextColor="#D9D9D9"
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={handleReset}
              disabled={loading}
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
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={[styles.linkText, resending && { opacity: 0.5 }]}>
                {resending ? 'Đang gửi...' : 'Gửi lại'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9F5' },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: '#FF7A45', marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: '#8C8C8C',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: { color: '#595959', fontWeight: '600' },
  formContainer: { width: '100%' },
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
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: '#FF8A5B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#FF8A5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 14, color: '#8C8C8C' },
  linkText: { fontSize: 14, color: '#FF7A45', fontWeight: '700' },
});
