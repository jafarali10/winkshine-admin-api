# Winkshine Admin API

Backend API server for the Winkshine Car Wash Admin Panel with MongoDB integration and JWT authentication.

## Features

- 🔐 JWT Authentication
- 👥 User Management (Admin/User roles)
- 🗄️ MongoDB Database Integration
- 🔒 Password Hashing with bcrypt
- 🛡️ Security Middleware (Helmet, CORS, Rate Limiting)
- 📝 TypeScript Support
- 🚀 Express.js Framework

## Prerequisites

1. **Node.js** - Version 16 or higher
2. **MongoDB** - Running on localhost:27017
3. **npm** or **yarn**

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/winkshine

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

3. **Initialize Database:**
   ```bash
   npm run init-db
   ```
   This creates a default admin user:
   - Email: `admin@winkshine.com`
   - Password: `admin123`

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user (protected)

### Health Check
- `GET /api/health` - Server health status

## User Schema

```typescript
interface User {
  name: string;           // Required, max 50 characters
  email: string;          // Required, unique, validated
  password: string;       // Required, min 6 characters, hashed
  role: 'admin' | 'user'; // Default: 'user'
  isDeleted: boolean;     // Default: false (soft delete)
  status: 'active' | 'inactive'; // Default: 'active'
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-generated
}
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Authentication**: Secure token-based authentication
3. **CORS Protection**: Configured for frontend origin
4. **Rate Limiting**: 100 requests per 15 minutes per IP
5. **Helmet Security**: Various HTTP security headers
6. **Input Validation**: Email format and required field validation

## Database Setup

### MongoDB Connection
The application connects to MongoDB using the URL specified in the `MONGODB_URI` environment variable.

### Default Admin User
After running `npm run init-db`, you can login with:
- **Email**: `admin@winkshine.com`
- **Password**: `admin123`

## Development

### Project Structure
```
src/
├── config/
│   ├── database.ts      # MongoDB connection
│   └── initDB.ts        # Database initialization
├── middleware/
│   └── auth.ts          # Authentication middleware
├── models/
│   └── User.ts          # User model
├── routes/
│   └── auth.ts          # Authentication routes
├── services/
│   └── authService.ts   # Authentication logic
└── server.ts            # Main server file
```

### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run init-db` - Initialize database with default admin user

## Error Handling

The API includes comprehensive error handling:
- Input validation errors
- Database connection errors
- Authentication errors
- JWT token validation errors
- General server errors

## CORS Configuration

The server is configured to accept requests from the frontend URL specified in `FRONTEND_URL` environment variable (default: `http://localhost:3000`).

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper `MONGODB_URI` for production database
4. Set appropriate `FRONTEND_URL`
5. Use HTTPS in production
6. Configure proper rate limiting for production traffic

## Troubleshooting

### MongoDB Connection Issues
1. Check if MongoDB is running: `mongosh` or `mongo`
2. Verify the connection URL in your `.env` file
3. Check MongoDB logs for errors

### Authentication Issues
1. Ensure the database is initialized: `npm run init-db`
2. Check if the user exists and is active
3. Verify email and password are correct

### Build Issues
1. Install dependencies: `npm install`
2. Check TypeScript errors: `npm run build`
3. Clear `dist` folder and rebuild if needed 