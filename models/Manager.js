import mongoose from 'mongoose';

const ManagerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Manager name is required'],
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    budget: {
      type: Number,
      default: 150000000, // $150M default budget
      min: 0,
    },
    initialBudget: {
      type: Number,
      default: 150000000,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Manager || mongoose.model('Manager', ManagerSchema);
