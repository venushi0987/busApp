import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth, UserRole } from '@/context/AuthContext';


const { width, height } = Dimensions.get('window');

export default function WelcomeLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }
    
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect based strictly on their backend role
        if (result.user?.role?.toUpperCase() === 'DRIVER') {
          router.replace('/(driver)/' as any);
        } else {
          router.replace('/(passenger)/' as any);
        }
      } else {
        setErrorMessage(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected connection error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Top Curve Shape with Gradient Background */}
        <LinearGradient
          colors={['#134E46', '#1A5F56']} // Deep Teal Gradation
          style={styles.topIllustrationContainer}
        >
          <View style={styles.vectorArtGroup}>
            <FontAwesome5 name="bus" size={75} color="#FFFFFF" style={styles.busIcon} />
            <Ionicons name="location" size={34} color="#A7F3D0" style={styles.mapPin} />
          </View>
          <View style={styles.roadLine} />
        </LinearGradient>

        {/* Brand Name & Tagline */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>ගමනLK</Text>
          <Text style={styles.taglineText}>Welcome your journey</Text>
        </View>

        {/* Input Fields Group */}
        <View style={styles.formContainer}>
          
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#1A5F56" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8A9A97"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#1A5F56" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8A9A97"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon}>
              <Ionicons 
                name={secureText ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color="#8A9A97" 
              />
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <Text style={{ color: '#E53E3E', fontSize: 14, marginBottom: 16, textAlign: 'center', fontWeight: '500' }}>
              {errorMessage}
            </Text>
          ) : null}

          {/* Role selection is automatically handled by the backend */}

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Log In Button with Glossy Gradient & Heavy Shadow */}
          <TouchableOpacity 
            style={styles.buttonShadowWrapper} 
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={['#228B7D', '#144D45']} // දිලිසෙන Vibrant Teal -> Deep Teal Gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loginButton}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer / Register Link */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerNormalText}>You don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.registerLinkText}>register here</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6', // Soft Premium Gray-Green Background
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  topIllustrationContainer: {
    height: height * 0.35,
    borderBottomLeftRadius: 100, 
    borderBottomRightRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#1A5F56',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  vectorArtGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  busIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  mapPin: {
    marginLeft: -8,
    marginBottom: 38,
  },
  roadLine: {
    width: width * 0.45,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    opacity: 0.4,
    marginTop: 10,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  brandText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#1E322F', // Dark Slate Green Typography
    letterSpacing: 0.5,
  },
  taglineText: {
    fontSize: 16,
    color: '#5C7470',
    marginTop: 4,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 32,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2EBE9', 
    borderRadius: 25, 
    paddingHorizontal: 20,
    marginBottom: 16,
    height: 54,
    shadowColor: '#1A5F56',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    marginLeft: 'auto',
    padding: 4,
  },
  input: {
    flex: 1,
    color: '#1E322F',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    color: '#1A5F56',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonShadowWrapper: {
    borderRadius: 25,
    marginTop: 5,
    shadowColor: '#1A5F56',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButton: {
    borderRadius: 25,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 20,
  },
  footerNormalText: {
    color: '#5C7470',
    fontSize: 15,
  },
  registerLinkText: {
    color: '#1A5F56',
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
