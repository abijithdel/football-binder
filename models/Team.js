import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '🛡️',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
    },
    budgetSpent: {
      type: Number,
      default: 0,
    },
    playersWon: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);
