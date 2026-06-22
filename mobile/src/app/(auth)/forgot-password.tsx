import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Dimensions, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomInput } from '@/components/ui/CustomInput';

import { Colors, Spacing } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Email Sent',
        'If an account matches this email, password reset instructions will be sent shortly.',
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    }, 1500);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
          
          <LinearGradient
            colors={['#134E46', '#1A5F56']} 
            style={styles.topIllustrationContainer}
          >
            <SafeAreaView edges={['top']} style={styles.vectorArtGroup}>
              <FontAwesome5 name="key" size={50} color="#FFFFFF" style={styles.keyIcon} />
              <Ionicons name="shield-checkmark" size={30} color="#A7F3D0" style={styles.shieldIcon} />
            </SafeAreaView>
          </LinearGradient>

          <View style={styles.headerContainer}>
            <ThemedText style={styles.title}>Reset Password</ThemedText>
            <ThemedText style={styles.tagline}>Enter your email to receive recovery instructions</ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.inputSpacing}>
              <CustomInput
                label="Email Address"
                placeholder="Enter your registered email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <LinearGradient
                colors={['#228B7D', '#144D45']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resetButton}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backToLoginButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <ThemedText style={styles.backToLoginText}>
                Back to Login
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.five,
  },
  topIllustrationContainer: {
    height: height * 0.25,
    borderBottomLeftRadius: 90, 
    borderBottomRightRadius: 90,
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
    gap: 10,
  },
  keyIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  shieldIcon: {
    marginTop: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E322F',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#5C7470',
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
    marginBottom: Spacing.three,
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
  resetButton: {
    borderRadius: 25,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  backToLoginButton: {
    alignSelf: 'center',
    marginTop: Spacing.four,
    paddingVertical: 8,
  },
  backToLoginText: {
    color: '#1A5F56',
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});