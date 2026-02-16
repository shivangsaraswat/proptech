import type { TicketPriority, TicketStatus } from "../types/ticket";

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// AWS S3 Configuration
export const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
  bucketName: import.meta.env.VITE_AWS_BUCKET_NAME || "",
  endpoint: import.meta.env.VITE_AWS_ENDPOINT || "",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "proptech_auth_token",
  USER: "proptech_user",
} as const;

// Ticket Status Configuration
export const TICKET_STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string; bgColor: string }
> = {
  open: {
    label: "Open",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  assigned: {
    label: "Assigned",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  in_progress: {
    label: "In Progress",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  done: {
    label: "Done",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
};

// Ticket Priority Configuration
export const TICKET_PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; color: string; bgColor: string }
> = {
  low: {
    label: "Low",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
  },
  medium: {
    label: "Medium",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  high: {
    label: "High",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  urgent: {
    label: "Urgent",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

// Role Configuration
export const ROLE_CONFIG = {
  tenant: {
    label: "Tenant",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  technician: {
    label: "Technician",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  manager: {
    label: "Manager",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
} as const;

// Mobile Breakpoints
export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

// Touch Target Sizes
export const TOUCH_TARGETS = {
  minimum: 44,
  recommended: 48,
  large: 56,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;
