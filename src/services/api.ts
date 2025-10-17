import axios from 'axios';
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// API Configuration
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get auth token from localStorage (if you implement authentication)
    const token = localStorage.getItem('authToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError): Promise<never> => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError): Promise<never> => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as Record<string, unknown>;

      console.error('API Error Response:', {
        status,
        url: error.config?.url,
        data,
      });

      // Handle specific status codes
      switch (status) {
        case 400:
          throw new Error((data?.message as string) || 'Bad request. Please check your input.');
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw new Error('Authentication required. Please log in.');
        case 403:
          throw new Error('You do not have permission to perform this action.');
        case 404:
          throw new Error((data?.message as string) || 'Resource not found.');
        case 422: {
          // Validation error
          const validationErrors = data?.errors || data?.detail;
          if (Array.isArray(validationErrors)) {
            const errorMessages = validationErrors
              .map((e: { msg?: string; message?: string }) => e.msg || e.message)
              .filter(Boolean)
              .join(', ');
            throw new Error(errorMessages || 'Validation error.');
          }
          throw new Error((data?.message as string) || 'Validation error.');
        }
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 500:
          throw new Error('Server error. Please try again later.');
        case 503:
          throw new Error('Service temporarily unavailable. Please try again later.');
        default:
          throw new Error((data?.message as string) || `Request failed with status ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Network Error:', {
        url: error.config?.url,
        message: error.message,
      });

      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection and try again.');
      } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        throw new Error(
          'Cannot connect to server. Please check if the backend is running and your internet connection is stable.'
        );
      } else {
        throw new Error('Network error. Please check your connection and try again.');
      }
    } else {
      // Something else happened
      console.error('API Setup Error:', error.message);
      throw new Error(error.message || 'An unexpected error occurred.');
    }
  }
);

// Export the configured axios instance
export default api;

// Export a helper function for setting auth token
export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Export a helper function for clearing auth token
export const clearAuthToken = (): void => {
  localStorage.removeItem('authToken');
  delete api.defaults.headers.common['Authorization'];
};

// Export base URL for direct file uploads
export const getBaseURL = (): string => API_BASE_URL;
