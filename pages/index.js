import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Timer,
  TrendingUp,
  Shield,
  Zap,
  Users,
  ChevronRight,
  AlertCircle,
  Play,
  Award,
  DollarSign,
  ArrowUpRight,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function LiveArenaPage() {
  const {
    user,
    auctionState,
    timer,
    placeBid,
    bidError,
    lastBidNotification,
    startAuction,
    sellNow,
    unsoldNow,
    togglePause,
    addTime,
  } = useApp();

  const [bindInput, setBindInput] = useState('150');
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayerToStart, setSelectedPlayerToStart] = useState('');

  const isLive = auctionState?.status === 'live';
  const isPaused = auctionState?.status === 'paused';
  const isSold = auctionState?.status === 'sold';
  const isUnsold = auctionState?.status === 'unsold';
  const isIdle = !isLive && !isPaused;

  const currentPlayer = auctionState?.currentPlayer;
  const currentBid = auctionState?.currentBid || currentPlayer?.value || 0;
  const [managerBudget, setManagerBudget] = useState(1000);
  const isManager = user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  // Sync managerBudget from logged in manager or live auction state
  useEffect(() => {
    if (user?.managerProfile?.budget !== undefined) {
      setManagerBudget(user.managerProfile.budget);
    } else if (auctionState?.highestBidderManager?.budget !== undefined) {
      setManagerBudget(auctionState.highestBidderManager.budget);
    }
  }, [user?.managerProfile?.budget, auctionState?.highestBidderManager?.budget]);

  // Sync bindInput whenever currentBid or currentPlayer updates
  useEffect(() => {
    const currentVal = currentBid > 0 ? currentBid : (currentPlayer?.value ? currentPlayer.value : 100);
    setBindInput(String(currentVal + 50));
  }, [currentBid, currentPlayer]);

  // Fetch available players for quick starting (admin)
  useEffect(() => {
    fetch('/api/players?status=available')
      .then((res) => res.json())
      .then((data) => {
        if (data.players) {
          setAvailablePlayers(data.players);
          if (data.players.length > 0 && !selectedPlayerToStart) {
            setSelectedPlayerToStart(data.players[0]._id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [auctionState?.status]);

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
      placeBid(finalVal);
    }
  };

  return (
    <div className="container py-6 sm:py-10">
      {/* Top Banner Alert / Status */}
      {lastBidNotification && (
        <div className="mb-6 p-4 rounded-2xl bg-zinc-900/90 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-xl">{lastBidNotification.highestBidder?.teamIcon || '⚡'}</span>
            <div>
              <span className="text-xs text-zinc-400 font-mono">NEW HIGHEST BID:</span>{' '}
              <strong className="text-white">{lastBidNotification.highestBidder?.managerName}</strong>{' '}
              <span className="text-zinc-400 font-mono">({lastBidNotification.highestBidder?.teamName})</span>
            </div>
          </div>
          <div className="text-base font-extrabold text-white font-mono bg-white/10 px-3 py-1 rounded-xl">
            {formatMoney(lastBidNotification.currentBid)}
          </div>
        </div>
      )}

      {bidError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{bidError}</span>
        </div>
      )}

      {/* Main Grid: Left Stage (Player & Auction) + Right Stage (Bidding & Live Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: Player Presentation & Live Gauge */}
        <div className="lg:col-span-7 space-y-6">
          {currentPlayer && (isLive || isPaused || isSold || isUnsold) ? (
            <div
              className={`fifa-card p-6 sm:p-8 relative overflow-hidden ${
                isLive ? 'fifa-card-active' : ''
              }`}
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="badge badge-pos text-sm px-3 py-1">
                    {currentPlayer.position}
                  </span>
                  <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
                    {currentPlayer.nationality} • Age {currentPlayer.age || 25}
                  </span>
                </div>

                {isLive && (
                  <div className="flex items-center gap-2">
                    <span className="badge badge-live px-3 py-1">
                      <span className="pulse-dot" /> LIVE IN AUCTION
                    </span>
                  </div>
                )}
                {isPaused && <span className="badge badge-idle px-3 py-1">PAUSED</span>}
                {isSold && <span className="badge badge-sold px-3 py-1">SOLD</span>}
                {isUnsold && <span className="badge badge-idle px-3 py-1">UNSOLD / PASSED</span>}
              </div>

              {/* Player Hero Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Player Photo with Rating Badge */}
                <div className="relative group flex-shrink-0">
                  <div className="w-40 h-48 sm:w-48 sm:h-56 rounded-2xl overflow-hidden bg-zinc-900 border border-white/20 shadow-2xl relative">
                    <img
                      src={currentPlayer.photo}
                      alt={currentPlayer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute -top-3 -left-3 w-12 h-12 rounded-xl bg-white text-black font-mono font-black text-xl flex items-center justify-center shadow-lg border border-white">
                    {currentPlayer.rating || 88}
                  </div>
                </div>

                {/* Player Info & Live Timer */}
                <div className="flex-1 text-center sm:text-left space-y-3 w-full">
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mb-1 font-mono">
                      {currentPlayer.name}
                    </h1>
                    <p className="text-xs text-zinc-400 font-mono">
                      Base Valuation: <span className="text-zinc-200">{formatMoney(currentPlayer.value)}</span>
                    </p>
                  </div>

                  {/* Live Timer Countdown */}
                  {(isLive || isPaused) && (
                    <div className="p-4 rounded-xl bg-zinc-950/90 border border-white/15">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                          <Timer className="w-4 h-4 text-zinc-300" /> Auction Hammer Timer
                        </span>
                        <span
                          className={`font-mono text-2xl font-black ${
                            timer <= 5 ? 'text-red-400 animate-pulse' : 'text-white'
                          }`}
                        >
                          {timer}s
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            timer <= 5 ? 'bg-red-500' : 'bg-white'
                          }`}
                          style={{ width: `${Math.min(100, (timer / 30) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* If Sold Banner */}
                  {isSold && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-600/20 border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-12 h-12 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-2xl shadow-lg flex-shrink-0">
                          🏆
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-300">
                            WINNING MANAGER & SQUAD:
                          </div>
                          <div className="text-lg sm:text-xl font-black text-white font-mono leading-tight">
                            {auctionState.highestBidderName || 'Winning Manager'}
                          </div>
                          <div className="text-xs text-zinc-300 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>{auctionState.highestBidderTeam?.icon || '🛡️'}</span>
                            <span>{auctionState.highestBidderTeamName || 'Winning Team'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center sm:text-right font-mono bg-black/40 px-4 py-2 rounded-xl border border-amber-400/30">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">FINAL BOUND PRICE</div>
                        <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                          {formatMoney(auctionState.currentBid || currentPlayer?.soldPrice || currentPlayer?.value)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Quick Action Bar inside Arena */}
              {isAdmin && (
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400 font-mono">Commissioner Controls:</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isLive && (
                      <>
                        <button onClick={sellNow} className="btn btn-primary btn-sm">
                          ⚡ Hammer / Sell Now
                        </button>
                        <button onClick={unsoldNow} className="btn btn-secondary btn-sm">
                          Pass / Unsold
                        </button>
                        <button onClick={togglePause} className="btn btn-secondary btn-sm">
                          Pause
                        </button>
                        <button onClick={() => addTime(15)} className="btn btn-secondary btn-sm">
                          +15s
                        </button>
                      </>
                    )}
                    {isPaused && (
                      <button onClick={togglePause} className="btn btn-primary btn-sm">
                        Resume Auction
                      </button>
                    )}
                    {(isUnsold || isSold) && (
                      <button
                        onClick={() => startAuction(currentPlayer._id, 30)}
                        className="btn btn-primary btn-sm flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Restart Auction on {currentPlayer.name}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standby / Idle Stadium Screen */
            <div className="glass-panel p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-white/20 text-3xl mb-4">
                ⚽
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono mb-2">
                AUCTION ARENA STANDBY
              </h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8">
                The bidding floor is currently waiting for the commissioner to present the next football star.
              </p>

              {isAdmin ? (
                <div className="p-6 rounded-2xl bg-zinc-950 border border-white/15 max-w-md mx-auto text-left">
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
                    Select Player to Start Live Auction:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedPlayerToStart}
                      onChange={(e) => setSelectedPlayerToStart(e.target.value)}
                      className="input-field py-2 text-sm flex-1"
                    >
                      {availablePlayers.length === 0 ? (
                        <option value="">No available players in pool</option>
                      ) : (
                        availablePlayers.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.position} - {formatMoney(p.value)})
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      onClick={() => selectedPlayerToStart && startAuction(selectedPlayerToStart, 30)}
                      disabled={!selectedPlayerToStart}
                      className="btn btn-primary btn-sm px-4 flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" /> Start
                    </button>
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
                  <span className="pulse-dot" /> Listening for Commissioner Stream...
                </div>
              )}
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-panel p-4 text-center">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Auction Status</div>
              <div className="text-sm font-bold text-white uppercase font-mono mt-0.5">
                {auctionState?.status || 'IDLE'}
              </div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Current Bid</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {formatMoney(currentBid)}
              </div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Total Bids Placed</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {auctionState?.bidHistory?.length || 0}
              </div>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Your Role</div>
              <div className="text-sm font-bold text-white uppercase font-mono mt-0.5">
                {user?.role || 'Guest / Observer'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Bidding Pad & Live Log Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current Bid Display Card */}
          <div className="glass-panel p-6 relative overflow-hidden">
            <div className="text-xs uppercase font-mono tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
              <span>Current Valuation</span>
              {isLive && (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> LIVE BIDDING
                </span>
              )}
            </div>

            {/* Massive Price Number */}
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight my-2">
              {formatMoney(currentBid)}
            </div>

            {/* Leading Bidder Banner */}
            <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-mono">Leading Bidder</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{auctionState?.highestBidderTeam?.icon || '🛡️'}</span>
                  <span>
                    {auctionState?.highestBidderManager?.name ||
                      auctionState?.highestBidderManagerName ||
                      auctionState?.highestBidderName ||
                      'No bids yet (Base Price)'}
                  </span>
                </div>
              </div>
              {(auctionState?.highestBidderTeam?.name || auctionState?.highestBidderTeamName) && (
                <span className="badge badge-sold text-xs">
                  {auctionState?.highestBidderTeam?.name || auctionState.highestBidderTeamName}
                </span>
              )}
            </div>

            {/* If Sold: Winner Showcase (Single Won Player + Winning Manager & Team) */}
            {isSold && (
              <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/70 via-zinc-900 to-black border-2 border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-4">
                <div className="flex items-center justify-between border-b border-amber-400/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl animate-bounce">🏆</span>
                    <div>
                      <span className="badge bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                        AUCTION WON & BOUND
                      </span>
                      <h3 className="text-sm font-extrabold text-white font-mono">
                        OFFICIAL PLAYER TRANSFER
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400 font-mono uppercase">Sold Valuation</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {formatMoney(auctionState?.currentBid)}
                    </div>
                  </div>
                </div>

                {/* Dual Showcase: Won Player & Winning Manager / Team */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* 1. Single Won Player */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-white/20 flex-shrink-0 relative">
                      <img
                        src={currentPlayer?.photo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400'}
                        alt={currentPlayer?.name || 'Player'}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 bg-white text-black text-[9px] font-black px-1 rounded-tl font-mono">
                        {currentPlayer?.rating || 88}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] text-amber-400 uppercase font-mono font-bold flex items-center gap-1">
                        <span>⚽ Player Transferred</span>
                      </div>
                      <div className="text-sm font-extrabold text-white font-mono truncate">
                        {currentPlayer?.name || 'Star Player'}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {currentPlayer?.position || 'FWD'} • {currentPlayer?.nationality || 'International'}
                      </div>
                    </div>
                  </div>

                  {/* 2. Winning Manager & Team */}
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-white/20 flex-shrink-0 flex items-center justify-center text-xl">
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
                      <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold flex items-center gap-1">
                        <span>
                          🛡️ SIGNED TO{' '}
                          {auctionState?.highestBidderManager?.name ||
                            auctionState?.highestBidderManagerName ||
                            auctionState?.highestBidderName ||
                            'MANAGER'}
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-white font-mono truncate">
                        {auctionState?.highestBidderManager?.name ||
                          auctionState?.highestBidderManagerName ||
                          auctionState?.highestBidderName ||
                          'Manager'}
                      </div>
                      <div className="text-[10px] text-zinc-300 font-mono flex items-center gap-1">
                        <span>{auctionState?.highestBidderTeam?.icon || '🛡️'}</span>
                        <span className="truncate">
                          {auctionState?.highestBidderTeam?.name ||
                            auctionState?.highestBidderTeamName ||
                            'Independent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
                  <Link
                    href="/squads"
                    className="btn btn-secondary btn-sm text-xs font-mono inline-flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-zinc-400" /> View Squad Rosters
                  </Link>
                  <Link
                    href="/bind-log"
                    className="btn btn-primary btn-sm text-xs font-mono font-bold inline-flex items-center gap-1.5"
                  >
                    View Bind Log <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* LIVE BINDING & BIDDING STATION */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Manager Funds:</span>
                <span className="text-emerald-400 font-bold">{formatMoney(managerBudget)}</span>
              </div>

              {/* 2 Buttons: +50 and +100 to ADD TO THE TEXT INPUT BOX */}
              <div className="grid grid-cols-2 gap-3">
                {/* +50 Button */}
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

                {/* +100 Button */}
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
                  <span className="text-cyan-300 font-bold font-mono">Current Bid: {formatMoney(currentBid)}</span>
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
          </div>

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

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {!auctionState?.bidHistory || auctionState.bidHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-mono">
                  No bids recorded for this session yet.
                </div>
              ) : (
                auctionState.bidHistory.map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      idx === 0
                        ? 'bg-white/10 border-white/30 shadow-md'
                        : 'bg-white/5 border-white/5 opacity-80'
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
                      <div className="text-xs sm:text-sm font-mono font-extrabold text-white">
                        {formatMoney(b.amount)}
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono">
                        {new Date(b.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
