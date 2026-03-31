"use client";

import Link from 'next/link';
import { Shield, Mail, Webhook } from 'lucide-react';
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Footer() {
  const [session, setSession] = useState<any>(null);
  const [year, setYear] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setYear(new Date().getFullYear());
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase.auth]);

  return (
    <footer className="border-t border-white/5 bg-black/50 backdrop-blur-md pt-16 pb-8 px-6 mt-auto" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12" suppressHydrationWarning>
        <div className="md:col-span-2">
          <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-gold-500" />
            <span>VIP<span className="text-gold-500">MODS</span></span>
          </Link>
          <p className="text-gray-400 max-w-sm leading-relaxed mb-6">
            The world's most premium, 100% guaranteed modding platform. Secure, tested, and constantly updated for our elite lifetime members.
          </p>
          <div className="flex text-sm text-gold-500 font-bold gap-4">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4"/> SSL Secured</div>
            <div className="flex items-center gap-2"><Webhook className="w-4 h-4"/> 24/7 API</div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4"/> Support</div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6">Navigation</h4>
          <ul className="space-y-4 text-gray-400 text-sm font-medium">
            <li><Link href="/" className="hover:text-gold-500 transition-colors">Home</Link></li>
            <li><Link href={session ? "/apps" : "/login"} className="hover:text-gold-500 transition-colors">VIP Catalog</Link></li>
            <li><Link href="/pricing" className="hover:text-gold-500 transition-colors">Pricing & Tiers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6">Legal & Support</h4>
          <ul className="space-y-4 text-gray-400 text-sm font-medium">
            <li><Link href="/terms" className="hover:text-gold-500 transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-gold-500 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/request" className="hover:text-gold-500 transition-colors">Request a Mod API</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-sm text-gray-600 font-medium">
        © {year ?? new Date().getFullYear()} VIP Mods Platform. All rights reserved. Not affiliated with Google Play or Apple App Store.
      </div>
    </footer>
  );
}
