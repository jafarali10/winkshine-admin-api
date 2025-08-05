"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const totalUsers = await User_1.User.countDocuments({ isDeleted: false });
        const activeUsers = await User_1.User.countDocuments({ isDeleted: false, status: 'active' });
        const adminUsers = await User_1.User.countDocuments({ isDeleted: false, role: 'admin' });
        const stats = {
            totalUsers,
            activeUsers,
            adminUsers,
            totalRevenue: 45600,
            customerSatisfaction: 4.5,
            monthlyStats: [
                { month: 'Jan', users: 120, revenue: 4500 },
                { month: 'Feb', users: 150, revenue: 5200 },
                { month: 'Mar', users: 180, revenue: 6100 },
                { month: 'Apr', users: 200, revenue: 6800 },
                { month: 'May', users: 220, revenue: 7200 },
                { month: 'Jun', users: 250, revenue: 8100 },
            ]
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics'
        });
    }
});
router.get('/recent-activity', auth_1.authenticateToken, async (req, res) => {
    try {
        const recentUsers = await User_1.User.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role status createdAt');
        const activity = recentUsers.map(user => ({
            id: String(user._id),
            type: 'user_registration',
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            },
            timestamp: user.createdAt,
            description: `New ${user.role} registered: ${user.name}`
        }));
        res.json({
            success: true,
            data: activity
        });
    }
    catch (error) {
        console.error('Recent activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent activity'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map