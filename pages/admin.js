import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Users,
  Shield,
  Trophy,
  ArrowRight,
  TrendingUp,
  Flame,
  Award,
  Plus,
} from 'lucide-react';

export default function AdminLiveDeskPage() {
  const router = useRouter();
  const {
    user,
    loadingUser,
    auctionState,
    startAuction,
    sellNow,
    unsoldNow,
    togglePause,
    addTime,
    resetAuction,
    timer,
  } = useApp();

  const [players, setPlayers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Auction start form
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [auctionDuration, setAuctionDuration] = useState(30);

  // Redirect if not admin
  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, loadingUser, router]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [resP, resM, resT] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/managers'),
        fetch('/api/teams'),
      ]);

      const dataP = await resP.json();
      const dataM = await resM.json();
      const dataT = await resT.json();

      if (dataP.players) setPlayers(dataP.players);
      if (dataM.managers) setManagers(dataM.managers);
      if (dataT.teams) setTeams(dataT.teams);

      const available = dataP.players?.filter((p) => p.status === 'available');
      if (available && available.length > 0 && !selectedPlayerId) {
        setSelectedPlayerId(available[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const showToast = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const formatMoney = (val) => {
    if (!val && val !== 0) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const handleSeedDatabase = async (force = true) => {
    if (!confirm('Reset all rosters, budgets, and populate world-class superstar players in MongoDB Atlas?')) return;
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      showToast('success', 'Database re-seeded with superstars!');
      loadData();
      resetAuction();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  if (loadingUser || !user) {
    return <div className="p-16 text-center text-zinc-400 font-mono">Loading Commissioner Console...</div>;
  }

  const availablePlayers = players.filter((p) => p.status === 'available');
  const isLive = auctionState?.status === 'live';
  const isPaused = auctionState?.status === 'paused';
  const isSold = auctionState?.status === 'sold';
  const isUnsold = auctionState?.status === 'unsold';

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-pos">COMMISSIONER HEADQUARTERS</span>
            <span className="text-xs text-zinc-400 font-mono">ADMIN CONTROL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-mono tracking-tight">
            LIVE AUCTION COMMAND DESK
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Control the live bidding floor, hammer down sales, and oversee player assignments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSeedDatabase(true)}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 font-mono text-xs"
            title="Reset database to fresh superstars"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Re-Seed Superstars
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {msg.text && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-sm flex items-center gap-3 ${
            msg.type === 'error'
              ? 'bg-red-950/80 border-red-500/50 text-red-200'
              : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {msg.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/players"
          className="glass-panel p-5 flex items-center justify-between hover:scale-[1.01] transition-transform group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center text-xl font-bold">
              ⚽
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-mono uppercase">Player Registry</div>
              <div className="text-lg font-black text-white font-mono">{players.length} Players</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/managers"
          className="glass-panel p-5 flex items-center justify-between hover:scale-[1.01] transition-transform group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center text-xl font-bold">
              👔
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-mono uppercase">Manager Accounts</div>
              <div className="text-lg font-black text-white font-mono">{managers.length} Managers</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/teams"
          className="glass-panel p-5 flex items-center justify-between hover:scale-[1.01] transition-transform group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center text-xl font-bold">
              🛡️
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-mono uppercase">Football Clubs</div>
              <div className="text-lg font-black text-white font-mono">{teams.length} Clubs</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Main Cockpit: Left Auction Controller + Right Available Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left: Active Live Auction Controller */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 text-white fill-current" /> Live Auction Console
              </h2>
              {isLive && (
                <span className="badge badge-live">
                  <span className="pulse-dot" /> BROADCASTING LIVE
                </span>
              )}
            </div>

            {isLive || isPaused ? (
              <div className="space-y-4">
                {/* Active Player Banner */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={auctionState.currentPlayer?.photo}
                      alt=""
                      className="w-14 h-16 rounded-xl object-cover border border-white/20"
                    />
                    <div>
                      <div className="text-lg font-black text-white font-mono">
                        {auctionState.currentPlayer?.name}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">
                        {auctionState.currentPlayer?.position} • Rating {auctionState.currentPlayer?.rating} • Base {formatMoney(auctionState.currentPlayer?.value)}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">Current Highest Bid</div>
                    <div className="text-2xl font-black text-white font-mono">
                      {formatMoney(auctionState.currentBid)}
                    </div>
                    <div className="text-xs text-emerald-400 font-mono font-bold">
                      {auctionState.highestBidderName || 'Waiting for first bid...'}
                    </div>
                  </div>
                </div>

                {/* Clock Gauge */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-white" /> Synchronized Clock:
                  </span>
                  <span className={`text-2xl font-black font-mono ${timer <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timer}s
                  </span>
                </div>

                {/* Real-Time Commissioner Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={sellNow}
                    disabled={!auctionState.highestBidderManager}
                    className="btn btn-primary py-3 font-bold font-mono text-xs"
                    title="Sell player to current highest bidder"
                  >
                    ⚡ Hammer / Sell
                  </button>

                  <button
                    onClick={unsoldNow}
                    className="btn btn-danger py-3 font-bold font-mono text-xs"
                    title="Mark player as unsold/pass"
                  >
                    Pass / Unsold
                  </button>

                  <button
                    onClick={togglePause}
                    className="btn btn-secondary py-3 font-bold font-mono text-xs"
                  >
                    {isLive ? 'Pause Clock' : 'Resume Clock'}
                  </button>

                  <button
                    onClick={() => addTime(15)}
                    className="btn btn-secondary py-3 font-bold font-mono text-xs"
                  >
                    +15s Extra Time
                  </button>
                </div>
              </div>
            ) : (
              /* Start New Player Auction Form */
              <div className="space-y-4">
                <p className="text-xs text-zinc-400 font-mono">
                  Select an available player from your catalog and launch the bidding timer.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                      Select Player from Pool:
                    </label>
                    <select
                      value={selectedPlayerId}
                      onChange={(e) => setSelectedPlayerId(e.target.value)}
                      className="input-field text-sm font-mono"
                    >
                      {availablePlayers.length === 0 ? (
                        <option value="">No available players in pool (All Sold or In Auction)</option>
                      ) : (
                        availablePlayers.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.position} - {formatMoney(p.value)} - {p.rating} OVR)
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                      Timer Duration (Seconds):
                    </label>
                    <select
                      value={auctionDuration}
                      onChange={(e) => setAuctionDuration(Number(e.target.value))}
                      className="input-field text-sm font-mono"
                    >
                      <option value={20}>20 Seconds (Blitz)</option>
                      <option value={30}>30 Seconds (Standard)</option>
                      <option value={45}>45 Seconds (Extended)</option>
                      <option value={60}>60 Seconds (Full Clock)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => selectedPlayerId && startAuction(selectedPlayerId, auctionDuration)}
                    disabled={!selectedPlayerId}
                    className="btn btn-primary w-full py-3.5 font-bold font-mono text-sm mt-2 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" /> Launch Live Auction Session
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Active Session */}
          <div className="glass-panel p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white font-mono">Force Reset Active Block</div>
              <div className="text-[11px] text-zinc-500">
                Resets the active auction stage back to idle.
              </div>
            </div>
            <button onClick={resetAuction} className="btn btn-secondary btn-sm text-xs font-mono">
              Reset Stage
            </button>
          </div>
        </div>

        {/* Right: Available Players Quick Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white font-mono uppercase">
                Available Player Queue ({availablePlayers.length})
              </h3>
              <Link href="/admin/players" className="text-xs text-zinc-400 hover:text-white font-mono">
                Manage All →
              </Link>
            </div>

            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {availablePlayers.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500 font-mono">
                  All players have been auctioned! Click below to add new players.
                </div>
              ) : (
                availablePlayers.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.photo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white font-mono">{p.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {p.position} • {p.rating} OVR
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold font-mono text-zinc-300">
                        {formatMoney(p.value)}
                      </span>
                      <button
                        onClick={() => startAuction(p._id, 30)}
                        className="p-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
                        title="Start live auction for this player"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
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
