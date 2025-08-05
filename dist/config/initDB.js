"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const database_1 = require("./database");
const User_1 = require("../models/User");
const initializeDatabase = async () => {
    try {
        await (0, database_1.connectDB)();
        const existingAdmin = await User_1.User.findOne({
            email: 'admin@winkshine.com',
            isDeleted: false
        });
        if (!existingAdmin) {
            const adminUser = new User_1.User({
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
        }
        else {
            console.log('✅ Admin user already exists');
        }
        const userCount = await User_1.User.countDocuments({ isDeleted: false });
        console.log(`📊 Total users in database: ${userCount}`);
    }
    catch (error) {
        console.error('❌ Error initializing database:', error);
    }
    finally {
        await (0, database_1.disconnectDB)();
    }
};
exports.initializeDatabase = initializeDatabase;
if (require.main === module) {
    (0, exports.initializeDatabase)();
}
//# sourceMappingURL=initDB.js.map