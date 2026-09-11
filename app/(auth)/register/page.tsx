'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('NGO');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-[#111113] rounded-xl border border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-[#00F59B] flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Join VERA</h1>
          <p className="text-xs text-zinc-400">
            Register as a donor or NGO to engage in auditable philanthropy
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
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('NGO')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all ${
                  role === 'NGO'
                    ? 'border-[#00F59B] bg-[#00F59B]/10 text-[#00F59B]'
                    : 'border-zinc-700 bg-[#18181B] text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                NGO / Charity
              </button>
              <button
                type="button"
                onClick={() => setRole('DONOR')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all ${
                  role === 'DONOR'
                    ? 'border-[#00F59B] bg-[#00F59B]/10 text-[#00F59B]'
                    : 'border-zinc-700 bg-[#18181B] text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Donor
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              {role === 'NGO' ? 'NGO / Organization Name' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'NGO' ? 'e.g. Clean Earth Foundation' : 'e.g. Aarav Sharma'}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F59B] text-xs transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@organization.org"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00F59B] text-xs transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
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
                <UserPlus className="w-4 h-4 text-black" />
                <span>Complete Registration</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-[#00F59B] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
