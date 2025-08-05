import { connectDB, disconnectDB } from './database';
import { User } from '../models/User';

export const initializeDatabase = async (): Promise<void> => {
  try {
    await connectDB();
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      email: 'admin@winkshine.com',
      isDeleted: false 
    });

    if (!existingAdmin) {
      // Create default admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@winkshine.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });

      await adminUser.save();
      console.log('✅ Default admin user created successfully');
      console.log('📧 Email: admin@winkshine.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Check if any users exist
    const userCount = await User.countDocuments({ isDeleted: false });
    console.log(`📊 Total users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await disconnectDB();
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
} 