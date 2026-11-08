import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

interface ProfileScreenProps {
  user: { email: string; name: string } | null;
  onSignOut: () => void;
}

export default function ProfileScreen({ user, onSignOut }: ProfileScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContent}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.onlineStatusDot} />
        </View>

        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>

        <View style={styles.menuWrapper}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Hồ sơ cá nhân</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Thông báo & Âm thanh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Quyền riêng tư & Bảo mật</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
            <Text style={styles.signOutBtnText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },
  profileContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FF8A5B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  onlineStatusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#52C41A',
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 3,
    borderColor: '#FFF9F5',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#262626',
  },
  userEmail: {
    fontSize: 14,
    color: '#8C8C8C',
    marginTop: 4,
    marginBottom: 32,
  },
  menuWrapper: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE5D9',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#434343',
  },
  signOutBtn: {
    height: 50,
    backgroundColor: '#FFF0E6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFD8C2',
  },
  signOutBtnText: {
    color: '#FF4D4F',
    fontSize: 15,
    fontWeight: '700',
  },
});