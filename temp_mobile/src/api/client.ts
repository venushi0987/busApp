import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout limit
});

// Request Interceptor (to automatically attach authorization tokens)
apiClient.interceptors.request.use(
  async (config) => {
    // In a real application, you would retrieve the JWT from SecureStore
    // e.g., const token = await SecureStore.getItemAsync('user_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
