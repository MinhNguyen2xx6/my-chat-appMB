import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatDetailScreen from '../screens/chat/ChatDetailScreen';
import ConversationInfoScreen from '../screens/chat/ConversationInfoScreen';
import AddFriendScreen from '../screens/friends/AddFriendScreen';
import CreateGroupScreen from '../screens/friends/CreateGroupScreen';
import FriendRequestsScreen from '../screens/friends/FriendRequestsScreen';
import MainShellScreen from '../screens/main/MainShellScreen';
import { MainStackParamList } from '../types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainShell"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainShell" component={MainShellScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen
        name="ConversationInfo"
        component={ConversationInfoScreen}
      />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="AddFriend" component={AddFriendScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
    </Stack.Navigator>
  );
}
