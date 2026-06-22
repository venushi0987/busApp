import axios from 'axios';
import { Platform } from 'react-native';

// Use your computer's local IP when testing on a physical device.
// For the web browser on the same machine, localhost works fine.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/**
 * Request interceptor — attaches the stored JWT token to every request.
 * AuthContext sets apiClient.defaults.headers.common['Authorization'] on login,
 * but on web page refresh that is lost. This interceptor reads directly from
 * localStorage (web) or falls back to the default header (native).
 */
apiClient.interceptors.request.use(
  async (config) => {
    // If a header is already set (e.g. from AuthContext on login), keep it
    if (config.headers['Authorization']) return config;

    try {
      let token: string | null = null;

      if (Platform.OS === 'web') {
        token = localStorage.getItem('user_token');
      } else {
        // On native the AuthContext sets the default header after SecureStore read,
        // so we fall through to defaults below
        token = apiClient.defaults.headers.common['Authorization']
          ? String(apiClient.defaults.headers.common['Authorization']).replace('Bearer ', '')
          : null;
      }

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Storage unavailable — continue without token
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/** Response interceptor — log errors in development for easier debugging */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      const url = error?.config?.url;
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error.message;
      console.warn(`[API] ${status ?? 'NET'} ${url} — ${msg}`);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
