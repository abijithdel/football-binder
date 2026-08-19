import connectDB from '../../../lib/mongodb.js';
import AuctionState from '../../../models/AuctionState.js';
import Player from '../../../models/Player.js';
import Manager from '../../../models/Manager.js';
import Team from '../../../models/Team.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();
    const { managerId, amount } = req.body;

    if (!managerId || !amount) {
      return res.status(400).json({ message: 'Manager ID and amount required' });
    }

    let state = await AuctionState.findOne();
    if (!state) {
      return res.status(404).json({ message: 'Auction state not initialized' });
    }

    // Auto-start if idle or unsold with a current player
    if (state.status !== 'live') {
      if (state.currentPlayer && (state.status === 'unsold' || state.status === 'idle')) {
        state.status = 'live';
        state.timer = 30;
        await Player.findByIdAndUpdate(state.currentPlayer, { status: 'in_auction' });
      } else {
        return res.status(400).json({ message: 'Auction is currently paused or inactive' });
      }
    }

    const bidAmount = Number(amount);
    if (state.highestBidderManager) {
      if (bidAmount <= state.currentBid) {
        return res.status(400).json({
          message: `Bid must be higher than current bid (₹${state.currentBid.toLocaleString('en-IN')})`,
        });
      }
    } else {
      if (bidAmount < state.currentBid) {
        return res.status(400).json({
          message: `Bid must be at least base valuation (₹${state.currentBid.toLocaleString('en-IN')})`,
        });
      }
    }

    const manager = await Manager.findById(managerId).populate('team');
    if (!manager) {
      return res.status(404).json({ message: 'Manager profile not found' });
    }

    if (bidAmount > manager.budget) {
      return res.status(400).json({
        message: `Insufficient Funds! Available balance: ₹${manager.budget.toLocaleString('en-IN')}, cannot bind for ₹${bidAmount.toLocaleString('en-IN')}`,
      });
    }

    // Deduct manager budget
    manager.budget = manager.budget - bidAmount;
    await manager.save();

    const team = manager.team;
    const bidEntry = {
      managerId: manager._id,
      managerName: manager.name,
      managerPhoto: manager.photo,
      teamId: team ? team._id : null,
      teamName: team ? team.name : 'Independent',
      teamIcon: team ? team.icon : '🛡️',
      amount: bidAmount,
      timestamp: new Date(),
    };

    state.currentBid = bidAmount;
    state.highestBidderManager = manager._id;
    state.highestBidderTeam = team ? team._id : null;
    state.highestBidderManagerName = manager.name;
    state.highestBidderTeamName = team ? team.name : 'Independent';
    state.bidHistory.unshift(bidEntry);
    state.timer = Math.max(state.timer, 15); // Add time on bid

    await state.save();

    const populatedState = await AuctionState.findById(state._id)
      .populate('currentPlayer')
      .populate({
        path: 'highestBidderManager',
        populate: { path: 'team' },
      })
      .populate('highestBidderTeam');

    if (global.__IO__) {
      global.__IO__.emit('auction:new_bid', {
        bid: bidEntry,
        currentBid: bidAmount,
        highestBidder: manager,
        highestBidderTeam: team,
        highestBidderTeamName: team ? team.name : 'Independent',
        timer: state.timer,
        auctionState: populatedState,
      });
      global.__IO__.emit('auction:state_update', populatedState);
    }

    return res.status(200).json({
      success: true,
      auctionState: populatedState,
      bid: bidEntry,
    });
  } catch (error) {
    console.error('Error in /api/auction/bid:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
