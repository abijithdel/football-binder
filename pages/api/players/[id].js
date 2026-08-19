import connectDB from '../../../lib/mongodb.js';
import Player from '../../../models/Player.js';
import { getUserFromReq } from '../../../lib/auth.js';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const player = await Player.findById(id).populate('team').populate('soldTo');
      if (!player) return res.status(404).json({ message: 'Player not found' });
      return res.status(200).json({ success: true, player });
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching player', error: error.message });
    }
  }

  // Admin mutation guard
  const user = getUserFromReq(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (req.method === 'PUT') {
    try {
      const updated = await Player.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Player not found' });
      return res.status(200).json({ success: true, player: updated });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating player', error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Player.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Player deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting player', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
