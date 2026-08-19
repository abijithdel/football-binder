import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Shield, ArrowUpRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function PlayersPage() {
  const { auctionState } = useApp();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPos, setSelectedPos] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('available');

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedPos !== 'ALL') params.append('position', selectedPos);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/players?${params.toString()}`);
      const data = await res.json();
      if (data.players) {
        setPlayers(data.players);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPlayers();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedPos, selectedStatus, auctionState?.status]);

  const formatMoney = (val) => {
    if (!val && val !== 0) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="container py-8 sm:py-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-3">
          <Users className="w-3.5 h-3.5 text-white" /> PLAYER MARKETPLACE
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
          FOOTBALL PLAYERS POOL
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Explore world-class athletes, technical attributes, market valuations, and live auction statuses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              placeholder="Search player name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-sm py-2.5"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          </div>

          {/* Position Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedPos}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="input-field text-sm py-2.5"
            >
              <option value="ALL">All Positions</option>
              <option value="FWD">Forwards (FWD)</option>
              <option value="MID">Midfielders (MID)</option>
              <option value="DEF">Defenders (DEF)</option>
              <option value="GK">Goalkeepers (GK)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field text-sm py-2.5"
            >
              <option value="ALL">All Statuses</option>
              <option value="available">Available in Pool</option>
              <option value="in_auction">In Live Auction</option>
              <option value="sold">Sold to Club</option>
              <option value="unsold">Unsold / Passed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-mono">Filtering Players...</div>
      ) : players.length === 0 ? (
        <div className="glass-panel p-16 text-center text-zinc-500 font-mono">
          No players match the current search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {players.map((p) => (
            <div key={p._id} className="fifa-card p-5 flex flex-col justify-between">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-pos text-xs">{p.position}</span>
                  <span
                    className={`badge text-[10px] ${
                      p.status === 'sold'
                        ? 'badge-sold'
                        : p.status === 'in_auction'
                        ? 'badge-live'
                        : 'badge-idle'
                    }`}
                  >
                    {p.status === 'in_auction' ? '● LIVE' : p.status}
                  </span>
                </div>

                {/* Player Photo */}
                <div className="w-full h-44 rounded-2xl bg-zinc-900 overflow-hidden relative mb-4 border border-white/10 shadow-lg">
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2.5 left-2.5 w-10 h-10 rounded-xl bg-white text-black font-mono font-black text-sm flex items-center justify-center shadow-md">
                    {p.rating || 85}
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-extrabold text-white text-lg font-mono tracking-tight leading-snug">
                  {p.name}
                </h3>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  {p.nationality} • Age {p.age || 24}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-1.5 my-4 text-center font-mono">
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-[9px] text-zinc-500">PAC</div>
                    <div className="text-xs font-bold text-white">{p.stats?.pace || 80}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-[9px] text-zinc-500">SHO</div>
                    <div className="text-xs font-bold text-white">{p.stats?.shooting || 80}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-[9px] text-zinc-500">DRI</div>
                    <div className="text-xs font-bold text-white">{p.stats?.dribbling || 80}</div>
                  </div>
                </div>
              </div>

              {/* Price / Status footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">
                    {p.status === 'sold' ? 'Sold Price' : 'Base Valuation'}
                  </div>
                  <div className="text-sm font-black text-white font-mono">
                    {formatMoney(p.soldPrice || p.value)}
                  </div>
                </div>

                {p.team ? (
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase">Club</div>
                    <div className="text-xs font-bold text-zinc-300 font-mono flex items-center gap-1 justify-end">
                      <span>{p.team.icon || '🛡️'}</span>
                      <span className="truncate max-w-[80px]">{p.team.name}</span>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/"
                    className="btn btn-secondary btn-sm text-[11px] py-1 px-3 flex items-center gap-1 font-mono"
                  >
                    Arena <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
