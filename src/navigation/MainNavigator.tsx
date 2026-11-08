import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';

export default function MainNavigator() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Text style={{ fontSize: 18 }}>Xin chào {user?.displayName}</Text>
      <Text>@{user?.username}</Text>
      <Button title="Đăng xuất" onPress={signOut} />
    </View>
  );
}