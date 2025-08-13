import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { Logo } from '../models/Logo';

const router = Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = path.join(__dirname, '../../public/images/logo');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
  } else if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed.'
    });
  }

  console.error('Multer error:', error);
  return res.status(500).json({
    success: false,
    error: 'File upload failed'
  });
};

// Get current logo
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const logo = await Logo.findOne().sort({ createdAt: -1 });

    if (!logo) {
      return res.status(404).json({
        success: false,
        error: 'No logo found'
      });
    }

    return res.json({
      success: true,
      data: {
        logo: {
          _id: logo._id,
          image: logo.image,
          createdAt: logo.createdAt,
          updatedAt: logo.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get logo error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch logo'
    });
  }
});

// Upload new logo
router.post('/upload', authenticateToken, upload.single('logo'), handleMulterError, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Get the current logo to delete its file
    const currentLogo = await Logo.findOne();

    // Delete the old logo file if it exists
    if (currentLogo) {
      const projectRoot = process.cwd();
      const oldFilePath = path.join(projectRoot, 'public', currentLogo.image);
      console.log('Attempting to delete old logo file:', oldFilePath);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          console.log('Successfully deleted old logo file:', oldFilePath);
        } catch (deleteError) {
          console.error('Error deleting old logo file:', deleteError);
        }
      } else {
        console.log('Old logo file does not exist:', oldFilePath);
      }
    }

    // Get the file path relative to public directory
    const imageUrl = `/images/logo/${path.basename(req.file.filename)}`;

    // Delete all existing logos from database
    await Logo.deleteMany({});

    // Create new logo record
    const newLogo = new Logo({
      image: imageUrl
    });

    await newLogo.save();

    return res.json({
      success: true,
      data: {
        logo: {
          _id: newLogo._id,
          image: newLogo.image,
          createdAt: newLogo.createdAt,
          updatedAt: newLogo.updatedAt
        }
      },
      message: 'Logo uploaded successfully'
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload logo'
    });
  }
});

export default router; 