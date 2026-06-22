import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';

export default function DriverProfile() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    userName: '',
    email: '',
    role: '',
    routeFrom: '',
    routeTo: '',
    busType: '',
    leaveTime: '',
    arriveTime: '',
    busName: '',
    busNo: '',
    contactNo: ''
  });
  const [loading, setLoading] = useState(true);

  const handleAddPhoto = () => {
    Alert.alert("Upload Photo", "Image picker will open here to change profile picture.");
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      await logout();
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      // Alert.alert confirmation buttons don't work on web
      if (window.confirm('Are you sure you want to log out?')) {
        await doLogout();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to log out of the Driver Duty Portal?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log Out', style: 'destructive', onPress: doLogout },
        ]
      );
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // කෙලින්ම /api/auth/me එක කෝල් කලාම මුළු යූසර්ගේම විස්තර ටික එනවා
      const response = await apiClient.get('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      
      if (response.data.success) {
        const dbUser = response.data.user;
        
        const formatTimeStr = (timeStr?: string) => {
          if (!timeStr) return '';
          try {
            const d = new Date(timeStr);
            if (isNaN(d.getTime())) return timeStr;
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          } catch {
            return timeStr;
          }
        };

        setProfileData({
          userName: dbUser.name,
          email: dbUser.email,
          role: dbUser.role || 'Driver',
          routeFrom: dbUser.routeFrom || '',
          routeTo: dbUser.routeTo || '',
          busType: dbUser.busType || '',
          leaveTime: formatTimeStr(dbUser.leaveTime),
          arriveTime: formatTimeStr(dbUser.arriveTime),
          busName: dbUser.busName || '',
          busNo: dbUser.busNumber || '',
          contactNo: dbUser.contactNo || ''
        });
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfileData();
    }
  }, [token]);

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
        
        {/* ================= HEADER SECTION (AVATAR) ================= */}
        <View style={styles.avatarSection}>
          <View style={styles.imageContainer}>
            {/* දැනට Default Avatar එකක් පෙන්වයි */}
            <Ionicons name="person" size={70} color="#5C7470" />
          </View>
          
          <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhoto}>
            <Ionicons name="camera-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.addPhotoText}>+ Add Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* ================= SECTION 1: PERSONAL DETAILS ================= */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>User Name : </Text>
            <Text style={styles.value}>{profileData?.userName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email :</Text>
            <Text style={styles.value}>{profileData.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Role :</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{profileData.role}</Text>
            </View>
          </View>
        </View>

        {/* ================= SECTION 2: BUS DETAILS ================= */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bus Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Route :</Text>
            <Text style={styles.value}>
              From <Text style={styles.highlightText}>{profileData.routeFrom}</Text> to <Text style={styles.highlightText}>{profileData.routeTo}</Text>
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Bus Type :</Text>
            <Text style={styles.value}>{profileData.busType}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Time :</Text>
            <Text style={styles.value}>
              Leave <Text style={styles.timeText}>{profileData.leaveTime}</Text> - Arrival <Text style={styles.timeText}>{profileData.arriveTime}</Text>
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Bus Name :</Text>
            <Text style={styles.value}>{profileData.busName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Bus No :</Text>
            <Text style={styles.value}>{profileData.busNo}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Contact No :</Text>
            <Text style={styles.value}>{profileData.contactNo}</Text>
          </View>
        </View>


        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>Sign Out from Duty</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6', // Soft Green White
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A5F56', // Deep Teal Green
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    backgroundColor: '#1A5F56',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: -15, // Image එක උඩින් බාගෙට සිටින සේ
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  addPhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A5F56',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F7F6',
    paddingBottom: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'column', // Wireframe එකේ විදිහටම එක යට එක ලේබල් එකයි වැලියු එකයි එන්න
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#8A9A97', // Muted Sage Green
    fontWeight: '500',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: '#1E322F', // Dark Teal Black
    fontWeight: '600',
  },
  highlightText: {
    color: '#1A5F56',
    fontWeight: '700',
  },
  timeText: {
    color: '#E29578', // වෙලාවල් කැපී පෙනෙන්න පොඩි වෙනස් පාටක් (Optional)
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#E6F4F1',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
  },
  badgeText: {
    color: '#1A5F56',
    fontSize: 13,
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#1A5F56',
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff3b30',
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});