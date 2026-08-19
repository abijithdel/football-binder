import mongoose from 'mongoose';

const AuctionStateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['idle', 'live', 'paused', 'sold', 'unsold'],
      default: 'idle',
    },
    currentPlayer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    currentBid: {
      type: Number,
      default: 0,
    },
    highestBidderManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    highestBidderTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    highestBidderName: {
      type: String,
      default: '',
    },
    highestBidderTeamName: {
      type: String,
      default: '',
    },
    timer: {
      type: Number,
      default: 30, // 30 seconds default countdown
    },
    timerDuration: {
      type: Number,
      default: 30,
    },
    bidHistory: [
      {
        managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
        managerName: String,
        managerPhoto: String,
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        teamName: String,
        teamIcon: String,
        amount: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastBidTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AuctionState || mongoose.model('AuctionState', AuctionStateSchema);
