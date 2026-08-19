import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore
}

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import http from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './lib/mongodb.js';
import AuctionState from './models/AuctionState.js';
import Player from './models/Player.js';
import Manager from './models/Manager.js';
import Team from './models/Team.js';
import { seedDatabase } from './lib/seedData.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let io = null;
let timerInterval = null;

// Helper to get populated auction state
async function getFullAuctionState() {
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
  return state;
}

// Start / Sync live timer
function startTimerLoop() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(async () => {
    try {
      const state = await AuctionState.findOne();
      if (!state || state.status !== 'live') {
        return;
      }

      if (state.timer > 0) {
        state.timer -= 1;
        await state.save();
        io.emit('auction:tick', { timer: state.timer, status: state.status });
      } else {
        // Timer reached 0! Finalize auction
        if (state.highestBidderManager && state.currentBid > 0) {
          await finalizeSale(state);
        } else {
          await finalizeUnsold(state);
        }
      }
    } catch (err) {
      console.error('Error in timer loop:', err);
    }
  }, 1000);
}

// Finalize Sale
async function finalizeSale(state) {
  try {
    state.status = 'sold';
    await state.save();

    const playerId = state.currentPlayer?._id || state.currentPlayer;
    const player = await Player.findById(playerId);

    let manager = null;
    let team = null;

    if (state.highestBidderManager) {
      const managerId = state.highestBidderManager?._id || state.highestBidderManager;
      manager = await Manager.findById(managerId).populate('team');
      if (manager && manager.team) {
        team = manager.team;
      }
    }
    if (!team && state.highestBidderTeam) {
      const teamId = state.highestBidderTeam?._id || state.highestBidderTeam;
      team = await Team.findById(teamId);
    }

    if (player) {
      player.status = 'sold';
      player.soldPrice = state.currentBid;
      player.currentValue = state.currentBid;
      if (manager) {
        player.soldTo = manager._id;
      }
      if (team) {
        player.team = team._id;
      }
      await player.save();
    }

    if (manager) {
      await manager.save();
    }

    if (team && player) {
      if (!team.playersWon) team.playersWon = [];
      if (!team.playersWon.some((id) => id.toString() === player._id.toString())) {
        team.playersWon.push(player._id);
      }
      team.budgetSpent = (team.budgetSpent || 0) + state.currentBid;
      await team.save();
    }

    const fullState = await getFullAuctionState();
    io.emit('auction:player_sold', {
      player,
      winnerManager: manager,
      winnerTeam: team,
      soldPrice: state.currentBid,
      auctionState: fullState,
    });
    io.emit('auction:state_update', fullState);
  } catch (e) {
    console.error('Error finalizing sale:', e);
  }
}

// Finalize Unsold
async function finalizeUnsold(state) {
  try {
    state.status = 'unsold';
    await state.save();

    if (state.currentPlayer) {
      await Player.findByIdAndUpdate(state.currentPlayer, { status: 'unsold' });
    }

    const fullState = await getFullAuctionState();
    io.emit('auction:player_unsold', {
      player: fullState.currentPlayer,
      auctionState: fullState,
    });
    io.emit('auction:state_update', fullState);
  } catch (e) {
    console.error('Error finalizing unsold:', e);
  }
}

app.prepare().then(async () => {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB Atlas Cluster');
    // Ensure initial seed ONLY if database is empty
    await seedDatabase(false);
  } catch (err) {
    console.error('MongoDB startup error:', err);
  }

  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Make IO accessible globally in Next.js API routes if needed
  global.__IO__ = io;

  io.on('connection', async (socket) => {
    // Send initial auction snapshot on connection
    try {
      const state = await getFullAuctionState();
      socket.emit('auction:state_update', state);
    } catch (err) {
      console.error('Socket init error:', err);
    }

    // Manager places a bid
    socket.on('auction:place_bid', async (data) => {
      try {
        const { managerId, amount } = data;
        if (!managerId || !amount) {
          socket.emit('auction:bid_error', { message: 'Manager ID and amount required' });
          return;
        }

        let state = await AuctionState.findOne();
        if (!state) {
          socket.emit('auction:bid_error', { message: 'Auction state not initialized' });
          return;
        }

        // If auction was unsold/idle but has a current player, allow auto-starting on bid
        if (state.status !== 'live') {
          if (state.currentPlayer && (state.status === 'unsold' || state.status === 'idle')) {
            state.status = 'live';
            state.timer = 30;
            await Player.findByIdAndUpdate(state.currentPlayer, { status: 'in_auction' });
          } else {
            socket.emit('auction:bid_error', { message: 'Auction is currently paused or inactive' });
            return;
          }
        }

        const bidAmount = Number(amount);
        // If highest bidder already exists, next bid must be strictly higher
        // If no bids yet, bid must be at least base value
        if (state.highestBidderManager) {
          if (bidAmount <= state.currentBid) {
            socket.emit('auction:bid_error', {
              message: `Bid must be higher than current bid (₹${state.currentBid.toLocaleString('en-IN')})`,
            });
            return;
          }
        } else {
          if (bidAmount < state.currentBid) {
            socket.emit('auction:bid_error', {
              message: `Bid must be at least base valuation (₹${state.currentBid.toLocaleString('en-IN')})`,
            });
            return;
          }
        }

        const manager = await Manager.findById(managerId).populate('team');
        if (!manager) {
          socket.emit('auction:bid_error', { message: 'Manager profile not found' });
          return;
        }

        // Strict Check: If requested bind amount is more than manager funds, DO NOT BIND
        if (bidAmount > manager.budget) {
          socket.emit('auction:bid_error', {
            message: `Insufficient Funds! Available balance: ₹${manager.budget.toLocaleString('en-IN')}, cannot bind for ₹${bidAmount.toLocaleString('en-IN')}`,
          });
          return;
        }

        // Minus / deduct the bound amount from manager fund
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
        state.highestBidderName = manager.name;
        state.highestBidderTeamName = team ? team.name : '';
        state.bidHistory.unshift(bidEntry);
        state.lastBidTime = new Date();

        // Reset timer if less than 15s to keep bidding exciting
        state.timer = Math.max(state.timer, 15);
        await state.save();

        // Also push to player history
        if (state.currentPlayer) {
          await Player.findByIdAndUpdate(state.currentPlayer, {
            $push: { bidHistory: bidEntry },
            currentValue: bidAmount,
          });
        }

        const fullState = await getFullAuctionState();
        io.emit('auction:new_bid', {
          bid: bidEntry,
          currentBid: bidAmount,
          timer: state.timer,
          highestBidder: {
            managerName: manager.name,
            managerPhoto: manager.photo,
            teamName: team ? team.name : '',
            teamIcon: team ? team.icon : '',
          },
        });
        io.emit('auction:state_update', fullState);
      } catch (err) {
        console.error('Bid handling error:', err);
        socket.emit('auction:bid_error', { message: err.message || 'Error processing bid' });
      }
    });

    // Admin starts auction on a player
    socket.on('admin:start_auction', async (data) => {
      try {
        const { playerId, duration = 30 } = data;
        const player = await Player.findById(playerId);
        if (!player) {
          socket.emit('admin:error', { message: 'Player not found' });
          return;
        }

        let state = await AuctionState.findOne();
        if (!state) {
          state = new AuctionState();
        }

        // Set previous player to unsold if was in_auction
        if (state.currentPlayer && state.currentPlayer.toString() !== playerId) {
          await Player.findByIdAndUpdate(state.currentPlayer, {
            status: 'unsold',
          });
        }

        player.status = 'in_auction';
        player.currentValue = player.value;
        player.bidHistory = [];
        await player.save();

        state.status = 'live';
        state.currentPlayer = player._id;
        state.currentBid = player.value;
        state.highestBidderManager = null;
        state.highestBidderTeam = null;
        state.highestBidderName = '';
        state.highestBidderTeamName = '';
        state.timer = Number(duration) || 30;
        state.timerDuration = Number(duration) || 30;
        state.bidHistory = [];
        state.lastBidTime = new Date();
        await state.save();

        const fullState = await getFullAuctionState();
        io.emit('auction:player_started', { player, auctionState: fullState });
        io.emit('auction:state_update', fullState);
      } catch (err) {
        console.error('Admin start auction error:', err);
      }
    });

    // Admin triggers instant hammer / sell
    socket.on('admin:sell_now', async () => {
      try {
        const state = await AuctionState.findOne();
        if (state && state.status === 'live' && state.highestBidderManager) {
          await finalizeSale(state);
        }
      } catch (err) {
        console.error('Admin sell error:', err);
      }
    });

    // Admin triggers unsold
    socket.on('admin:unsold_now', async () => {
      try {
        const state = await AuctionState.findOne();
        if (state && (state.status === 'live' || state.status === 'paused')) {
          await finalizeUnsold(state);
        }
      } catch (err) {
        console.error('Admin unsold error:', err);
      }
    });

    // Admin pause / resume
    socket.on('admin:toggle_pause', async () => {
      try {
        const state = await AuctionState.findOne();
        if (state) {
          state.status = state.status === 'live' ? 'paused' : state.status === 'paused' ? 'live' : state.status;
          await state.save();
          const fullState = await getFullAuctionState();
          io.emit('auction:state_update', fullState);
        }
      } catch (err) {
        console.error('Admin toggle pause error:', err);
      }
    });

    // Admin add time / reset timer
    socket.on('admin:add_time', async (data) => {
      try {
        const { seconds = 15 } = data || {};
        const state = await AuctionState.findOne();
        if (state && state.status === 'live') {
          state.timer = Math.min(120, state.timer + Number(seconds));
          await state.save();
          io.emit('auction:tick', { timer: state.timer, status: state.status });
        }
      } catch (err) {
        console.error('Admin add time error:', err);
      }
    });

    // Admin reset entire auction state to idle
    socket.on('admin:reset_auction', async () => {
      try {
        let state = await AuctionState.findOne();
        if (state) {
          if (state.currentPlayer) {
            await Player.findByIdAndUpdate(state.currentPlayer, { status: 'available' });
          }
          state.status = 'idle';
          state.currentPlayer = null;
          state.currentBid = 0;
          state.highestBidderManager = null;
          state.highestBidderTeam = null;
          state.highestBidderName = '';
          state.highestBidderTeamName = '';
          state.timer = 30;
          state.bidHistory = [];
          await state.save();
          const fullState = await getFullAuctionState();
          io.emit('auction:state_update', fullState);
        }
      } catch (err) {
        console.error('Admin reset auction error:', err);
      }
    });
  });

  // Start background synchronized clock
  startTimerLoop();

  server.listen(port, () => {
    console.log(`> ⚽ Football Play Bid System ready on http://${hostname}:${port}`);
  });
});
