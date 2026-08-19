import connectDB from '../../../lib/mongodb.js';
import User from '../../../models/User.js';
import { hashPassword } from '../../../lib/auth.js';

export default async function handler(req, res) {
  try {
    await connectDB();

    const adminEmail = 'admin@football.com';
    let admin = await User.findOne({ email: adminEmail });
    const hashedPassword = await hashPassword('admin123');

    if (admin) {
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.name = 'Commissioner Admin';
      await admin.save();
    } else {
      admin = await User.create({
        name: 'Commissioner Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Admin account created/restored successfully!',
      credentials: {
        email: 'admin@football.com',
        password: 'admin123',
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Error in /api/admin/setup:', error);
    return res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
}
