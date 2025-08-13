import { AuthRequest } from '../types';
import { Router, Response } from 'express';
import { User } from '../models/User';

const router = Router();

// Get dashboard stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    // Get actual user counts from database
    const totalUsers = await User.countDocuments({ 
      role: 'user', 
      isDeleted: false 
    });
    
    const stats = {
      totalUsers,
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


export default router; 