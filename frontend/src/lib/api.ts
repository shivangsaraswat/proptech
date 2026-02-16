import axios from "axios";
import { API_BASE_URL } from "./constants";
import { getAuthToken, removeAuthToken } from "./auth";

import type { AxiosError, AxiosInstance } from "axios";

/**
 * Create axios instance with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor - Add auth token to requests
 */
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      removeAuthToken();
      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Error type guard
 */
export function isApiError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    const data = error.response?.data as { message?: string };
    return data?.message ?? "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}

// Export configured axios instance
export default api;
export { api as apiClient };
