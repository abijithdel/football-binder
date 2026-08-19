import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useApp } from '../context/AppContext';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { fetchUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      await fetchUser();

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (em, pw) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-black text-2xl font-bold mb-4 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          ⚽
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-mono">
          AUTHENTICATE
        </h1>
        <p className="text-sm text-zinc-400">
          Enter your authorized credentials to enter the bidding floor.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent" />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@domain.com"
                className="input-field pl-11"
              />
              <Mail className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pl-11"
              />
              <Lock className="w-5 h-5 text-zinc-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3.5 mt-2 font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                Enter Auction Floor <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-zinc-500">
            🔒 Public self-registration is closed. Accounts are strictly provisioned by the Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
