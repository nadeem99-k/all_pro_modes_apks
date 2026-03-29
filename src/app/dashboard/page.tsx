"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Download, Zap, Settings, Shield, Bell, Loader2, CreditCard, Lock, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [unlockedApks, setUnlockedApks] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ credits: number; plan: string; display_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch latest APKs
      const { data: apkData } = await supabase
        .from("apks")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(5);
      if (apkData) setApps(apkData);

      // Fetch logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile (credits/plan/display_name)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("credits, plan, display_name")
          .eq("id", user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name || "");
        }
        setUserId(user.id);
        setUserEmail(user.email || "");
        setMemberSince(new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

        // Fetch unlocked APKs
        const { data: unlocked } = await supabase
          .from("unlocked_apks")
          .select("apk_id, apks(name, slug, image_url, version)")
          .eq("user_id", user.id);
        if (unlocked) setUnlockedApks(unlocked);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const isElite = profile?.plan === "elite";
  const credits = profile?.credits ?? 0;

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto relative z-10">

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-gold p-8 md:p-10 rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-gold-500/20 blur-[80px]" />
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
            Welcome back, {profile?.display_name || "VIP"} <Crown className="w-8 h-8 text-gold-500" />
          </h1>
          <p className="text-gold-400 font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {isElite ? "Elite Lifetime Member — Unlimited Access" : "Active Member"}
          </p>
        </div>
        <button onClick={() => setEditProfileOpen(true)} className="bg-black/50 hover:bg-black/70 border border-gold-500/30 text-white px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 z-10">
          <Settings className="w-4 h-4" /> Edit Profile
        </button>
      </motion.div>

      {/* Credits + Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`glass p-5 rounded-3xl border ${isElite ? "border-gold-500/40 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : credits > 0 ? "border-blue-500/20" : "border-white/5"}`}
        >
          <p className="text-gray-400 text-xs mb-1">Your Plan</p>
          <p className="text-2xl font-black text-white capitalize">{isElite ? "Elite ♾️" : profile?.plan || "Free"}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass p-5 rounded-3xl border border-white/5"
        >
          <p className="text-gray-400 text-xs mb-1">Credits Left</p>
          <p className={`text-2xl font-black ${isElite ? "text-gold-500" : credits > 0 ? "text-blue-400" : "text-gray-500"}`}>
            {isElite ? "∞" : credits}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass p-5 rounded-3xl border border-white/5"
        >
          <p className="text-gray-400 text-xs mb-1">Apps Unlocked</p>
          <p className="text-2xl font-black text-white">{isElite ? "All" : unlockedApks.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass p-5 rounded-3xl border border-white/5"
        >
          <Link href="/pricing" className="flex flex-col h-full">
            <p className="text-gray-400 text-xs mb-1">Buy More Credits</p>
            <p className="text-sm font-black text-gold-500 flex items-center gap-1 mt-auto">
              <CreditCard className="w-4 h-4" /> View Plans →
            </p>
          </Link>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Latest Mods */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-gold-500" /> Latest Premium Updates
            </h2>
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {apps.map((app, idx) => (
                  <div key={idx} className="glass p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-gold-500/30 transition-all">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-12 h-12 bg-dark-800 rounded-xl p-2 border border-white/10 flex-shrink-0 flex items-center justify-center font-black text-gold-500 uppercase">
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{app.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">Updated: {new Date(app.updated_at).toLocaleDateString()} • v{app.version}</p>
                          {app.price > 0 && !isElite && (
                            <span className="text-xs bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded-full font-bold border border-gold-500/20">
                              Rs {app.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={`/apps/${app.slug}`} className="w-full md:w-auto bg-white/5 hover:bg-gold-500 hover:text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Unlocked Apps */}
          {!isElite && unlockedApks.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6 text-green-500" /> My Unlocked Apps
              </h2>
              <div className="space-y-3">
                {unlockedApks.map((item: any, idx) => (
                  <div key={idx} className="glass p-4 rounded-2xl flex items-center justify-between border border-green-500/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 font-black">
                        {item.apks?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.apks?.name}</p>
                        <p className="text-xs text-gray-500">v{item.apks?.version}</p>
                      </div>
                    </div>
                    <Link href={`/apps/${item.apks?.slug}`} className="text-green-400 hover:text-green-300 text-xs font-bold flex items-center gap-1 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">

          {/* Low credits warning */}
          {!isElite && credits < 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="glass p-6 rounded-3xl border border-gold-500/30 bg-gold-500/5"
            >
              <CreditCard className="w-8 h-8 text-gold-500 mb-3" />
              <h3 className="font-bold text-lg mb-1 text-gold-400">
                {credits === 0 ? "No Credits Left" : `Only ${credits} Credit${credits === 1 ? "" : "s"} Left`}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Top up your credits to unlock more premium mods instantly.
              </p>
              <Link href="/pricing" className="block w-full py-3 bg-gold-500 text-black rounded-xl font-black text-center text-sm hover:bg-gold-400 transition-all">
                Buy Bundle →
              </Link>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-3xl">
            <h3 className="font-bold text-lg mb-4 text-gray-200">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-gray-300">
                <Bell className="w-5 h-5 text-gold-500" /> Join Telegram Alerts
              </button>
              <Link href="/request" className="w-full text-left p-4 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-gray-300 block">
                <Crown className="w-5 h-5 text-gold-500" /> Request a Mod
              </Link>
              <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 text-sm text-gray-300">
                <Shield className="w-5 h-5 text-gold-500" /> Contact VIP Support
              </button>
            </div>
          </motion.div>

          {/* Guarantee */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-gold p-6 rounded-3xl pb-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gold-500">100% Guarantee</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              If any app fails to work, submit a ticket and our team will patch it within 24 hours. Your access is fully protected.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editProfileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0d0d0d] border border-white/10 p-8 rounded-3xl w-full max-w-md relative shadow-2xl"
            >
              <button onClick={() => setEditProfileOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white">
                <X size={22} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-500 flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Edit Profile</h2>
                  <p className="text-xs text-gray-400">Update your account details</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-500 outline-none cursor-not-allowed mb-4"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-white/5 border border-white/10 focus:border-gold-500/50 rounded-xl px-4 py-3 text-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Member Since</label>
                  <p className="text-sm text-gold-500 font-bold">{memberSince}</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  setSavingProfile(true);
                  const supabase = createClient();
                  await supabase.from("profiles").update({ display_name: displayName }).eq("id", userId);
                  setProfile(prev => prev ? { ...prev, display_name: displayName } : null);
                  setSavingProfile(false);
                  setEditProfileOpen(false);
                }}
                disabled={savingProfile}
                className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black rounded-2xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
