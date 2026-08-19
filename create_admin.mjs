import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User.js';
import { hashPassword } from './lib/auth.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('📦 Connected to MongoDB Atlas');

  const adminEmail = 'admin@football.com';
  let admin = await User.findOne({ email: adminEmail });

  const hashedPassword = await hashPassword('admin123');

  if (admin) {
    admin.password = hashedPassword;
    admin.role = 'admin';
    admin.name = 'Commissioner Admin';
    await admin.save();
    console.log('✅ Updated existing admin user credentials: admin@football.com / admin123');
  } else {
    admin = await User.create({
      name: 'Commissioner Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✅ Created new admin user: admin@football.com / admin123');
  }

  const allUsers = await User.find({}, 'name email role');
  console.log('Current users in DB:', allUsers);

  process.exit(0);
}

run();
