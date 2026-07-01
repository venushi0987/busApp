import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';

export enum UserRole {
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  driverLicense?: string;
  busNumber?: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    driverLicense?: string;
    busNumber?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// Custom storage handlers that work on both Web and Native (iOS/Android)
const setStorageItemAsync = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteStorageItemAsync = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and user from storage when app mounts
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await getStorageItemAsync('user_token');
        const storedUser = await getStorageItemAsync('user_profile');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Set Axios Authorization Header
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Failed to load stored auth credentials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      // Save to Storage
      await setStorageItemAsync('user_token', receivedToken);
      await setStorageItemAsync('user_profile', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      
      // Set Authorization header for subsequent API calls
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

      return { success: true, user: receivedUser };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (data: any) => {
    try {
      await apiClient.post('/api/auth/register', data);
      
      // Do not auto-login; user will be redirected to the login screen
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await deleteStorageItemAsync('user_token');
      await deleteStorageItemAsync('user_profile');
      
      setToken(null);
      setUser(null);
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
