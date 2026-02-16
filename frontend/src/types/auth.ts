// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "tenant" | "manager" | "technician";
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: "tenant" | "manager" | "technician";
}
