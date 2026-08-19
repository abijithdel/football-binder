import connectDB from '../../../lib/mongodb.js';
import Manager from '../../../models/Manager.js';
import User from '../../../models/User.js';
import Team from '../../../models/Team.js';
import { getUserFromReq, hashPassword } from '../../../lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const managers = await Manager.find()
        .populate('team')
        .populate('user', 'name email role')
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, managers });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching managers', error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const authUser = getUserFromReq(req);
      if (!authUser || authUser.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required to create manager accounts' });
      }

      const { name, email, password, photo, teamId, budget = 150000000 } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'manager',
      });

      const manager = await Manager.create({
        name,
        photo: photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        user: user._id,
        team: teamId || null,
        budget: Number(budget) || 150000000,
        initialBudget: Number(budget) || 150000000,
      });

      user.managerProfile = manager._id;
      await user.save();

      // If team assigned, update team's manager reference
      if (teamId) {
        await Team.findByIdAndUpdate(teamId, { manager: manager._id });
      }

      const populatedManager = await Manager.findById(manager._id).populate('team').populate('user');
      return res.status(201).json({ success: true, manager: populatedManager });
    } catch (error) {
      console.error('Error creating manager:', error);
      return res.status(500).json({ message: 'Error creating manager', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
