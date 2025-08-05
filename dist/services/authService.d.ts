import { IUser } from '../models/User';
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
export declare class AuthService {
    private static generateToken;
    static login(credentials: LoginCredentials): Promise<AuthResponse>;
    static register(userData: RegisterData): Promise<AuthResponse>;
    static verifyToken(token: string): Promise<{
        success: boolean;
        userId?: string;
        error?: string;
    }>;
    static getUserById(userId: string): Promise<IUser | null>;
}
//# sourceMappingURL=authService.d.ts.map