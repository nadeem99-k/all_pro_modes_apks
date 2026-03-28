"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap, Shield, Crown } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-black mb-6">Choose Your <span className="text-gold-500">VIP</span> Tier</h1>
        <p className="text-xl text-gray-400">Unlock every application on our platform. 100% Guaranteed Updates. No Ads. No limits.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Monthly Plan */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 md:p-10 rounded-3xl relative overflow-hidden flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">Monthly VIP</h3>
            <p className="text-gray-400">Perfect for trying out our premium mods.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-black">Rs 300</span>
            <span className="text-gray-400"> / month</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            {["Access to all 50+ VIP Mods", "Ad-free experience", "Fast download speeds (Cloudflare R2)", "Standard Support"].map((feat, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="text-gray-300">{feat}</span>
              </li>
            ))}
          </ul>
          <Link href="/dashboard" className="w-full py-4 glass text-white hover:bg-gold-500 hover:text-black rounded-full font-bold text-lg transition-all flex justify-center">
            Get Monthly VIP
          </Link>
        </motion.div>

        {/* Lifetime Plan */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-gold p-8 md:p-10 rounded-3xl relative overflow-hidden border border-gold-500/30 shadow-[0_0_40px_rgba(234,179,8,0.15)] flex flex-col"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/20 blur-[50px] pointer-events-none" />
          <div className="absolute top-6 right-6">
            <Crown className="w-8 h-8 text-gold-500" />
          </div>
          <div className="mb-8">
            <div className="inline-block px-3 py-1 bg-gold-500 text-black text-xs font-bold rounded-full mb-4">Most Popular</div>
            <h3 className="text-2xl font-bold mb-2 text-gold-400">Lifetime VIP</h3>
            <p className="text-gray-400">The ultimate experience. Pay once, enjoy forever.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-black text-white">Rs 2000</span>
            <span className="text-gray-400"> / lifetime</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow relative z-10">
            {["Access to all 50+ VIP Mods", "100% Lifetime Guarantee on Updates", "Priority 'Request a Mod' feature", "VIP Telegram/Discord Notifications", "Unlimited high-speed downloads"].map((feat, i) => (
              <li key={i} className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200 font-medium">{feat}</span>
              </li>
            ))}
          </ul>
          <Link href="/dashboard" className="w-full py-4 bg-gold-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:bg-gold-400 rounded-full font-black text-lg transition-all flex justify-center relative z-10">
            Unlock Lifetime VIP
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
