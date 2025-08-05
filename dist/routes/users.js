"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = await User_1.User.find({ isDeleted: false })
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.User.countDocuments({ isDeleted: false });
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});
router.get('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const user = await User_1.User.findOne({ _id: req.params.id, isDeleted: false }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
});
router.patch('/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            res.status(400).json({
                success: false,
                error: 'Status must be either active or inactive'
            });
            return;
        }
        const user = await User_1.User.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { status }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            data: user,
            message: `User status updated to ${status}`
        });
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user status'
        });
    }
});
router.patch('/:id/role', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'user'].includes(role)) {
            res.status(400).json({
                success: false,
                error: 'Role must be either admin or user'
            });
            return;
        }
        const user = await User_1.User.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { role }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            data: user,
            message: `User role updated to ${role}`
        });
    }
    catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user role'
        });
    }
});
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const user = await User_1.User.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map