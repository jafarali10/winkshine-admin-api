import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get user count
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeUsers = await User.countDocuments({ isDeleted: false, status: 'active' });
    const adminUsers = await User.countDocuments({ isDeleted: false, role: 'admin' });

    // Mock data for now - can be replaced with real business logic
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
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get recent users
    const recentUsers = await User.find({ isDeleted: false })
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
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity'
    });
  }
});

export default router; 