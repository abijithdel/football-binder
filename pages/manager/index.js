import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../../context/AppContext';
import {
  Trophy,
  Shield,
  Timer,
  DollarSign,
  TrendingUp,
  Flame,
  Users,
  AlertCircle,
  Award,
  ArrowUpRight,
  UserCheck,
  CheckCircle,
  Radio,
} from 'lucide-react';

export default function ManagerDashboard() {
  const router = useRouter();
  const {
    user,
    loadingUser,
    auctionState,
    timer,
    placeBid,
    bidError,
    lastBidNotification,
  } = useApp();

  const [customBid, setCustomBid] = useState('');
  const [teamData, setTeamData] = useState(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  useEffect(() => {
    if (!loadingUser) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loadingUser, router]);

  // Fetch full team data with populated squad for the logged-in manager
  const fetchMyTeam = async () => {
    if (!user?.managerProfile?.team?._id) return;
    try {
      setLoadingTeam(true);
      const res = await fetch(`/api/teams/${user.managerProfile.team._id}`);
      const data = await res.json();
      if (data.team) {
        setTeamData(data.team);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (user?.managerProfile?.team?._id) {
      fetchMyTeam();
    }
  }, [user, auctionState?.status]);

  const isLive = auctionState?.status === 'live';
  const isPaused = auctionState?.status === 'paused';
  const isSold = auctionState?.status === 'sold';
  const isUnsold = auctionState?.status === 'unsold';

  const currentPlayer = auctionState?.currentPlayer;
  const currentBid = auctionState?.currentBid || currentPlayer?.value || 0;
  const [managerBudget, setManagerBudget] = useState(1000);
  const isHighestBidder = auctionState?.highestBidderManager?._id === user?.managerProfile?._id;
  const [bindInput, setBindInput] = useState('150');

  useEffect(() => {
    if (user?.managerProfile?.budget !== undefined) {
      setManagerBudget(user.managerProfile.budget);
    }
  }, [user?.managerProfile?.budget]);

  useEffect(() => {
    const currentVal = currentBid > 0 ? currentBid : (currentPlayer?.value ? currentPlayer.value : 100);
    setBindInput(String(currentVal + 50));
  }, [currentBid, currentPlayer]);

  const formatMoney = (val) => {
    if (!val && val !== 0) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const handleAddAmount = (addVal) => {
    setBindInput((prev) => {
      const base = Number(prev) > 0 ? Number(prev) : (currentBid || 100);
      return String(base + addVal);
    });
  };

  const handleExecuteBind = (e) => {
    if (e) e.preventDefault();
    const finalVal = Number(bindInput);
    if (finalVal > managerBudget) {
      return;
    }
    if (finalVal > 0) {
      // Immediately minus the manager budget
      setManagerBudget((prev) => Math.max(0, prev - finalVal));
      placeBid(finalVal);
    }
  };

  if (loadingUser || !user) {
    return <div className="p-16 text-center text-zinc-500 font-mono">Loading Manager Console...</div>;
  }

  return (
    <div className="container py-8">
      {/* Top Manager Club Header */}
      <div className="glass-panel p-6 sm:p-7 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Manager & Team Details */}
          <div className="flex items-center gap-4">
            <img
              src={user.managerProfile?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-pos text-[10px]">HEAD COACH & MANAGER</span>
                {isLive && (
                  <span className="badge badge-live text-[10px]">
                    <span className="pulse-dot" /> LIVE AUCTION ACTIVE
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {user.name}
              </h1>
              <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="text-lg">{user.managerProfile?.team?.icon || '🛡️'}</span>
                <span className="font-bold text-white">{user.managerProfile?.team?.name || 'Independent Club'}</span>
              </div>
            </div>
          </div>

          {/* Budget & Squad Highlights */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-white/15 text-left min-w-[140px]">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Available Transfer Funds</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {formatMoney(managerBudget)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-white/15 text-left min-w-[120px]">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Squad Signings</div>
              <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                {teamData?.playersWon?.length || 0} Players
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications & Error Alerts */}
      {bidError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{bidError}</span>
        </div>
      )}

      {lastBidNotification && (
        <div className="mb-6 p-4 rounded-2xl bg-zinc-900 border border-white/20 shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">{lastBidNotification.highestBidder?.teamIcon || '⚡'}</span>
            <div>
              <span className="text-xs text-zinc-400 font-mono">LIVE BID UPDATE:</span>{' '}
              <strong className="text-white">{lastBidNotification.highestBidder?.managerName}</strong>{' '}
              <span className="text-zinc-400 font-mono">({lastBidNotification.highestBidder?.teamName})</span>
            </div>
          </div>
          <div className="text-base font-extrabold text-white font-mono bg-white/10 px-3 py-1 rounded-xl">
            {formatMoney(lastBidNotification.currentBid)}
          </div>
        </div>
      )}

      {/* Main Grid: Live Bidding Arena on Left + Squad Roster on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT STAGE: Live Auction Card & Bidding Pad */}
        <div className="lg:col-span-7 space-y-6">
          {currentPlayer && (isLive || isPaused || isSold || isUnsold) ? (
            <div className={`fifa-card p-6 sm:p-8 relative overflow-hidden ${isLive ? 'fifa-card-active' : ''}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="badge badge-pos text-xs px-3 py-1">{currentPlayer.position}</span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {currentPlayer.nationality} • Age {currentPlayer.age || 24}
                  </span>
                </div>

                {isLive && (
                  <span className="badge badge-live px-3 py-1">
                    <span className="pulse-dot" /> LIVE IN AUCTION
                  </span>
                )}
                {isSold && <span className="badge badge-sold px-3 py-1">AUCTION CONCLUDED</span>}
              </div>

              {/* Player Showcase */}
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-40 h-48 sm:w-48 sm:h-56 rounded-2xl overflow-hidden bg-zinc-900 border border-white/20 shadow-2xl relative">
                    <img src={currentPlayer.photo} alt={currentPlayer.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-12 h-12 rounded-xl bg-white text-black font-mono font-black text-xl flex items-center justify-center shadow-lg border border-white">
                    {currentPlayer.rating || 88}
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-3 w-full">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono leading-none mb-1">
                      {currentPlayer.name}
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono">
                      Base Valuation: <span className="text-zinc-200">{formatMoney(currentPlayer.value)}</span>
                    </p>
                  </div>

                  {/* Timer Bar */}
                  {(isLive || isPaused) && (
                    <div className="p-4 rounded-xl bg-zinc-950/90 border border-white/15">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                          <Timer className="w-4 h-4 text-zinc-300" /> Auction Hammer Countdown
                        </span>
                        <span className={`font-mono text-2xl font-black ${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                          {timer}s
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${timer <= 5 ? 'bg-red-500' : 'bg-white'}`}
                          style={{ width: `${Math.min(100, (timer / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Highest Bidder Status */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isHighestBidder
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                      : 'bg-white/5 border-white/10 text-zinc-300'
                  }`}>
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-mono text-zinc-400">Current Highest Bidder:</div>
                      <div className="text-sm font-bold font-mono text-white flex items-center gap-1.5">
                        <span>{auctionState.highestBidderTeamName || 'Base Valuation'}</span>
                        {isHighestBidder && <span className="badge badge-live text-[9px]">YOU ARE LEADING</span>}
                      </div>
                    </div>
                    <div className="text-right font-mono font-black text-xl text-white">
                      {formatMoney(currentBid)}
                    </div>
                  </div>

                  {/* If Sold: Winner Showcase */}
                  {isSold && (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 via-zinc-900 to-black border-2 border-amber-400/60 shadow-lg space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-400/20 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl animate-bounce">🏆</span>
                          <span className="text-xs font-black text-amber-300 font-mono uppercase tracking-wider">
                            AUCTION CONCLUDED & BOUND
                          </span>
                        </div>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {formatMoney(currentBid)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                        {/* Player */}
                        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center gap-2.5">
                          <div className="w-10 h-12 rounded-lg overflow-hidden bg-zinc-900 border border-white/20 flex-shrink-0">
                            <img
                              src={currentPlayer?.photo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400'}
                              alt={currentPlayer?.name || 'Player'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-[9px] text-amber-400 font-mono font-bold uppercase">Transferred Player</div>
                            <div className="text-xs font-bold text-white font-mono truncate">{currentPlayer?.name}</div>
                            <div className="text-[9px] text-zinc-400 font-mono">{currentPlayer?.position} • {currentPlayer?.rating} OVR</div>
                          </div>
                        </div>

                        {/* Winner Manager & Club */}
                        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center gap-2.5">
                          <div className="w-10 h-12 rounded-lg overflow-hidden bg-zinc-900 border border-white/20 flex-shrink-0 flex items-center justify-center text-lg">
                            {auctionState?.highestBidderManager?.photo ? (
                              <img
                                src={auctionState.highestBidderManager.photo}
                                alt="Manager"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{auctionState?.highestBidderTeam?.icon || '👑'}</span>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-[9px] text-emerald-400 font-mono font-bold uppercase">Winning Manager</div>
                            <div className="text-xs font-bold text-white font-mono truncate">
                              {auctionState?.highestBidderManager?.name ||
                                auctionState?.highestBidderManagerName ||
                                auctionState?.highestBidderName ||
                                'Manager'}
                            </div>
                            <div className="text-[9px] text-zinc-300 font-mono truncate">
                              {auctionState?.highestBidderTeam?.icon} {auctionState?.highestBidderTeam?.name || auctionState?.highestBidderTeamName || 'Independent'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Manager Bid Controls Pad */}
              {isLive && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Your Remaining Budget: <strong className="text-white">{formatMoney(managerBudget)}</strong></span>
                    <span className="text-emerald-400 font-bold">● FAST BIDDING ACTIVE</span>
                  </div>

                  {/* 2 Options: 50 and 100 Tap to Add to Input System */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Option 1: 50 */}
                    <button
                      type="button"
                      onClick={() => handleAddAmount(50)}
                      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-white/20 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex flex-col items-center justify-center gap-1 group active:scale-95 cursor-pointer select-none"
                      title="Add +50 to the bind input box"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-125 transition-transform" />
                        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight group-hover:text-cyan-300">
                          +50
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">Press to Add +50</span>
                    </button>

                    {/* Option 2: 100 */}
                    <button
                      type="button"
                      onClick={() => handleAddAmount(100)}
                      className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-white/20 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex flex-col items-center justify-center gap-1 group active:scale-95 cursor-pointer select-none"
                      title="Add +100 to the bind input box"
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-400 group-hover:scale-125 transition-transform" />
                        <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight group-hover:text-amber-300">
                          +100
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">Press to Add +100</span>
                    </button>
                  </div>

                  {/* Text Input Box & Action BIND Button */}
                  <form onSubmit={handleExecuteBind} className="space-y-3">
                    <div className="text-[11px] text-zinc-400 font-mono flex items-center justify-between">
                      <span>Bind Amount (in ₹):</span>
                      <span className="text-cyan-300 font-bold font-mono">Current: {formatMoney(currentBid)}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="1"
                          placeholder="Enter or tap amount above..."
                          value={bindInput}
                          onChange={(e) => setBindInput(e.target.value)}
                          className={`input-field pl-8 text-base py-3 font-mono font-bold text-white bg-black/60 border-2 rounded-xl w-full transition-colors ${
                            Number(bindInput) > managerBudget
                              ? 'border-red-500/80 focus:border-red-400'
                              : 'border-white/25 focus:border-cyan-400'
                          }`}
                        />
                        <span className="font-mono text-zinc-400 absolute left-3 top-3 font-black text-base">₹</span>
                      </div>
                      <button
                        type="submit"
                        disabled={!bindInput || Number(bindInput) <= 0 || Number(bindInput) > managerBudget}
                        className={`btn py-3 px-6 font-mono font-black text-sm tracking-wider flex items-center gap-2 border-none rounded-xl active:scale-95 transition-all ${
                          Number(bindInput) > managerBudget
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                            : 'btn-primary bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current" /> BIND NOW
                      </button>
                    </div>
                    {Number(bindInput) > managerBudget && (
                      <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2 animate-pulse">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>
                          Cannot Bind! Amount (₹{Number(bindInput).toLocaleString('en-IN')}) exceeds available funds (₹{managerBudget.toLocaleString('en-IN')}).
                        </span>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/20 flex items-center justify-center text-3xl mx-auto mb-4">
                ⚽
              </div>
              <h3 className="text-xl font-bold font-mono text-white mb-2">
                AUCTION ARENA STANDBY
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
                Waiting for the Commissioner to bring the next player to the bidding block. Keep your budget ready!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
                <span className="pulse-dot" /> Connected to Live Auction Feed
              </div>
            </div>
          )}

          {/* Live Bid Stream Log */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Flame className="w-4 h-4 text-white" /> Live Bid Stream
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {auctionState?.bidHistory?.length || 0} updates
              </span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {!auctionState?.bidHistory || auctionState.bidHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 font-mono">
                  No bids recorded for this session yet.
                </div>
              ) : (
                auctionState.bidHistory.map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      idx === 0 ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/5 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/15 flex items-center justify-center text-sm font-bold">
                        {b.teamIcon || '⚽'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{b.managerName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{b.teamName}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-extrabold text-white">
                        {formatMoney(b.amount)}
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT STAGE: My Club Squad & Won Players */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white" />
                My Club Squad ({teamData?.playersWon?.length || 0})
              </h3>
              <Link href="/squads" className="text-xs text-zinc-400 hover:text-white font-mono">
                View All Squads →
              </Link>
            </div>

            {!teamData?.playersWon || teamData.playersWon.length === 0 ? (
              <div className="p-8 rounded-xl bg-zinc-950 border border-white/10 text-center text-xs text-zinc-500 font-mono">
                You have not won any players yet. Bid when players appear on the live block!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {teamData.playersWon.map((p) => (
                  <div key={p._id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={p.photo} alt={p.name} className="w-11 h-11 rounded-xl object-cover border border-white/15" />
                      <div>
                        <div className="text-xs font-bold text-white font-mono">{p.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {p.nationality} • Age {p.age || 24}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="badge badge-pos text-[10px] px-2 py-0.5 mb-0.5 inline-block">
                        {p.position} • {p.rating}
                      </span>
                      <div className="text-xs font-bold text-emerald-400">
                        {formatMoney(p.soldPrice || p.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-panel p-5 space-y-3">
            <div className="text-xs uppercase font-mono text-zinc-400 font-bold">Quick Navigation</div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/players" className="btn btn-secondary text-xs py-2 font-mono">
                Player Pool
              </Link>
              <Link href="/squads" className="btn btn-secondary text-xs py-2 font-mono">
                All Squads
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
