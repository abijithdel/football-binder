import connectDB from '../../../lib/mongodb.js';
import User from '../../../models/User.js';
import Manager from '../../../models/Manager.js';
import Team from '../../../models/Team.js';
import Player from '../../../models/Player.js';
import { getUserFromReq } from '../../../lib/auth.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    const tokenData = getUserFromReq(req);
    if (!tokenData) {
      return res.status(401).json({ user: null });
    }

    const user = await User.findById(tokenData.userId).populate({
      path: 'managerProfile',
      populate: [
        {
          path: 'team',
          populate: { path: 'playersWon' },
        },
      ],
    });

    if (!user) {
      return res.status(401).json({ user: null });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerProfile: user.managerProfile,
      },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
