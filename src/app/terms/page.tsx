"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-10 md:p-16 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <h1 className="text-4xl md:text-5xl font-black mb-6">Terms of <span className="text-gold-500">Service</span></h1>
        <p className="text-gray-400 mb-10 text-sm">Last Updated: March {new Date().getFullYear()}</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using VIP Mods ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Lifetime VIP Guarantee</h2>
            <p>Our "Lifetime Guarantee" ensures that if any currently hosted Mod APK ceases to function due to developer patches, our team will allocate resources to provide an updated, working file within a reasonable timeframe (typically 24-48 hours). This guarantee applies only to apps listed in our active catalog.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Prohibited Conduct</h2>
            <p>Users are strictly prohibited from:</p>
            <ul className="list-disc list-inside mt-2 space-y-2 text-gray-400">
              <li>Reselling or redistributing downloaded APK files.</li>
              <li>Sharing VIP account credentials with unauthorized users.</li>
              <li>Attempting to bypass or exploit the platform's authentication and RLS security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Refunds</h2>
            <p>Due to the digital and instant nature of our VIP Premium Mod catalog, all sales are final. We provide comprehensive guarantees on functionality in lieu of direct monetary refunds.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
          <Link href="/" className="text-gold-500 font-bold hover:underline">&larr; Return Home</Link>
          <Shield className="w-8 h-8 text-gold-500/50" />
        </div>
      </motion.div>
    </div>
  );
}
