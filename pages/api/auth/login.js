import connectDB from '../../../lib/mongodb.js';
import User from '../../../models/User.js';
import Manager from '../../../models/Manager.js';
import Team from '../../../models/Team.js';
import { comparePassword, signToken } from '../../../lib/auth.js';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate({
      path: 'managerProfile',
      populate: { path: 'team' },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      managerId: user.managerProfile?._id || null,
      teamId: user.managerProfile?.team?._id || null,
    });

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    res.setHeader('Set-Cookie', cookie);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerProfile: user.managerProfile,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
