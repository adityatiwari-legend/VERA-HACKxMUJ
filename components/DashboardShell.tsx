'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Building2,
  FileCheck,
  FileText,
  Eye,
  CheckCircle2,
  Lock,
  Layers,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Users,
  Cpu,
  Activity,
  User as UserIcon,
} from 'lucide-react';
import { User, UserRole } from '@/types';
import { Navbar } from './Navbar';
import Footer from './Footer';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if current route is an authenticated dashboard route
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/donor') ||
    pathname.startsWith('/ngo') ||
    pathname.startsWith('/auditor');

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

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
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

  // If not on a dashboard route, render the standard public top navigation + page + footer
  if (!isDashboardRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09090B]">
        <Navbar />
        <div className="flex-1 w-full">{children}</div>
        <Footer />
      </div>
    );
  }

  const role: UserRole = user?.role || 'DONOR';
  const jaipurId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  // Role-based navigation items as mandated in Requirement 6
  const getNavItems = () => {
    switch (role) {
      case 'NGO':
        return [
          {
            name: 'Overview',
            href: '/ngo/campaigns',
            icon: LayoutDashboard,
            exact: true,
          },
          {
            name: 'Campaigns',
            href: '/ngo/campaigns',
            icon: Building2,
            exact: false,
          },
          {
            name: 'Milestones',
            href: `/ngo/campaigns/${jaipurId}`,
            icon: Layers,
            exact: false,
          },
          {
            name: 'Proof & Evidence',
            href: `/ngo/campaigns/${jaipurId}/milestones/mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmm0001/proof`,
            icon: FileCheck,
            exact: false,
          },
          {
            name: 'Reports',
            href: `/campaigns/${jaipurId}/report`,
            icon: FileText,
            exact: false,
          },
        ];

      case 'AUDITOR':
        return [
          {
            name: 'Overview',
            href: '/auditor/dashboard',
            icon: LayoutDashboard,
            exact: true,
          },
          {
            name: 'Review Queue',
            href: '/auditor/dashboard',
            icon: Eye,
            exact: false,
          },
          {
            name: 'Evidence',
            href: '/auditor/dashboard',
            icon: FileCheck,
            exact: false,
          },
          {
            name: 'Approvals',
            href: '/auditor/dashboard',
            icon: CheckCircle2,
            exact: false,
          },
          {
            name: 'Releases',
            href: '/explorer/tx/0x7ad1dfc6c99d36b6fbfc7860433f6171a118280bf7d9e89791e3b79cd1d37c8a',
            icon: ShieldCheck,
            exact: false,
          },
        ];

      case 'ADMIN':
        return [
          {
            name: 'Overview',
            href: '/auditor/dashboard',
            icon: LayoutDashboard,
            exact: true,
          },
          {
            name: 'Users',
            href: '/dashboard',
            icon: Users,
            exact: false,
          },
          {
            name: 'Campaigns',
            href: '/campaigns',
            icon: Building2,
            exact: false,
          },
          {
            name: 'Audits',
            href: `/campaigns/${jaipurId}/audit`,
            icon: ShieldCheck,
            exact: false,
          },
          {
            name: 'System',
            href: '/explorer/tx/0x7ad1dfc6c99d36b6fbfc7860433f6171a118280bf7d9e89791e3b79cd1d37c8a',
            icon: Activity,
            exact: false,
          },
        ];

      case 'DONOR':
      default:
        return [
          {
            name: 'Overview',
            href: '/dashboard',
            icon: LayoutDashboard,
            exact: true,
          },
          {
            name: 'Campaigns',
            href: '/campaigns',
            icon: Compass,
            exact: false,
          },
          {
            name: 'My Donations',
            href: '/donor/donations',
            icon: HeartHandshake,
            exact: false,
          },
          {
            name: 'Trace Donations',
            href: `/donor/donations`,
            icon: Layers,
            exact: false,
          },
          {
            name: 'Public Audit',
            href: `/campaigns/${jaipurId}/audit`,
            icon: ShieldCheck,
            exact: false,
          },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-[#EDEDED]">
      {/* Top Universal Micro-Bar */}
      <Navbar />

      {/* Main Authenticated Body: Sidebar + Main Content */}
      <div className="flex-1 flex w-full relative">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-white/[0.08] bg-[#0C0C0E] transition-all duration-200 z-20 shrink-0 ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Sidebar Top: Role Badge & Collapse Toggle */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00F59B]" />
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-300">
                  {role} PORTAL
                </span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors ml-auto"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                    isActive
                      ? 'bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/25 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#00F59B]' : 'text-zinc-400'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Quick Context & Role Switcher */}
          {!collapsed && (
            <div className="p-3 border-t border-white/[0.08] bg-[#09090B]/60 space-y-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block px-1">
                SWITCH TEST ROLE
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                <Link
                  href="/dashboard"
                  className={`px-2 py-1 rounded text-center border transition-all ${
                    role === 'DONOR'
                      ? 'bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/40'
                      : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  DONOR
                </Link>
                <Link
                  href="/ngo/campaigns"
                  className={`px-2 py-1 rounded text-center border transition-all ${
                    role === 'NGO'
                      ? 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/40'
                      : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  NGO
                </Link>
                <Link
                  href="/auditor/dashboard"
                  className={`px-2 py-1 rounded text-center border transition-all ${
                    role === 'AUDITOR'
                      ? 'bg-[#6366F1]/15 text-[#6366F1] border-[#6366F1]/40'
                      : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
                  }`}
                >
                  AUDITOR
                </Link>
              </div>
            </div>
          )}

          {/* User Profile & Logout Bottom Bar */}
          <div className="p-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
            {!collapsed ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 shrink-0">
                    <UserIcon className="w-4 h-4 text-[#00F59B]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {user ? user.name : 'Session Active'}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 truncate">
                      {user ? user.email : 'VERA Protocol'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full py-2 flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Header Bar for Dashboard */}
        <div className="md:hidden w-full fixed top-[41px] left-0 right-0 z-30 bg-[#0C0C0E]/95 backdrop-blur-md border-b border-white/[0.08] px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-xs font-mono text-zinc-300 p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]"
          >
            <Menu className="w-4 h-4 text-[#00F59B]" />
            <span>{role} MENU</span>
          </button>
          <div className="text-[11px] font-mono text-zinc-400">
            {user?.name || 'VERA Dashboard'}
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-[#0C0C0E] border-r border-white/[0.08] h-full flex flex-col z-10 p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00F59B]" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {role} NAVIGATION
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                        isActive
                          ? 'bg-[#00F59B]/15 text-[#00F59B] border border-[#00F59B]/30 font-semibold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>SIGN OUT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 md:pt-6 pt-16 max-w-7xl mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default DashboardShell;
