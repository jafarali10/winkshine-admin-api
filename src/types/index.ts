import { Request } from 'express';
import { Document } from 'mongoose';

// User types
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isDeleted: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      status: string;
    };
    token: string;
  };
  message?: string;
  error?: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Statistics types
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
}

export interface UserStatsResponse {
  users: UserStats;
}

// Logo types
export interface ILogo extends Document {
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogoResponse {
  success: boolean;
  data?: {
    logo: ILogo;
  };
  message?: string;
  error?: string;
} 