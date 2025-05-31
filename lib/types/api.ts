// Base response types
export interface SuccessResponse {
  success: boolean;
  timestamp: string;
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  timestamp: string;
  error: {
    code: string;
    message: string;
    details: Record<string, any>;
  };
}

// User types
export interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  phone_number: string | null;
  token_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// IM3 types - Updated to match actual API response
export interface IM3ProfileData {
  alerts: Array<{
    buttontext: string;
    description: string;
    external: string;
    fallback: number;
    group: string;
    icon: string;
    pageurl: string;
    title: string;
  }>;
  cid: string;
  consent: Array<{
    cdt: string;
    cnst: string;
    key: string;
  }>;
  currenttier: string;
  email: string;
  enrollmentstatus: string;
  evf: string;
  fname: string;
  img: string;
  imkas: boolean;
  managenumber: boolean;
  membershipid: string;
  mig: string;
  mob: string;
  p2p_status: boolean;
  pushid: string;
  showreferral: boolean;
  social: {
    apple: { title: string };
    email: { title: string };
    facebook: { id: string; title: string };
    google: { id: string; title: string };
    twiter: { title: string };
  };
  uniqueid: string;
  userclass: string;
  username: string;
  utype: string;
  whitelisted: boolean;
}

export interface IM3Profile {
  mob: string;
  name: string;
  balance: number;
  status: string;
  email: string;
  usertype: string;
  membershipid: string;
  img: string;
  alerts: Array<{
    title: string;
    description: string;
    buttontext: string;
    icon: string;
  }>;
}

// Package types
export interface Package {
  id: number;
  pvr_code: string;
  keyword: string;
  discount_price: number;
  normal_price: number;
  package_name: string;
  created_at: string;
  updated_at: string;
}

export interface PackageWithDetails extends Package {
  category?: string;
  description?: string;
  validity?: string;
  data_quota?: string;
  call_quota?: string;
  sms_quota?: string;
  is_popular?: boolean;
  tags?: string[];
}

// Transaction types
export interface Transaction {
  id: number;
  user_id: number;
  package_id: number;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  qr_code: string | null;
  created_at: string;
  updated_at: string;
  package?: Package;
}

export interface TransactionWithDetails extends Transaction {
  package: PackageWithDetails;
  error_message?: string;
  completion_time?: string;
  reference_id?: string;
}

// API Response types
export interface PackagesResponse extends SuccessResponse {
  data: Package[];
}

export interface PackageResponse extends SuccessResponse {
  data: Package;
}

export interface PurchaseResponse extends SuccessResponse {
  data: {
    transaction_id: number;
    task_id: string;
    status: 'PROCESSING';
    message: string;
  };
}

export interface TransactionsResponse extends SuccessResponse {
  data: TransactionWithDetails[];
}

export interface TransactionResponse extends SuccessResponse {
  data: TransactionWithDetails;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegistrationRequest {
  username: string;
  password: string;
  email?: string;
  phone_number?: string;
}

export interface AuthResponse extends SuccessResponse {
  data: {
    user: UserProfile;
    access_token: string;
  };
}

export interface UpdateUserRequest {
  email?: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}