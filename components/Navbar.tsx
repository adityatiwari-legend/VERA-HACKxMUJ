'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, LogOut, LayoutDashboard, PlusCircle, UserCheck } from 'lucide-react';
import { User } from '@/types';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:text-emerald-400 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>Fund<span className="text-emerald-400">Trail</span></span>
            </Link>

            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
              Phase 1: Foundation
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'NGO' && (
                  <>
                    <Link
                      href="/ngo/campaigns"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname.startsWith('/ngo/campaigns') && pathname !== '/ngo/campaigns/new'
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link
                      href="/ngo/campaigns/new"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        pathname === '/ngo/campaigns/new'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-600/90 text-white hover:bg-emerald-600'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      New Campaign
                    </Link>
                  </>
                )}

                {/* User info and role */}
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{user.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              !loading && (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
                  >
                    Register NGO
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
