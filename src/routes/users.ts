import { authenticateToken, requireAdmin } from '../middleware/auth';
import { AuthRequest } from '../types';
import { Router, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const router = Router();

// Get regular users only (admin only) - specific endpoint for user management
router.get('/list/regular', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const skip = (page - 1) * limit;

    // Build filter based on search and status
    const filter: any = { isDeleted: false, role: 'user' };
    
    // Add search filter
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

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
  } catch (error) {
    console.error('Get regular users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regular users'
    });
  }
});

// Get all users (admin only) - with optional role filtering
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string; // Optional role filter
    const skip = (page - 1) * limit;

    // Build query filter
    const filter: any = { isDeleted: false };
    if (role && ['admin', 'user'].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

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
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false }).select('-password');
    
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
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// Update user status
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Status must be either active or inactive'
      });
      return;
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status },
      { new: true }
    ).select('-password');

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
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// Bulk update user statuses
router.patch('/bulk/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
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

    const result = await User.updateMany(
      { _id: { $in: userIds }, isDeleted: false },
      { status }
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        totalRequested: userIds.length
      },
      message: `Updated ${result.modifiedCount} users to ${status}`
    });
  } catch (error) {
    console.error('Bulk update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user statuses'
    });
  }
});

// Update user details
router.patch('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    
    // Validation
    if (!name || !email) {
      res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
      return;
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
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

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { 
        name: name.trim(),
        email: email.toLowerCase().trim()
      },
      { new: true }
    ).select('-password');

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
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

// Update user role
router.patch('/:id/role', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    
    if (!['admin', 'user'].includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Role must be either admin or user'
      });
      return;
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { role },
      { new: true }
    ).select('-password');

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
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
});

// Soft delete user
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    ).select('-password');

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
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// Bulk soft delete users
router.delete('/bulk', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'User IDs array is required'
      });
      return;
    }

    const result = await User.updateMany(
      { _id: { $in: userIds }, isDeleted: false },
      { isDeleted: true }
    );

    res.json({
      success: true,
      data: {
        deletedCount: result.modifiedCount,
        totalRequested: userIds.length
      },
      message: `Deleted ${result.modifiedCount} users successfully`
    });
  } catch (error) {
    console.error('Bulk delete users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete users'
    });
  }
});

// Create new user
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
      return;
    }

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      status: 'active'
    });

    await newUser.save();

    // Return user without password
    const userResponse = await User.findById(newUser._id).select('-password');

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// Get user statistics
router.get('/stats/overview', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalAdmins,
      activeAdmins,
      inactiveAdmins
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false, role: 'user' }),
      User.countDocuments({ isDeleted: false, role: 'user', status: 'active' }),
      User.countDocuments({ isDeleted: false, role: 'user', status: 'inactive' }),
      User.countDocuments({ isDeleted: false, role: 'admin' }),
      User.countDocuments({ isDeleted: false, role: 'admin', status: 'active' }),
      User.countDocuments({ isDeleted: false, role: 'admin', status: 'inactive' })
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
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics'
    });
  }
});

export default router; 