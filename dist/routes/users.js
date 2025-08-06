"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const express_1 = require("express");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/list/regular', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false, role: 'user' };
        if (search && search.trim()) {
            filter.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } }
            ];
        }
        if (status && status !== 'all') {
            filter.status = status;
        }
        const users = await User_1.User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.User.countDocuments(filter);
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
        console.error('Get regular users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch regular users'
        });
    }
});
router.get('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const role = req.query.role;
        const skip = (page - 1) * limit;
        const filter = { isDeleted: false };
        if (role && ['admin', 'user'].includes(role)) {
            filter.role = role;
        }
        const users = await User_1.User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.User.countDocuments(filter);
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
router.patch('/bulk/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { userIds, status } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            res.status(400).json({
                success: false,
                error: 'User IDs array is required'
            });
            return;
        }
        if (!['active', 'inactive'].includes(status)) {
            res.status(400).json({
                success: false,
                error: 'Status must be either active or inactive'
            });
            return;
        }
        const result = await User_1.User.updateMany({ _id: { $in: userIds }, isDeleted: false }, { status });
        res.json({
            success: true,
            data: {
                modifiedCount: result.modifiedCount,
                totalRequested: userIds.length
            },
            message: `Updated ${result.modifiedCount} users to ${status}`
        });
    }
    catch (error) {
        console.error('Bulk update user status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user statuses'
        });
    }
});
router.patch('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            res.status(400).json({
                success: false,
                error: 'Name and email are required'
            });
            return;
        }
        const existingUser = await User_1.User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: req.params.id },
            isDeleted: false
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'Email is already taken by another user'
            });
            return;
        }
        const user = await User_1.User.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, {
            name: name.trim(),
            email: email.toLowerCase().trim()
        }, { new: true }).select('-password');
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
            message: 'User updated successfully'
        });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
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
router.delete('/bulk', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            res.status(400).json({
                success: false,
                error: 'User IDs array is required'
            });
            return;
        }
        const result = await User_1.User.updateMany({ _id: { $in: userIds }, isDeleted: false }, { isDeleted: true });
        res.json({
            success: true,
            data: {
                deletedCount: result.modifiedCount,
                totalRequested: userIds.length
            },
            message: `Deleted ${result.modifiedCount} users successfully`
        });
    }
    catch (error) {
        console.error('Bulk delete users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete users'
        });
    }
});
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                error: 'Name, email, and password are required'
            });
            return;
        }
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
            return;
        }
        const newUser = new User_1.User({
            name,
            email: email.toLowerCase(),
            password,
            role,
            status: 'active'
        });
        await newUser.save();
        const userResponse = await User_1.User.findById(newUser._id).select('-password');
        res.status(201).json({
            success: true,
            data: userResponse,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create user'
        });
    }
});
router.get('/stats/overview', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const [totalUsers, activeUsers, inactiveUsers, totalAdmins, activeAdmins, inactiveAdmins] = await Promise.all([
            User_1.User.countDocuments({ isDeleted: false, role: 'user' }),
            User_1.User.countDocuments({ isDeleted: false, role: 'user', status: 'active' }),
            User_1.User.countDocuments({ isDeleted: false, role: 'user', status: 'inactive' }),
            User_1.User.countDocuments({ isDeleted: false, role: 'admin' }),
            User_1.User.countDocuments({ isDeleted: false, role: 'admin', status: 'active' }),
            User_1.User.countDocuments({ isDeleted: false, role: 'admin', status: 'inactive' })
        ]);
        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    inactive: inactiveUsers
                },
                admins: {
                    total: totalAdmins,
                    active: activeAdmins,
                    inactive: inactiveAdmins
                }
            }
        });
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user statistics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map