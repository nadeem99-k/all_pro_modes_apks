"use client";

import Link from "next/link";
import { Shield, Crown, LogOut, Menu, X, Home, LayoutGrid, Tag, User, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('display_name, credits, plan').eq('id', userId).single();
      if (data) setProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between" suppressHydrationWarning>
          <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <Shield className="w-8 h-8 text-gold-500" />
            <span>VIP<span className="text-gold-500">MODS</span></span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-gold-400 transition-colors flex items-center gap-2"><Home size={16}/> Home</Link>
            <Link href={session ? "/apps" : "/login"} className="hover:text-gold-400 transition-colors flex items-center gap-2"><LayoutGrid size={16}/> Catalog</Link>
            <Link href="/pricing" className="hover:text-gold-400 transition-colors flex items-center gap-2"><Tag size={16}/> Pricing</Link>
            {session && <Link href="/dashboard" className="hover:text-gold-400 transition-colors">Dashboard</Link>}
          </div>

          <div className="flex items-center gap-3">
            {!session ? (
              <Link href="/login" className="hidden sm:flex bg-gold-500 hover:bg-gold-400 text-black px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                <Crown className="w-4 h-4" /> VIP Login
              </Link>
            ) : (
              <div className="relative hidden sm:block">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gold-500 hover:bg-gold-400 text-black font-black transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                >
                  {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : <User size={18} />}
                </button>
                
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 bg-dark-900 border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-2 bg-white/[0.02]">
                        <p className="text-sm font-bold truncate text-white mb-1">{profile?.display_name || "VIP Member"}</p>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-gold-500 uppercase tracking-widest flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            {profile?.plan === 'elite' ? 'Elite Unlimited' : `${profile?.credits || 0} Credits`}
                          </span>
                        </div>
                      </div>
                      <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Crown className="w-4 h-4 text-gold-500" /> Dashboard
                      </Link>
                      <button onClick={() => { setProfileOpen(false); handleSignOut(); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
            <Link href={session ? "/apps" : "/login"} onClick={() => setMobileMenuOpen(false)} className="bg-dark-800 border border-white/5 p-4 rounded-full flex items-center gap-3"><LayoutGrid className="text-gold-500"/> App Catalog</Link>
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
