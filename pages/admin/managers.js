import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  Users,
  Shield,
  Trash2,
  Edit2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  DollarSign,
  UserCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AdminManagersPage() {
  const router = useRouter();
  const { user, loadingUser } = useApp();

  const [managers, setManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManagerId, setEditingManagerId] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    email: '',
    password: '',
    photo: '',
    budget: 1000, // in INR
    teamId: '',
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
      const [resM, resT] = await Promise.all([
        fetch('/api/managers'),
        fetch('/api/teams'),
      ]);
      const dataM = await resM.json();
      const dataT = await resT.json();
      if (dataM.managers) setManagers(dataM.managers);
      if (dataT.teams) setTeams(dataT.teams);
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
    const num = Number(val);
    const cleanVal = num > 50000 ? Math.round(num / 1000000) : num;
    return `₹${cleanVal.toLocaleString('en-IN')}`;
  };

  const handleOpenAddModal = () => {
    setEditingManagerId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (m) => {
    setEditingManagerId(m._id);
    const rawBudget = Number(m.budget) || 1000;
    const cleanBudget = rawBudget > 50000 ? Math.round(rawBudget / 1000000) : rawBudget;
    setFormData({
      name: m.name,
      email: m.user?.email || '',
      password: '', // blank unless changing
      photo: m.photo || '',
      budget: cleanBudget,
      teamId: m.team?._id || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveManager = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget),
      };

      let res;
      if (editingManagerId) {
        res = await fetch(`/api/managers/${editingManagerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/managers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save manager');

      showToast('success', editingManagerId ? 'Manager profile updated!' : 'Manager account provisioned successfully!');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeleteManager = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name} and their login credentials?`)) return;
    try {
      const res = await fetch(`/api/managers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete manager');
      showToast('success', `${name} deleted`);
      loadData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleQuickAssignTeam = async (managerId, teamId) => {
    try {
      const res = await fetch('/api/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId, teamId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to assign team');
      showToast('success', 'Team assigned successfully!');
      loadData();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Sample Manager Photos
  const sampleManagerPhotos = [
    { label: 'Pep', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
    { label: 'Carlo', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { label: 'Arteta', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
    { label: 'Tactician', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-zinc-400 hover:text-white flex items-center gap-1 text-xs font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Desk
            </Link>
            <span className="text-zinc-600">•</span>
            <span className="badge badge-pos">MANAGERS & CREDENTIALS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-mono tracking-tight">
            CLUB MANAGERS DIRECTORY
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Provision manager logins, allocate transfer funds, and assign managers to club rosters.
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm flex items-center gap-2 font-bold font-mono">
          <UserPlus className="w-4 h-4" /> Provision New Manager Account
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

      {/* Security Banner */}
      <div className="glass-panel p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white font-mono">RESTRICTED ACCOUNT PROVISIONING</div>
            <div className="text-[11px] text-zinc-400">
              Only commissioners can issue manager access credentials. Public registration is locked.
            </div>
          </div>
        </div>
        <span className="badge badge-sold text-xs font-mono">
          {managers.length} Active Managers
        </span>
      </div>

      {/* Managers Grid */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-mono">Loading Manager Profiles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.map((m) => (
            <div key={m._id} className="glass-panel p-6 flex flex-col justify-between">
              <div>
                {/* Top Profile Bar */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                      alt={m.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-md"
                    />
                    <div>
                      <h3 className="text-lg font-extrabold text-white font-mono tracking-tight leading-snug">
                        {m.name}
                      </h3>
                      <div className="text-xs text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{m.user?.email || 'manager@domain.com'}</span>
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-pos text-[10px]">
                    MANAGER
                  </span>
                </div>

                {/* Team & Budget Status Box */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/10 space-y-3 my-4">
                  {/* Assigned Team */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 uppercase">Assigned Team:</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <span>{m.team?.icon || '🛡️'}</span>
                      <span>{m.team?.name || 'Unassigned'}</span>
                    </span>
                  </div>

                  {/* Remaining Budget */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 uppercase">Available Budget:</span>
                    <span className="font-bold text-emerald-400">{formatMoney(m.budget)}</span>
                  </div>

                  {/* Initial Allocation */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 uppercase">Starting Budget:</span>
                    <span className="font-bold text-zinc-300">{formatMoney(m.initialBudget || 150000000)}</span>
                  </div>
                </div>

                {/* Quick Team Assignment Dropdown */}
                <div className="mt-3">
                  <label className="block text-[10px] text-zinc-400 font-mono uppercase mb-1">
                    Assign / Switch Club:
                  </label>
                  <select
                    value={m.team?._id || ''}
                    onChange={(e) => handleQuickAssignTeam(m._id, e.target.value)}
                    className="input-field text-xs py-2 font-mono"
                  >
                    <option value="">-- No Team (Unassigned) --</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.icon} {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEditModal(m)}
                  className="btn btn-secondary btn-sm text-xs font-mono flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile & Funds
                </button>

                <button
                  onClick={() => handleDeleteManager(m._id, m.name)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Delete Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MANAGER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="text-xl font-extrabold font-mono text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-white" />
                {editingManagerId ? 'Edit Manager Account' : 'Provision Manager Account'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManager} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                  Manager Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pep Guardiola"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              {!editingManagerId && (
                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                    Login Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager@city.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                  {editingManagerId ? 'New Password (leave empty to keep current)' : 'Login Password *'}
                </label>
                <input
                  type="password"
                  required={!editingManagerId}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="input-field text-sm"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono mr-1">Presets:</span>
                  {sampleManagerPhotos.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: s.url })}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 font-mono"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                    Transfer Budget (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="input-field text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                    Assign Club
                  </label>
                  <select
                    value={formData.teamId}
                    onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                    className="input-field text-sm font-mono"
                  >
                    <option value="">-- None --</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.icon} {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm font-bold font-mono">
                  {editingManagerId ? 'Save Manager' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
