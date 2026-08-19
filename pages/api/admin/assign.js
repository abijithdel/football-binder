import connectDB from '../../../lib/mongodb.js';
import Team from '../../../models/Team.js';
import Manager from '../../../models/Manager.js';
import { getUserFromReq } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const authUser = getUserFromReq(req);
    if (!authUser || authUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { managerId, teamId } = req.body;
    if (!managerId || !teamId) {
      return res.status(400).json({ message: 'Manager ID and Team ID are required' });
    }

    const manager = await Manager.findById(managerId);
    const team = await Team.findById(teamId);

    if (!manager || !team) {
      return res.status(404).json({ message: 'Manager or Team not found' });
    }

    // If manager was assigned to another team, unassign that team
    if (manager.team && manager.team.toString() !== teamId) {
      await Team.findByIdAndUpdate(manager.team, { manager: null });
    }

    // If team had another manager, unassign that manager
    if (team.manager && team.manager.toString() !== managerId) {
      await Manager.findByIdAndUpdate(team.manager, { team: null });
    }

    manager.team = team._id;
    await manager.save();

    team.manager = manager._id;
    await team.save();

    return res.status(200).json({
      success: true,
      message: `Assigned manager ${manager.name} to team ${team.name}`,
      manager,
      team,
    });
  } catch (error) {
    console.error('Assign manager error:', error);
    return res.status(500).json({ message: 'Error assigning manager', error: error.message });
  }
}
