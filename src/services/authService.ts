import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { LoginCredentials, RegisterData, AuthResponse, IUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  // Generate JWT token
  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Find user by email and check if not deleted
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        role: 'admin',
        isDeleted: false 
      });

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (user.status !== 'active') {
        return {
          success: false,
          error: 'Account is inactive. Please contact administrator.'
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate token
      const token = this.generateToken(String(user._id));

      return {
        success: true,
        data: {
          user: {
            _id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          },
          token
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  // Register new user
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const { name, email, password, role = 'user' } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        isDeleted: false 
      });

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Create new user
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        password,
        role
      });

      await newUser.save();

      // Generate token
      const token = this.generateToken(String(newUser._id));

      return {
        success: true,
        data: {
          user: {
            _id: String(newUser._id),
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status
          },
          token
        },
        message: 'User registered successfully'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Check if user still exists and is active
      const user = await User.findOne({ 
        _id: decoded.userId,
        isDeleted: false,
        status: 'active'
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found or inactive'
        };
      }

      return {
        success: true,
        userId: decoded.userId
      };

    } catch (error) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ 
        _id: userId,
        isDeleted: false 
      });
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(userId: string, userData: { name: string; email: string }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { name, email } = userData;

      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId },
        isDeleted: false 
      });

      if (existingUser) {
        return {
          success: false,
          error: 'Email is already taken by another user'
        };
      }

      // Update user
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          name: name.trim(),
          email: email.toLowerCase().trim()
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        message: 'Profile updated successfully'
      };

    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }
} 