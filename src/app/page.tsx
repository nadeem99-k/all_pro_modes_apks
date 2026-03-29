"use client";

import { motion } from "framer-motion";
import { Shield, Smartphone, Zap, Download } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase.auth]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mt-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-gold text-gold-400 text-sm font-bold mb-8">
            <Zap className="w-4 h-4" />
            <span>100% Ban-Free Guarantee on all Lifetime Mods</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">Premium</span> Experience.
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get instant access to top-tier modified applications. Netflix, CapCut, Spotify, and more. Guaranteed updates, no ads, endless features.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={session ? "/apps" : "/login"} className="w-full sm:w-auto px-8 py-4 bg-gold-500 text-black rounded-full font-black text-lg hover:bg-gold-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <Download className="w-5 h-5" />
              Browse Mods
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 glass text-white hover:bg-white/5 rounded-full font-bold text-lg transition-all flex justify-center">
              View Pricing
            </Link>
          </div>
        </motion.div>

        {/* Features / Guarantee Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-32">
          {[
            {
              icon: <Shield className="w-8 h-8 text-gold-500" />,
              title: "100% Working Guarantee",
              desc: "If an app stops working, we update it immediately. Lifetime users covered forever."
            },
            {
              icon: <Smartphone className="w-8 h-8 text-gold-500" />,
              title: "Fully Unlocked",
              desc: "No watermarks, no ads, all premium VIP features unlocked right out of the box."
            },
            {
              icon: <Zap className="w-8 h-8 text-gold-500" />,
              title: "Instant Delivery",
              desc: "Get access to your Mod APKs instantly after purchase via EasyPaisa or JazzCash."
            }
          ].map((feature, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              key={i} 
              className="glass p-8 rounded-3xl relative overflow-hidden group hover:border-gold-500/30 transition-all"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
