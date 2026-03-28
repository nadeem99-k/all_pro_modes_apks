"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-10 md:p-16 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <h1 className="text-4xl md:text-5xl font-black mb-6">Privacy <span className="text-gold-500">Policy</span></h1>
        <p className="text-gray-400 mb-10 text-sm">Last Updated: March {new Date().getFullYear()}</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Data Collection</h2>
            <p>To provide you with secure VIP access, we collect essential information including your email address (via Supabase Auth) and basic device analytics to ensure smooth delivery of our APK files. We do not collect unnecessary personal tracking data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Security</h2>
            <p>Your authentication data is fully encrypted and handled by Supabase (PostgreSQL RLS). Our application does not read or store your payment details; all transactions are processed entirely through secure Gateway partners (EasyPaisa/JazzCash) using rigorous bank-level encryption.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Cloudflare R2 Delivery</h2>
            <p>Our files are delivered anonymously via secure Cloudflare R2 infrastructure. While download bandwidth is monitored on an aggregate level to prevent abuse, individual download histories are kept strictly private to your respective account dashboard.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
          <Link href="/" className="text-gold-500 font-bold hover:underline">&larr; Return Home</Link>
          <Lock className="w-8 h-8 text-gold-500/50" />
        </div>
      </motion.div>
    </div>
  );
}
