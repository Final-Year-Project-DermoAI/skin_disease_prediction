import { getPasswordHash } from './src/utils/auth';
import { User } from './src/models';
import sequelize from './src/config/database';

async function generateAdmin() {
  try {
    await sequelize.sync();
    
    const adminEmail = 'admin@skintermo.com';
    const existing = await User.findOne({ where: { email: adminEmail } });
    
    if (existing) {
      console.log('Admin user already exists!');
      process.exit(0);
    }
    
    const hashedPassword = getPasswordHash('admin123');
    
    const admin = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      status: 'APPROVED',
      isVerified: true
    });
    
    console.log('Admin properly created with ID:', admin.id);
  } catch (error) {
    console.error('Failed to create admin:', error);
  } finally {
    process.exit(0);
  }
}

generateAdmin();
