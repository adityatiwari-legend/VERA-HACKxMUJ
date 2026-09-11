'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogIn, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-[#111113] rounded-xl border border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-[#00F59B] flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Sign in to VERA</h1>
          <p className="text-xs text-zinc-400">
            Access your donor portal, NGO hub, or auditor workspace
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ngo@fundtrail.org"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F59B] text-xs transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F59B] text-xs transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <>
                <LogIn className="w-4 h-4 text-black" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Buttons for Evaluation / Review */}
        <div className="pt-4 border-t border-zinc-800">
          <p className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Demo Accounts (Password: Password123!)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('ngo@fundtrail.org')}
              className="px-2 py-1.5 text-xs font-mono font-medium bg-[#18181B] hover:bg-zinc-800 hover:text-white border border-zinc-700 rounded-lg text-zinc-400 transition-colors"
            >
              NGO
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('donor@fundtrail.org')}
              className="px-2 py-1.5 text-xs font-mono font-medium bg-[#18181B] hover:bg-zinc-800 hover:text-white border border-zinc-700 rounded-lg text-zinc-400 transition-colors"
            >
              Donor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('auditor@fundtrail.org')}
              className="px-2 py-1.5 text-xs font-mono font-medium bg-[#18181B] hover:bg-zinc-800 hover:text-white border border-zinc-700 rounded-lg text-zinc-400 transition-colors"
            >
              Auditor
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400">
          Don't have an NGO account?{' '}
          <Link href="/register" className="font-semibold text-[#00F59B] hover:underline">
            Register NGO
          </Link>
        </p>
      </div>
    </div>
  );
}
