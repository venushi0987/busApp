import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomInput } from '../../components/ui/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import * as Location from 'expo-location';

export default function DriverDashboard() {
  const { token } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [busName, setBusName] = useState('');
  const [busNo, setBusNo] = useState('');

  // Bus Type Dropdown States
  const [busType, setBusType] = useState('Private');
  const [showBusTypeDropdown, setShowBusTypeDropdown] = useState(false);

  // Time States — web uses text input, native uses DateTimePicker
  const [leaveTime, setLeaveTime] = useState(new Date());
  const [arriveTime, setArriveTime] = useState(new Date());

  // Today Status States
  const [todayStatus, setTodayStatus] = useState<'available' | 'late' | 'cancelled'>('available');
  const [lateTime, setLateTime] = useState('5 min');
  const [lateReason, setLateReason] = useState('');
  const [isFull, setIsFull] = useState<boolean | null>(null);

  // Status Dropdowns States
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [isLocationSharing, setIsLocationSharing] = useState(false);

  // වෙලාව AM/PM විදිහට Format කරගන්නා ශ්‍රිතය (Function)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchDriverBusDetails = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/auth/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (response.data.success && response.data.user) {
          const userObj = response.data.user;
          setRouteFrom(userObj.routeFrom || '');
          setRouteTo(userObj.routeTo || '');
          setContactNo(userObj.contactNo || '');
          setBusName(userObj.busName || '');
          setBusNo(userObj.busNumber || '');
          if (userObj.busType) setBusType(userObj.busType);

          if (userObj.leaveTime) {
            const leaveDate = new Date(userObj.leaveTime);
            if (!isNaN(leaveDate.getTime())) setLeaveTime(leaveDate);
          }
          if (userObj.arriveTime) {
            const arriveDate = new Date(userObj.arriveTime);
            if (!isNaN(arriveDate.getTime())) setArriveTime(arriveDate);
          }

          if (userObj.todayStatus) {
            const status = userObj.todayStatus === 'delayed' ? 'late' : userObj.todayStatus;
            setTodayStatus(status as any);
          }
          if (userObj.isBusFull !== undefined) {
            setIsFull(userObj.isBusFull);
          }
          if (userObj.delayReason) {
            setLateReason(userObj.delayReason);
          }
          if (userObj.delayMinutes) {
            setLateTime(`${userObj.delayMinutes} min`);
          }

          // If they already have saved route/bus details, start in view mode (isEditing = false)
          if (userObj.routeFrom && userObj.busNumber) {
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch driver details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchDriverBusDetails();
    }
  }, [token]);

  useEffect(() => {
    let intervalId: any = null;

    const startSharing = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access location was denied.');
          setIsLocationSharing(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await sendLocationUpdate(loc.coords.latitude, loc.coords.longitude);

        intervalId = setInterval(async () => {
          try {
            const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            await sendLocationUpdate(currentLoc.coords.latitude, currentLoc.coords.longitude);
          } catch (err) {
            console.warn('Error getting location in interval:', err);
          }
        }, 15000);
      } catch (err) {
        console.error('Location sharing error:', err);
        setIsLocationSharing(false);
      }
    };

    if (isLocationSharing && token) {
      startSharing();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLocationSharing, token]);

  const sendLocationUpdate = async (latitude: number, longitude: number) => {
    try {
      await apiClient.put(
        '/api/auth/driver-location',
        { latitude, longitude },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
    } catch (err) {
      console.warn('Failed to upload location:', err);
    }
  };

  // ✅ All handler functions defined BEFORE early return
  const handleSaveBus = async () => {
    if (!routeFrom || !routeTo || !busNo) {
      Alert.alert('Required Fields', 'Please fill in Route (From / To) and Bus Number.');
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response = await apiClient.put(
        '/api/auth/driver-bus',
        {
          routeFrom,
          routeTo,
          contactNo,
          busName,
          busNo,
          busType,
          leaveTime: leaveTime.toISOString(),
          arriveTime: arriveTime.toISOString(),
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      if (response.data.success) {
        setIsEditing(false);
        Alert.alert(
          'Saved!',
          'Bus details saved successfully!',
          [{ text: 'View Profile', onPress: () => router.push('/(driver)/profile') }]
        );
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to save. Check your network.';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSchedule = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const apiStatus = todayStatus === 'late' ? 'delayed' : todayStatus;
      const delayMinutes = todayStatus === 'late' ? parseInt(lateTime, 10) || 0 : 0;
      const delayReason = todayStatus === 'late' ? lateReason : (todayStatus === 'cancelled' ? 'Cancelled by driver' : '');

      const response = await apiClient.put(
        '/api/auth/driver-status',
        {
          todayStatus: apiStatus,
          delayMinutes,
          delayReason,
          isBusFull: !!isFull,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Bus status updated successfully!');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update status.');
      }
    } catch (error: any) {
      console.error('Update status error:', error);
      const msg = error?.response?.data?.message || 'Failed to update status. Check your network.';
      Alert.alert('Error', msg);
    } finally {
      setIsSaving(false);
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

        <Text style={styles.mainTitle}>Driver Dashboard</Text>

        {/* ================= SECTION 1: BUS DETAILS ================= */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bus & Route Information</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomInput
                label="From"
                placeholder="Colombo"
                value={routeFrom}
                onChangeText={setRouteFrom}
                editable={isEditing}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomInput
                label="To"
                placeholder="Kandy"
                value={routeTo}
                onChangeText={setRouteTo}
                editable={isEditing}
              />
            </View>
          </View>

          <CustomInput
            label="Contact No"
            placeholder="07xxxxxxxx"
            keyboardType="phone-pad"
            value={contactNo}
            onChangeText={setContactNo}
            editable={isEditing}
          />

          <CustomInput
            label="Enter your Bus Name"
            placeholder="e.g. Super Line"
            value={busName}
            onChangeText={setBusName}
            editable={isEditing}
          />

          <CustomInput
            label="Enter your Bus No"
            placeholder="e.g. WP ND-1234"
            value={busNo}
            onChangeText={setBusNo}
            editable={isEditing}
          />

          {/* Bus Type Dropdown */}
          <Text style={styles.label}>Select Bus Type:</Text>
          <TouchableOpacity
            style={[styles.dropdownTrigger, !isEditing && { opacity: 0.6 }]}
            onPress={() => isEditing && setShowBusTypeDropdown(!showBusTypeDropdown)}
            disabled={!isEditing}
          >
            <Text style={styles.dropdownTriggerText}>{busType}</Text>
            <Ionicons name={showBusTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#1A5F56" />
          </TouchableOpacity>

          {showBusTypeDropdown && (
            <View style={styles.dropdownMenu}>
              {['Private', 'CTB', 'Luxury', 'Semi-Luxury'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => { setBusType(type); setShowBusTypeDropdown(false); }}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isEditing ? (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveBus}>
              <Text style={styles.saveButtonText}>Save your bus</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.saveButtonText}>Edit Bus details</Text>
            </TouchableOpacity>
          )}

        </View>

        {/* ================= SECTION 2: SCHEDULE & STATUS ================= */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Assigned Bus Schedule</Text>

          <View style={styles.row}>
            {/* Leave Time */}
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Leave Time:</Text>
              <View style={styles.timePickerButton}>
                <Ionicons name="time-outline" size={18} color="#1A5F56" style={{ marginRight: 6 }} />
                {Platform.OS === 'web' ? (
                  <input
                    type="time"
                    value={`${String(leaveTime.getHours()).padStart(2, '0')}:${String(leaveTime.getMinutes()).padStart(2, '0')}`}
                    onChange={(e: any) => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      if (!isNaN(h) && !isNaN(m)) {
                        const d = new Date(); d.setHours(h, m, 0, 0); setLeaveTime(d);
                      }
                    }}
                    style={{
                      flex: 1, border: 'none', outline: 'none', fontSize: 14,
                      color: '#1E322F', background: 'transparent',
                      fontFamily: 'inherit', cursor: 'pointer', width: '100%',
                    } as any}
                  />
                ) : (
                  <Text style={styles.timePickerText}>{formatTime(leaveTime)}</Text>
                )}
              </View>
            </View>

            {/* Arrive Time */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Arrive Time:</Text>
              <View style={styles.timePickerButton}>
                <Ionicons name="time-outline" size={18} color="#1A5F56" style={{ marginRight: 6 }} />
                {Platform.OS === 'web' ? (
                  <input
                    type="time"
                    value={`${String(arriveTime.getHours()).padStart(2, '0')}:${String(arriveTime.getMinutes()).padStart(2, '0')}`}
                    onChange={(e: any) => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      if (!isNaN(h) && !isNaN(m)) {
                        const d = new Date(); d.setHours(h, m, 0, 0); setArriveTime(d);
                      }
                    }}
                    style={{
                      flex: 1, border: 'none', outline: 'none', fontSize: 14,
                      color: '#1E322F', background: 'transparent',
                      fontFamily: 'inherit', cursor: 'pointer', width: '100%',
                    } as any}
                  />
                ) : (
                  <Text style={styles.timePickerText}>{formatTime(arriveTime)}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Today Status Dropdown */}
          <Text style={styles.label}>Today Status:</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
          >
            <Text style={styles.dropdownTriggerText}>{todayStatus.toUpperCase()}</Text>
            <Ionicons name={showStatusDropdown ? "chevron-up" : "chevron-down"} size={20} color="#1A5F56" />
          </TouchableOpacity>

          {showStatusDropdown && (
            <View style={styles.dropdownMenu}>
              {['available', 'late', 'cancelled'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.dropdownItem}
                  onPress={() => { setTodayStatus(status as any); setShowStatusDropdown(false); }}
                >
                  <Text style={styles.dropdownItemText}>{status.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Condition for Late Status */}
          {todayStatus === 'late' && (
            <View style={{ marginTop: 12 }}>
              <CustomInput
                label="If late enter your reason:"
                placeholder="Traffic / Engine breakdown"
                value={lateReason}
                onChangeText={setLateReason}
              />

              {/* Late Time Dropdown */}
              <Text style={styles.label}>Late time:</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setShowTimeDropdown(!showTimeDropdown)}
              >
                <Text style={styles.dropdownTriggerText}>{lateTime}</Text>
                <Ionicons name={showTimeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#1A5F56" />
              </TouchableOpacity>

              {showTimeDropdown && (
                <View style={styles.dropdownMenu}>
                  {['5 min', '10 min', '15 min', '30 min+'].map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={styles.dropdownItem}
                      onPress={() => { setLateTime(time); setShowTimeDropdown(false); }}
                    >
                      <Text style={styles.dropdownItemText}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* ================= SECTION 3: BUS CAPACITY ================= */}
        <View style={styles.card}>
          <Text style={styles.labelCentered}>Bus is full or not :</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleButton, isFull === true && styles.toggleActive]}
              onPress={() => setIsFull(true)}
            >
              <Text style={[styles.toggleText, isFull === true && styles.toggleTextActive]}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, isFull === false && styles.toggleActive]}
              onPress={() => setIsFull(false)}
            >
              <Text style={[styles.toggleText, isFull === false && styles.toggleTextActive]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= SECTION 3.5: LIVE LOCATION SHARING ================= */}
        <View style={styles.card}>
          <Text style={styles.labelCentered}>Live GPS Tracking :</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleButton, isLocationSharing === true && styles.toggleActive]}
              onPress={() => setIsLocationSharing(true)}
            >
              <Text style={[styles.toggleText, isLocationSharing === true && styles.toggleTextActive]}>ON (Sharing)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, isLocationSharing === false && styles.toggleActive]}
              onPress={() => setIsLocationSharing(false)}
            >
              <Text style={[styles.toggleText, isLocationSharing === false && styles.toggleTextActive]}>OFF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= SECTION 4: SUBMIT ================= */}
        <TouchableOpacity style={styles.submitButton} onPress={handleAddSchedule}>
          <Text style={styles.submitButtonText}>Update Today's Status</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6', // Soft Green White background
  },
  scrollContainer: {
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E322F', // Dark Teal Black
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
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
    fontWeight: '600',
    color: '#1A5F56', // Deep Teal Green
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#5C7470', // Muted Sage Green
    marginTop: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  labelCentered: {
    fontSize: 15,
    color: '#1E322F',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  saveButton: {
    borderWidth: 1,
    borderColor: '#1A5F56',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#1A5F56',
    fontWeight: '600',
    fontSize: 14,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: '#1E322F',
    fontWeight: '500',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F7F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#5C7470',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  timePickerText: {
    fontSize: 14,
    color: '#1E322F',
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1A5F56',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  toggleActive: {
    backgroundColor: '#1A5F56',
  },
  toggleText: {
    fontSize: 14,
    color: '#1A5F56',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#1A5F56',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editProfileBtn: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#1A5F56',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  editProfileText: {
    color: '#1A5F56',
    fontWeight: '700',
    fontSize: 14,
  },
});