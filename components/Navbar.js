import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Trophy,
  Users,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
  DollarSign,
  Radio,
  UserPlus,
  Sliders,
  FileText,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, auctionState } = useApp();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => router.pathname === path;
  const isAuctionLive = auctionState?.status === 'live';

  const formatMoney = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070708]/90 backdrop-blur-md border-b border-white/10">
      <div className="container flex items-center justify-between h-16 sm:h-20">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group text-decoration-none">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono">
                  PLAY<span className="text-zinc-400">BID</span>
                </span>
                {isAuctionLive ? (
                  <span className="badge badge-live">
                    <span className="pulse-dot"></span> LIVE
                  </span>
                ) : (
                  <span className="badge badge-idle">AUCTION</span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                Football Bidding Pro
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                isActive('/')
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Live Arena
            </Link>

            {user?.role === 'manager' && (
              <Link
                href="/manager"
                className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/manager')
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> My Team
              </Link>
            )}

            <Link
              href="/squads"
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                isActive('/squads')
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Squads
            </Link>

            <Link
              href="/players"
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                isActive('/players')
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Players Pool
            </Link>

            <Link
              href="/bind-log"
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                isActive('/bind-log') || isActive('/bind-logs') || isActive('/logs')
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Bind Log
            </Link>

            {/* Admin Dedicated Submenu */}
            {user?.role === 'admin' && (
              <div className="flex items-center gap-1 pl-2 border-l border-white/15">
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 border ${
                    isActive('/admin')
                      ? 'bg-white text-black border-white'
                      : 'text-zinc-300 border-white/20 hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Live Desk
                </Link>

                <Link
                  href="/admin/players"
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    isActive('/admin/players')
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ⚽ Players
                </Link>

                <Link
                  href="/admin/managers"
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    isActive('/admin/managers')
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  👔 Managers
                </Link>

                <Link
                  href="/admin/teams"
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                    isActive('/admin/teams')
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🛡️ Teams
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Right User Bar */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Manager Budget Display */}
              {user.role === 'manager' && user.managerProfile && (
                <Link
                  href="/manager"
                  className="flex items-center gap-2 bg-zinc-900 border border-white/15 px-3 py-1.5 rounded-xl hover:border-white/30 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    {user.managerProfile?.team?.icon || '🛡️'}
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-zinc-400 font-mono leading-none">
                      {user.managerProfile?.team?.name || 'Independent'}
                    </div>
                    <div className="text-xs font-bold text-white font-mono flex items-center gap-0.5">
                      <span className="text-emerald-400">●</span> {formatMoney(user.managerProfile?.budget)}
                    </div>
                  </div>
                </Link>
              )}

              {/* User Identity Chip */}
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 px-3 py-1.5 rounded-xl">
                {user.managerProfile?.photo ? (
                  <img
                    src={user.managerProfile.photo}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold font-mono">
                    {user.role === 'admin' ? 'A' : 'M'}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs font-semibold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                    {user.role}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-primary btn-sm flex items-center gap-1.5 font-mono font-bold">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          {user?.role === 'manager' && user.managerProfile && (
            <div className="bg-zinc-900 border border-white/15 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-emerald-400">
              {formatMoney(user.managerProfile?.budget)}
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0c0c0e] px-4 py-5 flex flex-col gap-2.5">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`p-3 rounded-lg flex items-center gap-3 text-xs font-mono font-semibold ${
              isActive('/') ? 'bg-white text-black' : 'text-zinc-300 bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4" /> Live Arena
          </Link>

          {user?.role === 'manager' && (
            <Link
              href="/manager"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-lg flex items-center gap-3 text-xs font-mono font-semibold ${
                isActive('/manager') ? 'bg-white text-black' : 'text-zinc-300 bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4" /> My Team
            </Link>
          )}

          <Link
            href="/squads"
            onClick={() => setMobileMenuOpen(false)}
            className={`p-3 rounded-lg flex items-center gap-3 text-xs font-mono font-semibold ${
              isActive('/squads') ? 'bg-white text-black' : 'text-zinc-300 bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> Squads & Rosters
          </Link>

          <Link
            href="/players"
            onClick={() => setMobileMenuOpen(false)}
            className={`p-3 rounded-lg flex items-center gap-3 text-xs font-mono font-semibold ${
              isActive('/players') ? 'bg-white text-black' : 'text-zinc-300 bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" /> Players Pool
          </Link>

          <Link
            href="/bind-log"
            onClick={() => setMobileMenuOpen(false)}
            className={`p-3 rounded-lg flex items-center gap-3 text-xs font-mono font-semibold ${
              isActive('/bind-log') || isActive('/bind-logs') || isActive('/logs')
                ? 'bg-white text-black'
                : 'text-zinc-300 bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" /> Bind Log
          </Link>

          {user?.role === 'admin' && (
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <div className="text-[10px] text-zinc-500 uppercase font-mono px-1">Commissioner Controls:</div>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono ${
                  isActive('/admin') ? 'bg-white text-black font-bold' : 'text-zinc-300 bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Live Auction Desk
              </Link>
              <Link
                href="/admin/players"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono ${
                  isActive('/admin/players') ? 'bg-white text-black font-bold' : 'text-zinc-300 bg-white/5'
                }`}
              >
                ⚽ Manage Players
              </Link>
              <Link
                href="/admin/managers"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono ${
                  isActive('/admin/managers') ? 'bg-white text-black font-bold' : 'text-zinc-300 bg-white/5'
                }`}
              >
                👔 Manage Managers
              </Link>
              <Link
                href="/admin/teams"
                onClick={() => setMobileMenuOpen(false)}
                className={`p-2.5 rounded-lg flex items-center gap-2 text-xs font-mono ${
                  isActive('/admin/teams') ? 'bg-white text-black font-bold' : 'text-zinc-300 bg-white/5'
                }`}
              >
                🛡️ Manage Teams
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs font-mono">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{user.name}</div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="btn btn-danger btn-sm text-xs font-mono"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary w-full text-xs font-mono font-bold"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
