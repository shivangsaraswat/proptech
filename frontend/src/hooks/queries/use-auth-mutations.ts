import { useMutation } from '@tanstack/react-query';
import type { ApiResponse, AuthResponse, LoginInput, RegisterInput } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';

// Login mutation
export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        credentials
      );
      return data.data!;
    },
    onSuccess: (authResponse) => {
      login(authResponse.user, authResponse.token);
    },
  });
}

// Register mutation
export function useRegister() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (userData: RegisterInput) => {
      const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        userData
      );
      return data.data!;
    },
    onSuccess: (authResponse) => {
      login(authResponse.user, authResponse.token);
    },
  });
}
