"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState<any>(null);
  // Memoize the client so only ONE instance is created per mount,
  // preventing multiple clients from racing over the same auth lock.
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function checkMaintenance() {
      if (window.location.pathname.startsWith('/admin')) return;

      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('id', 'maintenance_mode')
          .single();

        if (!cancelled && data?.value?.enabled) {
          setMaintenance(data.value);
        }
      } catch {
        // Network unavailable or Supabase unreachable – skip silently
      }
    }

    checkMaintenance();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  if (maintenance) {
    return (
      <div className={`${inter.className} min-h-screen bg-dark-900 text-white flex items-center justify-center p-6 text-center fixed inset-0 z-[9999]`}>
        <div className="max-w-md space-y-6">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-red-500">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-4xl font-black italic">MAINTENANCE</h1>
          <p className="text-gray-400 leading-relaxed">{maintenance.message}</p>
          <div className="pt-8 flex items-center justify-center gap-2 text-gold-500 font-bold text-sm uppercase tracking-widest">
            <AlertTriangle size={16} />
            Platform Secured
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
