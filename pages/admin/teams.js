import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Trophy,
  UserCheck,
} from 'lucide-react';

export default function AdminTeamsPage() {
  const router = useRouter();
  const { user, loadingUser } = useApp();

  const [teams, setTeams] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    icon: '🛡️',
    managerId: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, loadingUser, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resT, resM] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/managers'),
      ]);
      const dataT = await resT.json();
      const dataM = await resM.json();
      if (dataT.teams) setTeams(dataT.teams);
      if (dataM.managers) setManagers(dataM.managers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  const handleOpenAddModal = () => {
    setEditingTeamId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t) => {
    setEditingTeamId(t._id);
    setFormData({
      name: t.name,
      icon: t.icon || '🛡️',
      managerId: t.manager?._id || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingTeamId) {
        res = await fetch(`/api/teams/${editingTeamId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save team');

      showToast('success', editingTeamId ? 'Team updated successfully!' : 'Team registered successfully!');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteTeam = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete team');
      showToast('success', `${name} deleted`);
      loadData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const sampleIcons = ['⚡', '👑', '🎯', '⚽', '🦁', '🦅', '🔥', '🛡️', '⚔️', '🌟'];

  return (
    <div className="container py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Desk
            </Link>
            <span className="text-zinc-600">•</span>
            <span className="badge badge-pos">CLUBS & ROSTERS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-mono tracking-tight">
            FOOTBALL CLUBS DIRECTORY
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Register football clubs, assign official managers, and track squad size and expenses.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm flex items-center gap-2 font-bold font-mono">
          <Plus className="w-4 h-4" /> Add Football Team
        </button>
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
          {msg.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-mono">Loading Teams...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((t) => (
            <div key={t._id} className="glass-panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/20 flex items-center justify-center text-3xl shadow-lg">
                      {t.icon || '🛡️'}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white font-mono tracking-tight">
                        {t.name}
                      </h3>
                      <div className="text-xs text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Manager: {t.manager?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-sold text-[10px] font-mono">
                    {t.playersWon?.length || 0} Players
                  </span>
                </div>

                {/* Team Financials */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/10 space-y-2 my-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 uppercase">Transfer Outlay:</span>
                    <span className="font-bold text-white">{formatMoney(t.budgetSpent || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 uppercase">Manager Remaining:</span>
                    <span className="font-bold text-emerald-400">
                      {formatMoney(t.manager?.budget || 0)}
                    </span>
                  </div>
                </div>

                {/* Won Players Preview */}
                {t.playersWon && t.playersWon.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1.5">
                      Squad Signings:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {t.playersWon.slice(0, 4).map((p) => (
                        <span key={p._id} className="badge badge-pos text-[10px] px-2 py-0.5">
                          {p.name} ({p.position})
                        </span>
                      ))}
                      {t.playersWon.length > 4 && (
                        <span className="text-[10px] text-zinc-400 font-mono self-center">
                          +{t.playersWon.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEditModal(t)}
                  className="btn btn-secondary btn-sm text-xs font-mono flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Club
                </button>

                <button
                  onClick={() => handleDeleteTeam(t._id, t.name)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Delete Team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT TEAM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="text-xl font-extrabold font-mono text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-white" />
                {editingTeamId ? 'Edit Football Team' : 'Register Football Team'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manchester Titans"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                  Team Icon / Emblem Emoji *
                </label>
                <input
                  type="text"
                  required
                  placeholder="⚡ or 👑 or 🎯"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="input-field text-sm font-mono text-xl"
                />
                {/* Quick Icon Selector */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono mr-1 self-center">Pick:</span>
                  {sampleIcons.map((ic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: ic })}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-base flex items-center justify-center transition-transform hover:scale-110"
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                  Assign Club Manager
                </label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="input-field text-sm font-mono"
                >
                  <option value="">-- No Manager (Unassigned) --</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.team ? `Current: ${m.team.name}` : 'Unassigned'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm font-bold font-mono">
                  {editingTeamId ? 'Save Changes' : 'Register Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
