"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
            return;
        }
        const result = await authService_1.AuthService.login({ email, password });
        if (result.success && result.data) {
            res.json(result);
        }
        else {
            res.status(401).json(result);
        }
    }
    catch (error) {
        console.error('Login route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                error: 'Name, email, and password are required'
            });
            return;
        }
        const result = await authService_1.AuthService.register({ name, email, password, role });
        if (result.success && result.data) {
            res.status(201).json(result);
        }
        else {
            res.status(400).json(result);
        }
    }
    catch (error) {
        console.error('Register route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await authService_1.AuthService.getUserById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                _id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.status === 'active',
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Get user route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map