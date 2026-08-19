import connectDB from '../../../lib/mongodb.js';
import AuctionState from '../../../models/AuctionState.js';
import Player from '../../../models/Player.js';
import Manager from '../../../models/Manager.js';
import Team from '../../../models/Team.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    let state = await AuctionState.findOne()
      .populate('currentPlayer')
      .populate({
        path: 'highestBidderManager',
        populate: { path: 'team' },
      })
      .populate('highestBidderTeam');

    if (!state) {
      state = await AuctionState.create({
        status: 'idle',
        currentPlayer: null,
        currentBid: 0,
        timer: 30,
        bidHistory: [],
      });
      state = await AuctionState.findById(state._id).populate('currentPlayer');
    }

    return res.status(200).json({ success: true, state });
  } catch (error) {
    console.error('Error fetching auction state:', error);
    return res.status(500).json({ message: 'Error fetching auction state', error: error.message });
  }
}
