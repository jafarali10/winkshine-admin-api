import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { AuthService } from '../services/authService';

const router = Router();

// Login route
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }

    const result = await AuthService.login({ email, password });
    
    if (result.success && result.data) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Register route (admin only)
router.post('/register', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
      return;
    }

    const result = await AuthService.register({ name, email, password, role });
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify token route
router.get('/verify', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    const user = await AuthService.getUserById(req.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      }
    });
  } catch (error) {
    console.error('Verify token route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router; 