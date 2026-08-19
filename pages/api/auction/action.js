import connectDB from '../../../lib/mongodb.js';
import AuctionState from '../../../models/AuctionState.js';
import Player from '../../../models/Player.js';
import Manager from '../../../models/Manager.js';
import Team from '../../../models/Team.js';
import { getUserFromReq } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectDB();
    const user = getUserFromReq(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { action, playerId, duration = 30, seconds = 15 } = req.body;

    let state = await AuctionState.findOne();
    if (!state) {
      state = await AuctionState.create({
        status: 'idle',
        currentPlayer: null,
        currentBid: 0,
        timer: 30,
        bidHistory: [],
      });
    }

    if (action === 'start') {
      const player = await Player.findById(playerId);
      if (!player) return res.status(404).json({ message: 'Player not found' });

      await Player.findByIdAndUpdate(playerId, { status: 'in_auction' });

      state.status = 'live';
      state.currentPlayer = player._id;
      state.currentBid = player.value || 100;
      state.highestBidderManager = null;
      state.highestBidderTeam = null;
      state.highestBidderManagerName = null;
      state.highestBidderTeamName = null;
      state.timer = duration || 30;
      state.bidHistory = [];
      await state.save();
    } else if (action === 'pause') {
      if (state.status === 'live') {
        state.status = 'paused';
        await state.save();
      }
    } else if (action === 'resume') {
      if (state.status === 'paused') {
        state.status = 'live';
        await state.save();
      }
    } else if (action === 'add_time') {
      state.timer += Number(seconds) || 15;
      await state.save();
    } else if (action === 'sell') {
      state.status = 'sold';
      await state.save();

      const pId = state.currentPlayer?._id || state.currentPlayer;
      const player = await Player.findById(pId);
      let manager = null;
      let team = null;

      if (state.highestBidderManager) {
        manager = await Manager.findById(state.highestBidderManager).populate('team');
        if (manager && manager.team) team = manager.team;
      }
      if (!team && state.highestBidderTeam) {
        team = await Team.findById(state.highestBidderTeam);
      }

      if (player) {
        player.status = 'sold';
        player.soldPrice = state.currentBid;
        player.currentValue = state.currentBid;
        if (manager) player.soldTo = manager._id;
        if (team) player.team = team._id;
        await player.save();
      }

      if (team && player) {
        // Remove player from ALL other teams to guarantee ONE single team owns the player!
        await Team.updateMany(
          { _id: { $ne: team._id } },
          { $pull: { playersWon: player._id } }
        );
        if (!team.playersWon) team.playersWon = [];
        if (!team.playersWon.some((id) => id.toString() === player._id.toString())) {
          team.playersWon.push(player._id);
        }
        team.budgetSpent = (team.budgetSpent || 0) + state.currentBid;
        await team.save();
      }
    } else if (action === 'unsold') {
      state.status = 'unsold';
      await state.save();
      if (state.currentPlayer) {
        await Player.findByIdAndUpdate(state.currentPlayer, { status: 'unsold' });
      }
    } else if (action === 'reset') {
      state.status = 'idle';
      state.currentPlayer = null;
      state.currentBid = 0;
      state.highestBidderManager = null;
      state.highestBidderTeam = null;
      state.highestBidderManagerName = null;
      state.highestBidderTeamName = null;
      state.timer = 30;
      state.bidHistory = [];
      await state.save();
    }

    const populatedState = await AuctionState.findById(state._id)
      .populate('currentPlayer')
      .populate({
        path: 'highestBidderManager',
        populate: { path: 'team' },
      })
      .populate('highestBidderTeam');

    if (global.__IO__) {
      global.__IO__.emit('auction:state_update', populatedState);
    }

    return res.status(200).json({ success: true, auctionState: populatedState });
  } catch (error) {
    console.error('Error in /api/auction/action:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
