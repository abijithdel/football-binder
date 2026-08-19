import connectDB from '../../../lib/mongodb.js';
import Manager from '../../../models/Manager.js';
import User from '../../../models/User.js';
import Team from '../../../models/Team.js';
import { getUserFromReq, hashPassword } from '../../../lib/auth.js';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const manager = await Manager.findById(id).populate('team').populate('user');
      if (!manager) return res.status(404).json({ message: 'Manager not found' });
      return res.status(200).json({ success: true, manager });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching manager', error: error.message });
    }
  }

  // Admin authentication guard for mutations
  const authUser = getUserFromReq(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, photo, budget, teamId, password } = req.body;
      const manager = await Manager.findById(id);
      if (!manager) return res.status(404).json({ message: 'Manager not found' });

      if (name) manager.name = name;
      if (photo !== undefined) manager.photo = photo;
      if (budget !== undefined) manager.budget = Number(budget);

      // Reassign team if specified
      if (teamId !== undefined) {
        if (manager.team && manager.team.toString() !== teamId) {
          await Team.findByIdAndUpdate(manager.team, { manager: null });
        }
        manager.team = teamId || null;
        if (teamId) {
          await Team.findByIdAndUpdate(teamId, { manager: manager._id });
        }
      }

      await manager.save();

      // Update linked User name or password if provided
      if (manager.user && (name || password)) {
        const updateData = {};
        if (name) updateData.name = name;
        if (password) updateData.password = await hashPassword(password);
        await User.findByIdAndUpdate(manager.user, updateData);
      }

      const populated = await Manager.findById(manager._id).populate('team').populate('user');
      return res.status(200).json({ success: true, manager: populated });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating manager', error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const manager = await Manager.findById(id);
      if (!manager) return res.status(404).json({ message: 'Manager not found' });

      if (manager.user) {
        await User.findByIdAndDelete(manager.user);
      }
      if (manager.team) {
        await Team.findByIdAndUpdate(manager.team, { manager: null });
      }
      await Manager.findByIdAndDelete(id);

      return res.status(200).json({ success: true, message: 'Manager deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting manager', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
