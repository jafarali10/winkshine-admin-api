"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const authService_1 = require("../services/authService");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access token required'
            });
            return;
        }
        const verifyResult = await authService_1.AuthService.verifyToken(token);
        if (!verifyResult.success || !verifyResult.userId) {
            res.status(403).json({
                success: false,
                error: 'Invalid or expired token'
            });
            return;
        }
        req.userId = verifyResult.userId;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(403).json({
            success: false,
            error: 'Invalid token'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.userId) {
            res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
            return;
        }
        const user = await authService_1.AuthService.getUserById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map