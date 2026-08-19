import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trophy,
  Shield,
  DollarSign,
  Users,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function BindLogPage() {
  const { auctionState } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent'); // recent, price_desc, price_asc, rating_desc
  const [viewMode, setViewMode] = useState('cards'); // cards or table

  // Fetch all sold / bound players
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/players?status=sold');
      const data = await res.json();
      if (data.players) {
        setLogs(data.players);
      }
    } catch (err) {
      console.error('Error fetching bind logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [auctionState?.status]);

  const formatMoney = (val) => {
    if (!val && val !== 0) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  // Filter and sort logs
  const filteredLogs = logs
    .filter((player) => {
      const matchSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.soldTo?.name && player.soldTo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (player.team?.name && player.team.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        player.nationality.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPosition = positionFilter === 'ALL' || player.position === positionFilter;

      return matchSearch && matchPosition;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      if (sortBy === 'price_desc') {
        return (b.soldPrice || b.currentValue || 0) - (a.soldPrice || a.currentValue || 0);
      }
      if (sortBy === 'price_asc') {
        return (a.soldPrice || a.currentValue || 0) - (b.soldPrice || b.currentValue || 0);
      }
      if (sortBy === 'rating_desc') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });

  // Calculate high-level summary metrics
  const totalBoundPlayers = logs.length;
  const totalVolumeSpent = logs.reduce((acc, p) => acc + (p.soldPrice || p.currentValue || 0), 0);
  const avgBoundPrice = totalBoundPlayers > 0 ? totalVolumeSpent / totalBoundPlayers : 0;

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `player_bind_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="container py-6 sm:py-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-sold px-3 py-1">
              <FileText className="w-3.5 h-3.5" /> BIND & TRANSACTION AUDIT
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
            Player Bind <span className="text-zinc-400">Log</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
            Complete real-time ledger of all bound players, buying managers, teams, and valuations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="btn btn-secondary btn-sm font-mono text-xs flex items-center gap-1.5"
            title="Refresh logs"
          >
            <Sparkles className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleExportJSON}
            disabled={filteredLogs.length === 0}
            className="btn btn-primary btn-sm font-mono text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="text-xs uppercase font-mono text-zinc-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> Total Bound Players
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {totalBoundPlayers}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono mt-1">Transferred from Player Pool</p>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="text-xs uppercase font-mono text-zinc-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Total Market Spend
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
            {formatMoney(totalVolumeSpent)}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono mt-1">Deducted from Manager Balances</p>
        </div>

        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="text-xs uppercase font-mono text-zinc-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Average Bound Valuation
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono mt-2">
            {formatMoney(avgBoundPrice)}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono mt-1">Across all acquired superstars</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search player, manager, or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 text-xs py-2 w-full font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Position Selector */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {['ALL', 'FWD', 'MID', 'DEF', 'GK'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  positionFilter === pos ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-xs py-2 px-3 font-mono bg-zinc-950 border border-white/10"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="price_desc">Price: Highest to Lowest</option>
            <option value="price_asc">Price: Lowest to Highest</option>
            <option value="rating_desc">Rating: Highest OVR</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded-lg ${
                viewMode === 'cards' ? 'bg-white text-black font-bold' : 'text-zinc-400'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg ${
                viewMode === 'table' ? 'bg-white text-black font-bold' : 'text-zinc-400'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Bind Logs */}
      {loading ? (
        <div className="glass-panel p-16 text-center text-zinc-500 font-mono">
          <span className="pulse-dot inline-block mr-2" /> Loading Player Bind Logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-4">
            📜
          </div>
          <h3 className="text-xl font-bold text-white font-mono mb-2">No Bound Players Found</h3>
          <p className="text-xs text-zinc-400 font-mono max-w-md mx-auto mb-6">
            {searchTerm || positionFilter !== 'ALL'
              ? 'No records match your filter criteria. Try resetting filters.'
              : 'No players have been bound in the auction yet. Head over to the Live Arena to start bidding!'}
          </p>
          <Link href="/" className="btn btn-primary btn-sm font-mono font-bold inline-flex items-center gap-2">
            Go to Live Arena <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLogs.map((player) => {
            const finalPrice = player.soldPrice || player.currentValue || player.value;
            const managerName = player.soldTo?.name || 'Assigned Manager';
            const managerPhoto = player.soldTo?.photo;
            const teamName = player.team?.name || 'Independent Club';
            const teamIcon = player.team?.icon || '🛡️';
            const bindDate = player.updatedAt || player.createdAt;

            return (
              <div
                key={player._id}
                className="fifa-card p-6 relative overflow-hidden flex flex-col justify-between group hover:border-white/40 transition-all shadow-xl"
              >
                {/* Top Strip */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-pos text-xs px-2.5 py-0.5">{player.position}</span>
                      <span className="text-[11px] text-zinc-400 font-mono uppercase">
                        {player.nationality}
                      </span>
                    </div>
                    <span className="badge badge-sold text-[10px] px-2.5 py-0.5">
                      BOUND & ACQUIRED
                    </span>
                  </div>

                  {/* Player & Visual Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-900 border border-white/20 flex-shrink-0">
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1 left-1 w-6 h-6 rounded-md bg-white text-black font-mono font-black text-xs flex items-center justify-center shadow">
                        {player.rating || 85}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white font-mono truncate mb-0.5">
                        {player.name}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">
                        Base: <span className="text-zinc-300">{formatMoney(player.value)}</span>
                      </p>
                      <div className="mt-2 text-xl font-black text-emerald-400 font-mono">
                        {formatMoney(finalPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Manager & Team Details Box */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono text-[11px]">Buying Manager:</span>
                      <div className="flex items-center gap-1.5 font-bold text-white font-mono">
                        {managerPhoto && (
                          <img
                            src={managerPhoto}
                            alt={managerName}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        )}
                        <span>{managerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                      <span className="text-zinc-400 font-mono text-[11px]">Club Team:</span>
                      <div className="flex items-center gap-1.5 font-bold text-zinc-200 font-mono">
                        <span>{teamIcon}</span>
                        <span>{teamName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Timestamp & Stats */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono border-t border-white/10 pt-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{' '}
                    {bindDate ? new Date(bindDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                  <span>{player.bidHistory?.length || 1} Bids Recorded</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Player</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Buying Manager</th>
                  <th className="py-3.5 px-4">Team</th>
                  <th className="py-3.5 px-4">Bound Price</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-200">
                {filteredLogs.map((player) => {
                  const finalPrice = player.soldPrice || player.currentValue || player.value;
                  const managerName = player.soldTo?.name || 'Manager';
                  const teamName = player.team?.name || 'Independent';
                  const teamIcon = player.team?.icon || '🛡️';
                  const bindDate = player.updatedAt || player.createdAt;

                  return (
                    <tr key={player._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={player.photo}
                          alt={player.name}
                          className="w-8 h-10 rounded-lg object-cover bg-zinc-900 border border-white/15"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{player.name}</div>
                          <div className="text-[10px] text-zinc-500">{player.nationality}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-white text-black font-bold">
                          {player.rating || 85}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge badge-pos text-[10px]">{player.position}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{managerName}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1.5">
                          <span>{teamIcon}</span>
                          <span>{teamName}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-400 text-sm">
                        {formatMoney(finalPrice)}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-[11px]">
                        {bindDate ? new Date(bindDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
