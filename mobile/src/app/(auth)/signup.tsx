import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform, Alert, Dimensions, ActivityIndicator, TextInput, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomInput } from '@/components/ui/CustomInput';

import { RoleSelector } from '@/components/ui/RoleSelector';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Colors, Spacing } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient'; // දිලිසෙන Gradient පසුබිම සඳහා
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const scheme = useColorScheme();
  const currentScheme = scheme === 'unspecified' ? 'light' : scheme;
  const colors = Colors[currentScheme];

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PASSENGER);

  // Driver fields
  const [busNumber, setBusNumber] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [routeNumber, setRouteNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('Required Fields', 'Please fill in name, email, phone number, and password.');
      return;
    }

    if (role === UserRole.DRIVER && (!busNumber || !driverLicense || !routeNumber)) {
      Alert.alert('Driver Details', 'Please complete your bus number, license code, and route details.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, email, password, role, phone };
      if (role === UserRole.DRIVER) {
        payload.busNumber = busNumber;
        payload.driverLicense = driverLicense;
        payload.routeNumber = routeNumber;
      }

      const result = await register(payload);
      if (result.success) {
        Alert.alert(
          'Registration Successful',
          'Please log in with your new account credentials.',
          [
            { text: 'OK', onPress: () => router.replace('/(auth)/login') }
          ]
        );
      } else {
        Alert.alert('Signup Failed', result.error || 'Check details and try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
          
          {/* Top Elegant Curve Header with Premium Teal Gradient */}
          <LinearGradient
            colors={['#134E46', '#1A5F56']} 
            style={styles.topIllustrationContainer}
          >
            <SafeAreaView edges={['top']} style={styles.vectorArtGroup}>
              <FontAwesome5 name="user-plus" size={50} color="#FFFFFF" style={styles.userIcon} />
              <FontAwesome5 name="bus" size={30} color="#A7F3D0" style={styles.miniBusIcon} />
            </SafeAreaView>
          </LinearGradient>

          {/* Header Typography */}
          <View style={styles.headerContainer}>
            <ThemedText style={styles.appName}>Create Account</ThemedText>
            <ThemedText style={styles.tagline}>Join ගමනLK to get real-time schedule statuses</ThemedText>
          </View>

          {/* Form Card Area */}
          <ThemedView type="backgroundElement" style={styles.card}>
            
            {/* Input fields with consistent premium spacing */}
            <View style={styles.inputSpacing}>
              <CustomInput
                label="Full Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputSpacing}>
              <CustomInput
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputSpacing}>
              <CustomInput
                label="Phone Number"
                placeholder="e.g. +94771234567"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Password field with lock icon and eye toggle */}
            <View style={styles.inputSpacing}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#1A5F56" style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  placeholderTextColor="#8A9A97"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
                  <Ionicons
                    name={secureText ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#8A9A97"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Selection Label & Selector */}
            <View style={styles.roleSelectorWrapper}>
              <ThemedText type="smallBold" style={styles.roleLabel}>Select Registration Type</ThemedText>
              <RoleSelector selectedRole={role} onChange={setRole} />
            </View>

            {/* Conditional Driver Section wrapped with premium styling */}
            {role === UserRole.DRIVER && (
              <View style={styles.driverSection}>
                <ThemedText type="smallBold" style={styles.driverSectionTitle}>Driver Details</ThemedText>
                
                <View style={styles.inputSpacing}>
                  <CustomInput
                    label="Bus Plate Registration Number"
                    placeholder="e.g. WP-9876"
                    value={busNumber}
                    onChangeText={setBusNumber}
                  />
                </View>

                <View style={styles.inputSpacing}>
                  <CustomInput
                    label="Driving License Number"
                    placeholder="e.g. DL-12345678"
                    value={driverLicense}
                    onChangeText={setDriverLicense}
                  />
                </View>

                <View style={styles.inputSpacing}>
                  <CustomInput
                    label="Assigned Route Number"
                    placeholder="e.g. Route 02 (Colombo - Galle)"
                    value={routeNumber}
                    onChangeText={setRouteNumber}
                  />
                </View>
              </View>
            )}

            {/* Styled Button Wrapper for Glossy Shadow Effect */}
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient
                colors={['#228B7D', '#144D45']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.signUpButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText style={styles.signUpButtonText}>Sign Up</ThemedText>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Navigation back to Login */}
            <View style={styles.loginPrompt}>
              <ThemedText type="small" style={{ color: '#657B77' }}>Already have an Account? </ThemedText>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <ThemedText style={[styles.linkText, { color: '#1A5F56', textDecorationLine: 'underline' }]} type="small">
                  Log In
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6', // Premium Soft Gray-Green Background
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.five,
  },
  topIllustrationContainer: {
    height: height * 0.22, // Slightly shorter curve to accommodate form length
    borderBottomLeftRadius: 80, 
    borderBottomRightRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#1A5F56',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  vectorArtGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  userIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  miniBusIcon: {
    marginTop: 14,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E322F', // Dark Slate Green
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#5C7470', // Muted Sage
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    marginHorizontal: Spacing.four,
    borderRadius: 24,
    padding: Spacing.four,
    backgroundColor: '#FFFFFF',
    shadowColor: '#1A5F56',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  inputSpacing: {
    marginBottom: Spacing.two,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C7470',
    marginBottom: 6,
    marginLeft: 4,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EBE9',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#1A5F56',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  passwordInput: {
    flex: 1,
    color: '#1E322F',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },

  roleSelectorWrapper: {
    marginVertical: Spacing.two,
  },
  roleLabel: {
    fontSize: 13,
    color: '#5C7470',
    marginBottom: Spacing.one,
    paddingLeft: 4,
  },
  driverSection: {
    borderTopWidth: 1.5,
    borderTopColor: '#E6EFEF', 
    paddingTop: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  driverSectionTitle: {
    fontSize: 15,
    color: '#1A5F56',
    fontWeight: 'bold',
    marginBottom: Spacing.two,
  },
  buttonWrapper: {
    borderRadius: 25,
    marginTop: Spacing.two,
    shadowColor: '#1A5F56',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  signUpButton: {
    borderRadius: 25,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  linkText: {
    fontWeight: 'bold',
  },
});