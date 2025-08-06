import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { Router, Response } from 'express';

const router = Router();

// Get dashboard stats
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Mock dashboard stats - replace with actual data from database
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
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Mock recent activity - replace with actual data from database
    const activities = [
      {
        id: 1,
        type: 'user_registration',
        message: 'New user registered',
        details: 'John Doe joined the platform',
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        icon: 'user'
      },
      {
        id: 2,
        type: 'order_completed',
        message: 'Order completed',
        details: 'Premium car wash service',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        icon: 'car'
      },
      {
        id: 3,
        type: 'review_received',
        message: 'New review received',
        details: '5-star rating from customer',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        icon: 'star'
      }
    ];

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
});

export default router; 