import connectDB from '../../../lib/mongodb.js';
import Player from '../../../models/Player.js';
import { getUserFromReq } from '../../../lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { position, status, search } = req.query;
      const query = {};

      if (position && position !== 'ALL') {
        query.position = position;
      }
      if (status && status !== 'ALL') {
        query.status = status;
      }
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const players = await Player.find(query)
        .populate('team')
        .populate('soldTo')
        .sort({ rating: -1, value: -1 });

      return res.status(200).json({ success: true, players });
    } catch (error) {
      console.error('Error fetching players:', error);
      return res.status(500).json({ message: 'Error fetching players', error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const user = getUserFromReq(req);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { name, photo, position, value, rating, stats, nationality, age } = req.body;

      if (!name || !position || value === undefined) {
        return res.status(400).json({ message: 'Name, position, and value are required' });
      }

      const player = await Player.create({
        name,
        photo: photo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
        position,
        value: Number(value),
        currentValue: Number(value),
        rating: Number(rating) || 80,
        nationality: nationality || 'International',
        age: Number(age) || 24,
        stats: stats || {
          pace: 75,
          shooting: 75,
          passing: 75,
          dribbling: 75,
          defending: 75,
          physical: 75,
        },
        status: 'available',
      });

      return res.status(201).json({ success: true, player });
    } catch (error) {
      console.error('Error creating player:', error);
      return res.status(500).json({ message: 'Error creating player', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
