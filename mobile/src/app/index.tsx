import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/AuthContext';

export default function Index() {
  const { user, token, isLoading } = useAuth();

  // Show spinner while checking stored session (prevents flash to login)
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7F6' }}>
        <ActivityIndicator size="large" color="#1A5F56" />
      </View>
    );
  }

  // If logged in, redirect to the correct dashboard
  if (token && user) {
    if (user.role === UserRole.DRIVER) {
      return <Redirect href="/(driver)" />;
    }
    return <Redirect href="/(passenger)" />;
  }

  // Not logged in — always show login first
  return <Redirect href="/(auth)/login" />;
}
