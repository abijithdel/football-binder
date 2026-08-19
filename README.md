# ⚽ Football Play Bid System

A real-time Football Player Bidding & Live Auction platform built with **Next.js**, **MongoDB (Mongoose)**, and **Socket.io** styled in an ultra-modern **Monochrome Black & White** luxury aesthetic.

---

## 🌟 Key Features

### 1. 👑 Administrator Role (`admin`)
- **Add & Manage Players**: Name, photo, position (`GK`, `DEF`, `MID`, `FWD`), base market value, OVR rating, and technical attributes (Pace, Shooting, Passing, Dribbling, Defending, Physical).
- **Add & Manage Managers**: Name, photo, secure credentials, and custom starting transfer budgets.
- **Add & Manage Teams**: Team name and custom emblem / icon.
- **Assign Manager to Team**: Link managers directly to clubs.
- **Live Auction Command Console**:
  - Select any available superstar from the player pool.
  - Set custom countdown timer durations (20s, 30s, 45s, 60s).
  - Launch live bidding sessions.
  - Hammer Down / Instant Sell to highest bidder.
  - Mark Unsold / Pass.
  - Pause / Resume Live Timer and add emergency time (+15s).
- **Zero Public Signups**: Public self-registration is locked down. Only administrators can provision manager accounts.
- **One-Click Seeder**: Built-in seeding of Premier & European superstars (Mbappé, Haaland, Bellingham, Vinícius, Rodri, De Bruyne, Van Dijk, etc.).

### 2. ⚡ Manager Role (`manager`)
- **Live Auction Arena**:
  - Live player card with high-definition visuals, positions, and skill breakdown.
  - Real-time animated bid ticker with synchronized countdown timer.
  - Quick Bid buttons (`+$1.0M`, `+$5.0M`, `+$10.0M`, `+$25.0M`) and custom valuation entry.
  - Strict financial validation (ensures bids never exceed remaining club budget).
  - Live bid activity stream with timestamps, manager avatars, and team badges.
  - Real-time winning celebrations with confetti and audio chimes.
- **Club Management & Roster**:
  - Live remaining transfer budget tracking.
  - Real-time squad list with acquired players and purchase prices.

### 3. 🏆 Public Showcase
- **Squads & Leaderboard**: Compare all clubs, managers, total spent, and acquired squads.
- **Players Pool Marketplace**: Search and filter players by position and status (Available, In Auction, Sold, Unsold).

---

## 🔐 Demo Credentials

| Role | Email | Password | Assigned Club / Privileges |
|---|---|---|---|
| **Admin** | `admin@football.com` | `admin123` | Commissioner / Full Control |
| **Manager** | `pep@city.com` | `manager123` | Manchester Titans ($150M Budget) |
| **Manager** | `carlo@madrid.com` | `manager123` | Real Galacticos ($150M Budget) |
| **Manager** | `arteta@arsenal.com` | `manager123` | London Cannons ($150M Budget) |
| **Manager** | `xabi@stars.com` | `manager123` | Black & White Stars ($150M Budget) |

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unified Next.js + Socket.IO server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## 🛠️ Tech Stack
- **Framework**: Next.js (Custom Node HTTP server)
- **Real-Time Engine**: Socket.io Server & Client
- **Database**: MongoDB with Mongoose ODM (Zero-config embedded mode fallback included)
- **Authentication**: JWT & Cookies with role-based route guards
- **Styling**: Tailored Modern Luxury Monochrome (Black & White, glassmorphism, responsive)
