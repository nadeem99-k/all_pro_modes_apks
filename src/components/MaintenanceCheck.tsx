"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export function MaintenanceCheck({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkMaintenance() {
      if (window.location.pathname.startsWith('/admin')) return;
      
      const { data } = await supabase.from('site_settings').select('value').eq('id', 'maintenance_mode').single();
      if (data?.value?.enabled) {
        setMaintenance(data.value);
      }
    }
    checkMaintenance();
  }, []);

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
