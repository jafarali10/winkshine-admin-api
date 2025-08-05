"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
class AuthService {
    static generateToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    static async login(credentials) {
        try {
            const { email, password } = credentials;
            const user = await User_1.User.findOne({
                email: email.toLowerCase(),
                isDeleted: false
            });
            if (!user) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }
            if (user.status !== 'active') {
                return {
                    success: false,
                    error: 'Account is inactive. Please contact administrator.'
                };
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }
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
        }
        catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Internal server error'
            };
        }
    }
    static async register(userData) {
        try {
            const { name, email, password, role = 'user' } = userData;
            const existingUser = await User_1.User.findOne({
                email: email.toLowerCase(),
                isDeleted: false
            });
            if (existingUser) {
                return {
                    success: false,
                    error: 'User with this email already exists'
                };
            }
            const newUser = new User_1.User({
                name,
                email: email.toLowerCase(),
                password,
                role
            });
            await newUser.save();
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
        }
        catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Internal server error'
            };
        }
    }
    static async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const user = await User_1.User.findOne({
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
        }
        catch (error) {
            return {
                success: false,
                error: 'Invalid token'
            };
        }
    }
    static async getUserById(userId) {
        try {
            return await User_1.User.findOne({
                _id: userId,
                isDeleted: false
            });
        }
        catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map