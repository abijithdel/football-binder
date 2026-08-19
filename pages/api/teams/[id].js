import connectDB from '../../../lib/mongodb.js';
import Team from '../../../models/Team.js';
import Manager from '../../../models/Manager.js';
import Player from '../../../models/Player.js';
import { getUserFromReq } from '../../../lib/auth.js';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const team = await Team.findById(id).populate('manager').populate('playersWon');
      if (!team) return res.status(404).json({ message: 'Team not found' });
      return res.status(200).json({ success: true, team });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching team', error: error.message });
    }
  }

  const authUser = getUserFromReq(req);
  if (!authUser || authUser.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, icon, managerId } = req.body;
      const team = await Team.findById(id);
      if (!team) return res.status(404).json({ message: 'Team not found' });

      if (name) team.name = name.trim();
      if (icon) team.icon = icon;

      if (managerId !== undefined) {
        if (team.manager && team.manager.toString() !== managerId) {
          await Manager.findByIdAndUpdate(team.manager, { team: null });
        }
        team.manager = managerId || null;
        if (managerId) {
          await Manager.findByIdAndUpdate(managerId, { team: team._id });
        }
      }

      await team.save();
      const populated = await Team.findById(team._id).populate('manager').populate('playersWon');
      return res.status(200).json({ success: true, team: populated });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating team', error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const team = await Team.findById(id);
      if (!team) return res.status(404).json({ message: 'Team not found' });

      // Unassign manager
      if (team.manager) {
        await Manager.findByIdAndUpdate(team.manager, { team: null });
      }
      // Unassign players
      await Player.updateMany({ team: team._id }, { team: null, status: 'available' });
      await Team.findByIdAndDelete(id);

      return res.status(200).json({ success: true, message: 'Team deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting team', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
