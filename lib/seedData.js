import connectDB from './mongodb.js';
import User from '../models/User.js';
import Manager from '../models/Manager.js';
import Team from '../models/Team.js';
import Player from '../models/Player.js';
import AuctionState from '../models/AuctionState.js';
import { hashPassword } from './auth.js';

export const INITIAL_PLAYERS = [
  {
    name: 'Kylian Mbappé',
    photo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80',
    position: 'FWD',
    value: 120,
    currentValue: 120,
    rating: 92,
    nationality: 'France',
    age: 26,
    stats: { pace: 97, shooting: 90, passing: 82, dribbling: 93, defending: 38, physical: 78 },
    status: 'available',
  },
  {
    name: 'Erling Haaland',
    photo: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=600&auto=format&fit=crop&q=80',
    position: 'FWD',
    value: 110,
    currentValue: 110,
    rating: 91,
    nationality: 'Norway',
    age: 24,
    stats: { pace: 89, shooting: 94, passing: 68, dribbling: 81, defending: 45, physical: 88 },
    status: 'available',
  },
  {
    name: 'Jude Bellingham',
    photo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    position: 'MID',
    value: 100,
    currentValue: 100,
    rating: 90,
    nationality: 'England',
    age: 21,
    stats: { pace: 82, shooting: 86, passing: 86, dribbling: 88, defending: 79, physical: 84 },
    status: 'available',
  },
  {
    name: 'Vinícius Júnior',
    photo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&auto=format&fit=crop&q=80',
    position: 'FWD',
    value: 100,
    currentValue: 100,
    rating: 90,
    nationality: 'Brazil',
    age: 24,
    stats: { pace: 96, shooting: 84, passing: 81, dribbling: 92, defending: 32, physical: 70 },
    status: 'available',
  },
  {
    name: 'Rodri',
    photo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
    position: 'MID',
    value: 95,
    currentValue: 95,
    rating: 91,
    nationality: 'Spain',
    age: 28,
    stats: { pace: 66, shooting: 80, passing: 87, dribbling: 83, defending: 88, physical: 85 },
    status: 'available',
  },
  {
    name: 'Kevin De Bruyne',
    photo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=80',
    position: 'MID',
    value: 85,
    currentValue: 85,
    rating: 90,
    nationality: 'Belgium',
    age: 33,
    stats: { pace: 72, shooting: 87, passing: 94, dribbling: 87, defending: 65, physical: 74 },
    status: 'available',
  },
  {
    name: 'Bukayo Saka',
    photo: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&auto=format&fit=crop&q=80',
    position: 'FWD',
    value: 90,
    currentValue: 90,
    rating: 88,
    nationality: 'England',
    age: 23,
    stats: { pace: 88, shooting: 84, passing: 84, dribbling: 89, defending: 65, physical: 76 },
    status: 'available',
  },
  {
    name: 'Virgil van Dijk',
    photo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&auto=format&fit=crop&q=80',
    position: 'DEF',
    value: 75,
    currentValue: 75,
    rating: 89,
    nationality: 'Netherlands',
    age: 33,
    stats: { pace: 78, shooting: 60, passing: 72, dribbling: 72, defending: 90, physical: 87 },
    status: 'available',
  },
  {
    name: 'William Saliba',
    photo: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=600&auto=format&fit=crop&q=80',
    position: 'DEF',
    value: 70,
    currentValue: 70,
    rating: 87,
    nationality: 'France',
    age: 23,
    stats: { pace: 83, shooting: 40, passing: 71, dribbling: 74, defending: 88, physical: 84 },
    status: 'available',
  },
  {
    name: 'Alisson Becker',
    photo: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&auto=format&fit=crop&q=80',
    position: 'GK',
    value: 60,
    currentValue: 60,
    rating: 89,
    nationality: 'Brazil',
    age: 31,
    stats: { pace: 86, shooting: 85, passing: 87, dribbling: 89, defending: 55, physical: 90 },
    status: 'available',
  },
  {
    name: 'Thibaut Courtois',
    photo: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
    position: 'GK',
    value: 55,
    currentValue: 55,
    rating: 89,
    nationality: 'Belgium',
    age: 32,
    stats: { pace: 85, shooting: 88, passing: 78, dribbling: 88, defending: 48, physical: 89 },
    status: 'available',
  },
  {
    name: 'Phil Foden',
    photo: 'https://images.unsplash.com/photo-1570498839593-e565b3d7f672?w=600&auto=format&fit=crop&q=80',
    position: 'MID',
    value: 85,
    currentValue: 85,
    rating: 88,
    nationality: 'England',
    age: 24,
    stats: { pace: 86, shooting: 86, passing: 85, dribbling: 90, defending: 58, physical: 65 },
    status: 'available',
  },
  {
    name: 'Jamal Musiala',
    photo: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&auto=format&fit=crop&q=80',
    position: 'MID',
    value: 85,
    currentValue: 85,
    rating: 87,
    nationality: 'Germany',
    age: 22,
    stats: { pace: 87, shooting: 81, passing: 80, dribbling: 93, defending: 64, physical: 68 },
    status: 'available',
  },
  {
    name: 'Alphonso Davies',
    photo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    position: 'DEF',
    value: 65,
    currentValue: 65,
    rating: 85,
    nationality: 'Canada',
    age: 24,
    stats: { pace: 95, shooting: 68, passing: 78, dribbling: 85, defending: 78, physical: 77 },
    status: 'available',
  },
  {
    name: 'Harry Kane',
    photo: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=600&auto=format&fit=crop&q=80',
    position: 'FWD',
    value: 95,
    currentValue: 95,
    rating: 90,
    nationality: 'England',
    age: 31,
    stats: { pace: 68, shooting: 93, passing: 85, dribbling: 82, defending: 50, physical: 83 },
    status: 'available',
  },
  {
    name: 'Ruben Dias',
    photo: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    position: 'DEF',
    value: 70,
    currentValue: 70,
    rating: 88,
    nationality: 'Portugal',
    age: 27,
    stats: { pace: 67, shooting: 39, passing: 70, dribbling: 69, defending: 89, physical: 87 },
    status: 'available',
  },
];

export async function seedDatabase(force = false) {
  await connectDB();

  const userCount = await User.countDocuments();
  if (userCount > 0 && !force) {
    console.log('Database already seeded.');
    return { success: true, message: 'Database already populated' };
  }

  // Clear existing collections if force
  if (force) {
    await User.deleteMany({});
    await Manager.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await AuctionState.deleteMany({});
  }

  // 1. Create Admin
  const adminHashedPassword = await hashPassword('admin123');
  const adminUser = await User.create({
    name: 'Auction Commissioner',
    email: 'admin@football.com',
    password: adminHashedPassword,
    role: 'admin',
  });

  // 2. Create Teams
  const teamsData = [
    { name: 'Manchester Titans', icon: '⚡' },
    { name: 'Real Galacticos', icon: '👑' },
    { name: 'London Cannons', icon: '🎯' },
    { name: 'Black & White Stars', icon: '⚽' },
  ];
  const teams = await Team.insertMany(teamsData);

  // 3. Create Managers and assign to Teams
  const managerPassword = await hashPassword('manager123');
  const managersData = [
    {
      name: 'Pep Guardiola',
      email: 'pep@city.com',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      team: teams[0]._id,
      budget: 1000,
      initialBudget: 1000,
    },
    {
      name: 'Carlo Ancelotti',
      email: 'carlo@madrid.com',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      team: teams[1]._id,
      budget: 1000,
      initialBudget: 1000,
    },
    {
      name: 'Mikel Arteta',
      email: 'arteta@arsenal.com',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      team: teams[2]._id,
      budget: 1000,
      initialBudget: 1000,
    },
    {
      name: 'Xabi Alonso',
      email: 'xabi@stars.com',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      team: teams[3]._id,
      budget: 1000,
      initialBudget: 1000,
    },
  ];

  for (let i = 0; i < managersData.length; i++) {
    const m = managersData[i];
    const user = await User.create({
      name: m.name,
      email: m.email,
      password: managerPassword,
      role: 'manager',
    });

    const manager = await Manager.create({
      name: m.name,
      photo: m.photo,
      user: user._id,
      team: m.team,
      budget: m.budget,
      initialBudget: m.initialBudget,
    });

    user.managerProfile = manager._id;
    await user.save();

    // Link team back to manager
    await Team.findByIdAndUpdate(m.team, { manager: manager._id });
  }

  // 4. Seed Players
  const players = await Player.insertMany(INITIAL_PLAYERS);

  // 5. Initialize Auction State
  await AuctionState.create({
    status: 'idle',
    currentPlayer: null,
    currentBid: 0,
    highestBidderManager: null,
    highestBidderTeam: null,
    timer: 30,
    timerDuration: 30,
    bidHistory: [],
  });

  console.log('✅ Football Player Live Bidding Database Seeded Successfully!');
  return {
    success: true,
    message: 'Database initialized with 1 Admin, 4 Managers & Teams, and 16 Players',
    admin: 'admin@football.com / admin123',
    manager: 'pep@city.com / manager123 (and carlo@madrid.com, arteta@arsenal.com, xabi@stars.com)',
  };
}
