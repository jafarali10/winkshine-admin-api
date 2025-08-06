import { LoginCredentials, RegisterData, AuthResponse, IUser } from '../types';
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
    static updateProfile(userId: string, userData: {
        name: string;
        email: string;
    }): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map