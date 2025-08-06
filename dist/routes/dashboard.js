"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const stats = {
            totalUsers: 1250,
            activeUsers: 1180,
            inactiveUsers: 70,
            totalRevenue: 45600,
            monthlyRevenue: 3800,
            customerSatisfaction: 4.5,
            totalOrders: 1847,
            pendingOrders: 23,
            completedOrders: 1824
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
            error: 'Failed to fetch dashboard stats'
        });
    }
});
router.get('/recent-activity', auth_1.authenticateToken, async (req, res) => {
    try {
        const activities = [
            {
                id: 1,
                type: 'user_registration',
                message: 'New user registered',
                details: 'John Doe joined the platform',
                timestamp: new Date(Date.now() - 2 * 60 * 1000),
                icon: 'user'
            },
            {
                id: 2,
                type: 'order_completed',
                message: 'Order completed',
                details: 'Premium car wash service',
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                icon: 'car'
            },
            {
                id: 3,
                type: 'review_received',
                message: 'New review received',
                details: '5-star rating from customer',
                timestamp: new Date(Date.now() - 60 * 60 * 1000),
                icon: 'star'
            }
        ];
        res.json({
            success: true,
            data: activities
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