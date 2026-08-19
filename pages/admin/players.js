import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Play,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Shield,
  Eye,
} from 'lucide-react';

export default function AdminPlayersPage() {
  const router = useRouter();
  const { user, loadingUser, startAuction } = useApp();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [viewingPlayer, setViewingPlayer] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    photo: '',
    position: 'FWD',
    value: 50, // in Millions
    rating: 85,
    nationality: 'International',
    age: 24,
    stats: {
      pace: 80,
      shooting: 75,
      passing: 80,
      dribbling: 82,
      defending: 65,
      physical: 75,
    },
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!loadingUser) {
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    }
  }, [user, loadingUser, router]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/players');
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
    if (user?.role === 'admin') {
      loadPlayers();
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
    setEditingPlayerId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (player) => {
    setEditingPlayerId(player._id);
    setFormData({
      name: player.name,
      photo: player.photo,
      position: player.position,
      value: (player.value / 1000000) || 50,
      rating: player.rating || 80,
      nationality: player.nationality || 'International',
      age: player.age || 24,
      stats: player.stats || {
        pace: 75,
        shooting: 75,
        passing: 75,
        dribbling: 75,
        defending: 75,
        physical: 75,
      },
    });
    setIsModalOpen(true);
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: Number(formData.value) * 1000000,
        rating: Number(formData.rating),
        age: Number(formData.age),
      };

      let res;
      if (editingPlayerId) {
        res = await fetch(`/api/players/${editingPlayerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save player');

      showToast('success', editingPlayerId ? 'Player updated successfully!' : 'Player created successfully!');
      setIsModalOpen(false);
      loadPlayers();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleDeletePlayer = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete player');
      showToast('success', `${name} deleted`);
      loadPlayers();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  const handleQuickLaunch = (playerId, name) => {
    startAuction(playerId, 30);
    showToast('success', `Live auction initiated for ${name}!`);
    router.push('/admin');
  };

  // Sample Avatar Suggestions
  const samplePhotos = [
    { label: 'Star Striker', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80' },
    { label: 'Midfield Maestro', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80' },
    { label: 'Winger Ace', url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&auto=format&fit=crop&q=80' },
    { label: 'Titan Defender', url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&auto=format&fit=crop&q=80' },
    { label: 'Goal Guardian', url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&auto=format&fit=crop&q=80' },
  ];

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.nationality?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPos = posFilter === 'ALL' || p.position === posFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesPos && matchesStatus;
  });

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
            <span className="badge badge-pos">PLAYER REGISTRY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white font-mono tracking-tight">
            FOOTBALL PLAYERS MANAGEMENT
          </h1>
        </div>

        <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm flex items-center gap-2 font-bold font-mono">
          <Plus className="w-4 h-4" /> Add New Player
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

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 sm:p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              placeholder="Search player name or nationality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 text-sm py-2.5"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
          </div>

          <div className="sm:col-span-3">
            <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)} className="input-field text-sm py-2.5">
              <option value="ALL">All Positions</option>
              <option value="FWD">Forwards (FWD)</option>
              <option value="MID">Midfielders (MID)</option>
              <option value="DEF">Defenders (DEF)</option>
              <option value="GK">Goalkeepers (GK)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm py-2.5">
              <option value="ALL">All Statuses</option>
              <option value="available">Available</option>
              <option value="in_auction">In Live Auction</option>
              <option value="sold">Sold</option>
              <option value="unsold">Unsold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players List Grid */}
      {loading ? (
        <div className="p-16 text-center text-zinc-500 font-mono">Loading Players...</div>
      ) : filteredPlayers.length === 0 ? (
        <div className="glass-panel p-16 text-center text-zinc-500 font-mono">
          No players match your filters. Click <strong>"Add New Player"</strong> to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPlayers.map((p) => (
            <div key={p._id} className="fifa-card p-5 flex flex-col justify-between group">
              <div>
                {/* Header */}
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

                {/* Photo */}
                <div className="w-full h-44 rounded-2xl bg-zinc-900 overflow-hidden relative mb-4 border border-white/10 shadow-lg">
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2.5 left-2.5 w-10 h-10 rounded-xl bg-white text-black font-mono font-black text-sm flex items-center justify-center shadow-md">
                    {p.rating || 85}
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-extrabold text-white text-lg font-mono tracking-tight truncate leading-snug">
                  {p.name}
                </h3>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  {p.nationality} • Age {p.age || 24}
                </div>

                {/* Base Value */}
                <div className="mt-3 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-zinc-500 uppercase">Base Value:</span>
                  <span className="font-bold text-white">{formatMoney(p.value)}</span>
                </div>

                {p.team && (
                  <div className="mt-2 text-xs text-zinc-300 font-mono flex items-center gap-1.5">
                    <span>{p.team.icon || '🛡️'}</span>
                    <span className="truncate">Sold to {p.team.name} ({formatMoney(p.soldPrice)})</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                    title="Edit Player"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(p._id, p.name)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete Player"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {p.status === 'available' && (
                  <button
                    onClick={() => handleQuickLaunch(p._id, p.name)}
                    className="btn btn-primary btn-sm py-1 px-3 text-xs font-mono font-bold flex items-center gap-1"
                    title="Launch directly into Live Auction"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Live Auction
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT PLAYER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h3 className="text-xl font-extrabold font-mono text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                {editingPlayerId ? 'Edit Football Player' : 'Add New Football Player'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                  Player Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kylian Mbappé"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                  Photo URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="input-field text-sm"
                />

                {/* Quick Avatar Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono mr-1">Presets:</span>
                  {samplePhotos.map((s, idx) => (
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
                    Position *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input-field text-sm"
                  >
                    <option value="FWD">Forward (FWD)</option>
                    <option value="MID">Midfielder (MID)</option>
                    <option value="DEF">Defender (DEF)</option>
                    <option value="GK">Goalkeeper (GK)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                    Base Valuation ($ in Millions) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="input-field text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                    OVR Rating (50-99)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="input-field text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono text-zinc-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="input-field text-sm font-mono"
                  />
                </div>
              </div>

              {/* Technical Attributes */}
              <div className="pt-3 border-t border-white/10">
                <div className="text-xs uppercase font-mono text-zinc-400 mb-2">
                  Technical Attributes (0-99)
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono uppercase">PAC</label>
                    <input
                      type="number"
                      value={formData.stats.pace}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stats: { ...formData.stats, pace: Number(e.target.value) },
                        })
                      }
                      className="input-field text-xs py-1.5 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono uppercase">SHO</label>
                    <input
                      type="number"
                      value={formData.stats.shooting}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stats: { ...formData.stats, shooting: Number(e.target.value) },
                        })
                      }
                      className="input-field text-xs py-1.5 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono uppercase">PAS</label>
                    <input
                      type="number"
                      value={formData.stats.passing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stats: { ...formData.stats, passing: Number(e.target.value) },
                        })
                      }
                      className="input-field text-xs py-1.5 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono uppercase">DRI</label>
                    <input
                      type="number"
                      value={formData.stats.dribbling}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stats: { ...formData.stats, dribbling: Number(e.target.value) },
                        })
                      }
                      className="input-field text-xs py-1.5 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono uppercase">DEF</label>
                    <input
                      type="number"
                      value={formData.stats.defending}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stats: { ...formData.stats, defending: Number(e.target.value) },
                        })
                      }
                      className="input-field text-xs py-1.5 text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-mono uppercase">PHY</label>
                    <input
                      type="number"
                      value={formData.stats.physical}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stats: { ...formData.stats, physical: Number(e.target.value) },
                        })
                      }
                      className="input-field text-xs py-1.5 text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm font-bold font-mono">
                  {editingPlayerId ? 'Save Changes' : 'Register Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
