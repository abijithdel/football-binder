import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
    },
    photo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
    },
    position: {
      type: String,
      enum: ['GK', 'DEF', 'MID', 'FWD'],
      required: [true, 'Position is required'],
    },
    value: {
      type: Number,
      required: [true, 'Base value is required'],
      default: 10000000, // $10M default base
    },
    currentValue: {
      type: Number,
      default: 10000000,
    },
    rating: {
      type: Number,
      default: 85,
      min: 50,
      max: 99,
    },
    nationality: {
      type: String,
      default: 'International',
    },
    age: {
      type: Number,
      default: 25,
    },
    stats: {
      pace: { type: Number, default: 80 },
      shooting: { type: Number, default: 75 },
      passing: { type: Number, default: 82 },
      dribbling: { type: Number, default: 84 },
      defending: { type: Number, default: 70 },
      physical: { type: Number, default: 78 },
    },
    status: {
      type: String,
      enum: ['available', 'in_auction', 'sold', 'unsold'],
      default: 'available',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      default: null,
    },
    soldPrice: {
      type: Number,
      default: null,
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
  },
  { timestamps: true }
);

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema);
