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

export default function SignUpScreen() {
  const navigation = useNavigation<any>();
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const name = fullName.trim().split(/\s+/);
    if (name.length < 2) {
      Alert.alert('Họ và tên', 'Vui lòng nhập đầy đủ họ và tên (ít nhất 2 từ)');
      return;
    }
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các ô');
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

    // "Nguyễn Văn A" -> firstName "Nguyễn Văn", lastName "A"
    // backend ghép lại displayName = `${firstName} ${lastName}` nên vẫn đúng tên gốc
    const lastName = name[name.length - 1];
    const firstName = name.slice(0, -1).join(' ');

    try {
      setLoading(true);
      await signUp({
        username: username.trim(),
        password,
        email: email.trim(),
        firstName,
        lastName,
      });
    } catch (e: any) {
      setLoading(false);
      Alert.alert(
        'Đăng ký thất bại',
        e.response?.data?.message ?? 'Không kết nối được server',
      );
      return;
    }

    // Đăng ký xong thì đăng nhập luôn
    try {
      await signIn(username.trim(), password);
    } catch {
      setLoading(false);
      Alert.alert('Đăng ký thành công', 'Hãy đăng nhập bằng tài khoản vừa tạo');
      navigation.navigate('SignIn');
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
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Bắt đầu trò chuyện cùng cộng đồng</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Họ và tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#B0B0B0"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.inputLabel}>Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              placeholder="vd: nguyenvana"
              placeholderTextColor="#B0B0B0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Tối thiểu 6 ký tự"
              placeholderTextColor="#B0B0B0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
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
              onPress={handleSignUp}
              disabled={loading}
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
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FF7A45',
    marginBottom: 8,
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
  primaryBtn: {
    height: 52,
    backgroundColor: '#FF8A5B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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