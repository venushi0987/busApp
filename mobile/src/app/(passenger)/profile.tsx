import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';

interface PassengerProfileData {
  name: string;
  email: string;
  role: string;
  lastRouteFrom: string;
  lastRouteTo: string;
  contactNo: string;
}

export default function PassengerProfile() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [profileData, setProfileData] = useState<PassengerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchPassengerProfile();
    }
  }, [token]);

  const fetchPassengerProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.data.success) {
        const dbUser = response.data.user;
        
        let lastFrom = 'Not Specified';
        let lastTo = 'Not Specified';
        try {
          const historyStr = await AsyncStorage.getItem('passengerSearchHistory');
          if (historyStr) {
            const history = JSON.parse(historyStr);
            if (history && history.length > 0) {
              lastFrom = history[0].from;
              lastTo = history[0].to;
            }
          }
        } catch (e) {
          console.error('Failed to load search history in profile', e);
        }

        setProfileData({
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          lastRouteFrom: lastFrom,
          lastRouteTo: lastTo,
          contactNo: dbUser.contactNo || 'Not Specified',
        });
      }
    } catch (error) {
      console.error('Passenger profile fetch error:', error);
      Alert.alert('Error', 'Could not load profile data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const doLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        await doLogout();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: doLogout },
        ]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1A5F56" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* ================= AVATAR SECTION ================= */}
        <View style={styles.avatarSection}>
          <View style={styles.imageContainer}>
            <Ionicons name="person" size={65} color="#5C7470" />
          </View>
          <Text style={styles.userName}>{profileData?.name || '—'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{profileData?.role || 'Passenger'}</Text>
          </View>
        </View>

        {/* ================= PROFILE INFO DETAILS (CARD) ================= */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#1A5F56" style={styles.rowIcon} />
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{profileData?.name || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#1A5F56" style={styles.rowIcon} />
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profileData?.email || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#1A5F56" style={styles.rowIcon} />
            <Text style={styles.label}>Contact</Text>
            <Text style={styles.value}>{profileData?.contactNo || '—'}</Text>
          </View>
        </View>

        {/* ================= LAST ROUTE CARD ================= */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Last Searched Route</Text>
          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <Ionicons name="radio-button-on-outline" size={16} color="#1A5F56" />
              <Text style={styles.routeCity}>{profileData?.lastRouteFrom || '—'}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#94A3B8" style={{ marginHorizontal: 8 }} />
            <View style={styles.routePoint}>
              <Ionicons name="location-outline" size={16} color="#E53E3E" />
              <Text style={styles.routeCity}>{profileData?.lastRouteTo || '—'}</Text>
            </View>
          </View>
        </View>

        {/* 🚪 SIGN OUT BUTTON */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  scrollContainer: { padding: 20, alignItems: 'center', paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  imageContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#1A5F56',
  },
  userName: { fontSize: 20, fontWeight: '700', color: '#1E322F', marginTop: 12 },
  roleBadge: {
    backgroundColor: '#E6F4F1', paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: 20, marginTop: 6,
  },
  roleBadgeText: { color: '#1A5F56', fontWeight: '700', fontSize: 12 },

  card: {
    backgroundColor: '#FFFFFF', width: '100%', borderRadius: 16,
    padding: 18, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94A3B8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowIcon: { marginRight: 10 },
  label: { fontSize: 14, color: '#64748B', flex: 1 },
  value: { fontSize: 14, color: '#1E293B', fontWeight: '600' },

  routeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  routePoint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeCity: { fontSize: 15, fontWeight: '700', color: '#1E322F' },

  signOutBtn: {
    flexDirection: 'row', backgroundColor: '#E53E3E', width: '100%',
    height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  signOutText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});