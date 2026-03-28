"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Download, Clock, Zap, Settings, Shield, Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      const supabase = createClient();
      const { data } = await supabase.from("apks").select("*").order("updated_at", { ascending: false }).limit(5);
      if (data) setApps(data);
      setLoading(false);
    }
    fetchApps();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto relative z-10">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-gold p-8 md:p-10 rounded-3xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-gold-500/20 blur-[80px]" />
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
            Welcome back, VIP <Crown className="w-8 h-8 text-gold-500" />
          </h1>
          <p className="text-gold-400 font-medium flex items-center gap-2">
            <Shield className="w-4 h-4" /> Lifetime Member Status Active
          </p>
        </div>
        <button className="bg-black/50 hover:bg-black/70 border border-gold-500/30 text-white px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 z-10">
          <Settings className="w-4 h-4" /> Edit Profile
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
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
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Updated: {new Date(app.updated_at).toLocaleDateString()} • v{app.version}</p>
                      </div>
                    </div>
                    <Link href={`/apps/${app.slug}`} className="w-full md:w-auto bg-white/5 hover:bg-gold-500 hover:text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
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

          {/* Guarantee Reminder */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-gold p-6 rounded-3xl pb-8">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gold-500">100% Guarantee</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              If any app on our platform fails to work, simply submit a ticket through VIP Support and our team will patch it within 24 hours. Your lifetime access is fully protected.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
