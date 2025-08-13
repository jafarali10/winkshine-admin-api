import { authenticateToken, requireAdmin } from "../middleware/auth";
import { Category } from "../models/Category";
import { AuthRequest } from "@/types";
import { Router, Response } from "express";


const router = Router();

router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';
    const skip = (page - 1) * limit;

    // Build filter based on search and status
    const filter: any = { isDeleted: false };

    // Add search filter
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      filter.status = status;
    }
    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(filter);

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    });
  }
})

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

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status },
      { new: true }
    )

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found'
      });
      return;
    }

    res.json({
      success: true,
      data: category,
      message: `Category status updated to ${status}`
    });
  } catch (error) {
    console.error('Update category status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category status'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Name is required'
      });
      return;
    }

    // Check if user already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400).json({
        success: false,
        error: 'Category with this name already exists'
      });
      return;
    }

    // Create new user
    const newCategory = new Category({
      name,
      status: 'active'
    });

    await newCategory.save();

    // Return user without password
    const categoryResponse = await Category.findById(newCategory._id)

    res.status(201).json({
      success: true,
      data: categoryResponse,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
});

router.patch('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Name is required'
      });
      return;
    }

    // Check if email is already taken by another user
    const existingCategory = await Category.findOne({
      name,
      _id: { $ne: req.params.id },
      isDeleted: false
    });

    if (existingCategory) {
      res.status(400).json({
        success: false,
        error: 'Category is already taken'
      });
      return;
    }

    const user = await Category.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { name },
      { new: true }
    )

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Category not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    )

    if (!category) {
      res.status(404).json({
        success: false,
        error: 'Category not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
});


export default router; 
