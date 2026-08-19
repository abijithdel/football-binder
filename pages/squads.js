import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Users, DollarSign, UserCheck } from 'lucide-react';

export default function SquadsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/teams');
      const data = await res.json();
      if (data.teams) {
        setTeams(data.teams);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, []);

  const formatMoney = (val) => {
    if (!val && val !== 0) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="container py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400 mb-3">
          <Trophy className="w-3.5 h-3.5 text-white" /> SQUAD ROSTERS & LEADERBOARD
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
          CLUB SQUADS & ASSETS
        </h1>
        <p className="text-sm text-zinc-400 mt-2">
          Track acquired players, squad composition, and financial expenditure across all participating teams.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-mono">Loading Squads Data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {teams.map((t) => {
            const manager = t.manager;
            const remainingBudget = manager ? manager.budget : 0;
            const initialBudget = manager ? manager.initialBudget : 150000000;
            const spentPercentage = Math.min(100, Math.round(((t.budgetSpent || 0) / initialBudget) * 100));

            return (
              <div key={t._id} className="glass-panel p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  {/* Team Header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/20 flex items-center justify-center text-2xl shadow-lg">
                        {t.icon || '🛡️'}
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">
                          {t.name}
                        </h2>
                        <div className="text-xs text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Manager: {manager?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-sold text-xs font-mono">
                      {t.playersWon?.length || 0} Players
                    </span>
                  </div>

                  {/* Financial Tracker */}
                  <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/10 mb-6">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase font-mono">
                          Spent on Bids
                        </div>
                        <div className="text-base font-bold text-white font-mono">
                          {formatMoney(t.budgetSpent || 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-500 uppercase font-mono">
                          Remaining Funds
                        </div>
                        <div className="text-base font-bold text-emerald-400 font-mono">
                          {formatMoney(remainingBudget)}
                        </div>
                      </div>
                    </div>

                    {/* Spent bar */}
                    <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all"
                        style={{ width: `${spentPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Won Players Grid */}
                  <div>
                    <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center justify-between">
                      <span>Acquired Roster</span>
                      <span className="text-zinc-600">Position / Rating</span>
                    </div>

                    {!t.playersWon || t.playersWon.length === 0 ? (
                      <div className="p-6 rounded-xl bg-white/5 border border-white/5 text-center text-xs text-zinc-500 font-mono">
                        No players acquired in live bidding yet.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {t.playersWon.map((p) => (
                          <div
                            key={p._id}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={p.photo}
                                alt={p.name}
                                className="w-9 h-9 rounded-lg object-cover border border-white/15"
                              />
                              <div>
                                <div className="text-xs font-bold text-white font-mono">{p.name}</div>
                                <div className="text-[10px] text-zinc-400 font-mono">
                                  {p.nationality} • Age {p.age || 24}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className="badge badge-pos text-[10px] px-2 py-0.5">
                                {p.position}
                              </span>
                              <span className="text-xs font-mono font-bold text-zinc-300">
                                {formatMoney(p.soldPrice || p.value)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
