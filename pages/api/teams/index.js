import connectDB from '../../../lib/mongodb.js';
import Team from '../../../models/Team.js';
import Manager from '../../../models/Manager.js';
import Player from '../../../models/Player.js';
import { getUserFromReq } from '../../../lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const teams = await Team.find()
        .populate('manager')
        .populate('playersWon')
        .sort({ name: 1 });

      return res.status(200).json({ success: true, teams });
    } catch (error) {
      console.error('Error fetching teams:', error);
      return res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const authUser = getUserFromReq(req);
      if (!authUser || authUser.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { name, icon, managerId } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Team name is required' });
      }

      const existing = await Team.findOne({ name: name.trim() });
      if (existing) {
        return res.status(400).json({ message: 'A team with this name already exists' });
      }

      const team = await Team.create({
        name: name.trim(),
        icon: icon || '🛡️',
        manager: managerId || null,
        budgetSpent: 0,
        playersWon: [],
      });

      if (managerId) {
        await Manager.findByIdAndUpdate(managerId, { team: team._id });
      }

      const populated = await Team.findById(team._id).populate('manager').populate('playersWon');
      return res.status(201).json({ success: true, team: populated });
    } catch (error) {
      console.error('Error creating team:', error);
      return res.status(500).json({ message: 'Error creating team', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
