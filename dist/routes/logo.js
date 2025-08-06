"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const Logo_1 = require("../models/Logo");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../public/images/logo');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 5MB.'
            });
        }
    }
    else if (error.message === 'Only image files are allowed!') {
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
router.get('/', async (req, res) => {
    try {
        const logo = await Logo_1.Logo.findOne().sort({ createdAt: -1 });
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
    }
    catch (error) {
        console.error('Get logo error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch logo'
        });
    }
});
router.post('/upload', auth_1.authenticateToken, upload.single('logo'), handleMulterError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        const currentLogo = await Logo_1.Logo.findOne();
        if (currentLogo) {
            const projectRoot = process.cwd();
            const oldFilePath = path_1.default.join(projectRoot, 'public', currentLogo.image);
            console.log('Attempting to delete old logo file:', oldFilePath);
            if (fs_1.default.existsSync(oldFilePath)) {
                try {
                    fs_1.default.unlinkSync(oldFilePath);
                    console.log('Successfully deleted old logo file:', oldFilePath);
                }
                catch (deleteError) {
                    console.error('Error deleting old logo file:', deleteError);
                }
            }
            else {
                console.log('Old logo file does not exist:', oldFilePath);
            }
        }
        const imageUrl = `/images/logo/${path_1.default.basename(req.file.filename)}`;
        await Logo_1.Logo.deleteMany({});
        const newLogo = new Logo_1.Logo({
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
    }
    catch (error) {
        console.error('Upload logo error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to upload logo'
        });
    }
});
exports.default = router;
//# sourceMappingURL=logo.js.map