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
}
//# sourceMappingURL=authService.d.ts.map