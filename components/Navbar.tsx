"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Radio,
  ShieldCheck,
  Compass,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Building2,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { User } from "@/types";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentBlock, setCurrentBlock] = useState(194821);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [networkName, setNetworkName] = useState("SEPOLIA TESTNET / HARDHAT");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch live blockchain block number
  useEffect(() => {
    fetch('/api/blockchain/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.blockNumber) {
          setCurrentBlock(data.blockNumber);
        }
        if (data?.network) {
          setNetworkName(data.network.toUpperCase());
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      setCurrentBlock((prev) => prev + 1);
    }, 4500);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch active user session
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
      .finally(() => setLoadingUser(false));
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

  const jaipurId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

  return (
    <>
      {/* 1. Top System Micro-Ticker */}
      <div className="w-full bg-[#09090B] border-b border-white/[0.08] text-[10px] font-mono tracking-wider overflow-hidden py-1 px-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-4 text-zinc-400">
          <div className="flex items-center gap-1.5 text-[#00F59B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B] animate-ping" />
            <span className="font-semibold text-zinc-200">{networkName}</span>
          </div>
          <span className="text-zinc-600">{"//"}</span>
          <span className="text-zinc-400 hidden sm:inline">1,429 TXS RECORDED</span>
          <span className="text-zinc-600 hidden sm:inline">{"//"}</span>
          <span className="text-zinc-400 hidden md:inline">LATENCY: 12ms</span>
          <span className="text-zinc-600 hidden md:inline">{"//"}</span>
          <span className="text-zinc-300">BLOCK #{currentBlock}</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400">
          <div className="flex items-center gap-1 text-zinc-400">
            <Radio className="w-3 h-3 text-[#00F59B]" />
            <span className="hidden sm:inline">INTEGRITY: 100% AUDITED</span>
          </div>
          <span className="text-zinc-600">{"//"}</span>
          <span className="text-[#00F59B] font-medium">SYS: ONLINE</span>
        </div>
      </div>

      {/* 2. Main Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-30 w-full transition-all duration-200 ${
          isScrolled
            ? "bg-[#09090B]/95 backdrop-blur-md border-b border-white/[0.12] shadow-2xl py-2.5"
            : "bg-[#09090B]/85 backdrop-blur-sm border-b border-white/[0.08] py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-8 h-8 bg-[#121215] border border-white/[0.12] group-hover:border-[#00F59B]/60 transition-colors rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#00F59B] group-hover:shadow-[0_0_8px_#00F59B] transition-all" />
              <div className="absolute -top-1 -right-1 font-mono text-[7px] text-[#00F59B]">●</div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  VERA
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/[0.06] border border-white/[0.08] text-[#00F59B] rounded">
                  v0.2
                </span>
              </div>
              <span className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">
                PROGRAMMABLE TRUST LAYER
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs text-zinc-400">
            <Link
              href="/campaigns"
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/campaigns') && !pathname.includes('/audit')
                  ? 'text-[#00F59B] font-semibold'
                  : ''
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#00F59B]" />
              <span>CAMPAIGNS</span>
            </Link>

            <Link
              href="/#pipeline"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>HOW IT WORKS</span>
            </Link>

            <Link
              href={`/campaigns/${jaipurId}/audit`}
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                pathname.includes('/audit') ? 'text-[#00F59B] font-semibold' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="text-zinc-300">PUBLIC AUDIT</span>
            </Link>

            <Link
              href="/ngos"
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                pathname.startsWith('/ngos') ? 'text-[#00F59B] font-semibold' : ''
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>NGO DIRECTORY</span>
            </Link>

            {/* Role-Specific Navigation */}
            {user?.role === 'DONOR' && (
              <Link
                href="/donor/donations"
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/donor') ? 'text-[#00F59B] font-semibold' : ''
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#00F59B]" />
                <span>MY DONATIONS</span>
              </Link>
            )}

            {(user?.role === 'AUDITOR' || user?.role === 'ADMIN') && (
              <Link
                href="/auditor/dashboard"
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/auditor') ? 'text-[#6366F1] font-semibold' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#6366F1]" />
                <span className="text-[#818CF8]">AUDITOR HUB</span>
              </Link>
            )}

            {user?.role === 'NGO' && (
              <Link
                href="/ngo/campaigns"
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/ngo') ? 'text-[#00F59B] font-semibold' : ''
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#00F59B]" />
                <span>NGO HUB</span>
              </Link>
            )}
          </nav>

          {/* Right Actions: User Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/[0.08]">
                <div className="text-right">
                  <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
                  <span className="text-[9px] font-mono text-[#00F59B] leading-none uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              !loadingUser && (
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    SIGN IN
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 text-xs font-mono bg-[#00F59B] text-black font-semibold rounded-lg hover:bg-[#00F59B]/90 transition-all shadow-[0_0_12px_rgba(0,245,155,0.3)]"
                  >
                    GET STARTED
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.08] bg-[#0E0E12] px-4 py-4 space-y-3 font-mono text-xs">
            <Link
              href="/campaigns"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-zinc-300 hover:text-[#00F59B]"
            >
              <Compass className="w-4 h-4 text-[#00F59B]" />
              <span>EXPLORE CAMPAIGNS</span>
            </Link>

            <Link
              href={`/campaigns/${jaipurId}/audit`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-zinc-300 hover:text-[#06B6D4]"
            >
              <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
              <span>PUBLIC AUDIT TRAIL</span>
            </Link>

            <Link
              href="/ngos"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-zinc-300 hover:text-white"
            >
              <Building2 className="w-4 h-4 text-zinc-400" />
              <span>NGO REPUTATION DIRECTORY</span>
            </Link>

            {user ? (
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-[10px] text-[#00F59B]">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-white/[0.08] flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center bg-white/[0.05] border border-white/[0.1] rounded text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center bg-[#00F59B] text-black font-semibold rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}

export default Navbar;
