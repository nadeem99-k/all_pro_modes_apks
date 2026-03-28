"use client";

import Link from "next/link";
import { Shield, Crown, LogOut, Menu, X, Home, LayoutGrid, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <Shield className="w-8 h-8 text-gold-500" />
            <span>VIP<span className="text-gold-500">MODS</span></span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-gold-400 transition-colors flex items-center gap-2"><Home size={16}/> Home</Link>
            <Link href="/apps" className="hover:text-gold-400 transition-colors flex items-center gap-2"><LayoutGrid size={16}/> Catalog</Link>
            <Link href="/pricing" className="hover:text-gold-400 transition-colors flex items-center gap-2"><Tag size={16}/> Pricing</Link>
            {session && <Link href="/dashboard" className="hover:text-gold-400 transition-colors">Dashboard</Link>}
          </div>

          <div className="flex items-center gap-3">
            {!session ? (
              <Link href="/login" className="hidden sm:flex bg-gold-500 hover:bg-gold-400 text-black px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Crown className="w-4 h-4" /> VIP Login
              </Link>
            ) : (
              <>
                <Link href="/dashboard" className="hidden sm:flex bg-gold-500 hover:bg-gold-400 text-black px-5 py-2.5 rounded-full font-bold transition-all items-center gap-2">
                  <Crown className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={handleSignOut} className="hidden sm:flex glass hover:bg-red-500/20 text-gray-400 hover:text-red-400 p-2.5 rounded-full transition-all" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden glass p-2 rounded-xl text-gold-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-dark-900/95 backdrop-blur-xl md:hidden p-6 h-screen">
          <div className="flex flex-col gap-6 text-lg font-bold text-gray-200">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="bg-dark-800 border border-white/5 p-4 rounded-full flex items-center gap-3"><Home className="text-gold-500"/> Home</Link>
            <Link href="/apps" onClick={() => setMobileMenuOpen(false)} className="bg-dark-800 border border-white/5 p-4 rounded-full flex items-center gap-3"><LayoutGrid className="text-gold-500"/> App Catalog</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="bg-dark-800 border border-white/5 p-4 rounded-full flex items-center gap-3"><Tag className="text-gold-500"/> Pricing & Tiers</Link>
            
            <hr className="border-white/10 my-4" />
            
            {!session ? (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="bg-gold-500 text-black p-4 rounded-full flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <Crown /> VIP Login
              </Link>
            ) : (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="bg-gold-500 text-black p-4 rounded-full flex items-center justify-center gap-3">
                  <Crown /> Member Dashboard
                </Link>
                <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="bg-red-500/10 text-red-500 p-4 rounded-full flex items-center justify-center gap-3 border border-red-500/20">
                  <LogOut /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
