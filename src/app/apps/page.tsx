"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, CheckCircle, Smartphone, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AppsCatalog() {
  const [search, setSearch] = useState("");
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApps() {
      const supabase = createClient();
      const { data, error } = await supabase.from("apks").select("*").order("name");
      if (data) setApps(data);
      setLoading(false);
    }
    fetchApps();
  }, []);
  
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) || 
    app.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black mb-4">VIP <span className="text-gold-500">Catalog</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">Browse our live collection of fully guaranteed working modded applications securely fetched from the database.</p>
        
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto flex items-center mb-8">
          <Search className="absolute left-6 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for Netflix, Video Editors, Music..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-800/80 backdrop-blur-md border border-white/10 text-white pl-14 pr-6 py-4 rounded-full focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gold-500">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No VIP Apps found for "{search}".</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={app.id}
              className="glass p-6 rounded-3xl hover:border-gold-500/30 transition-all group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-2xl bg-dark-800 p-2 border border-white/5 shadow-xl">
                  {app.image_url ? (
                    <img src={app.image_url} alt={`${app.name} icon`} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Smartphone className="w-full h-full text-gold-500 p-1" />
                  )}
                </div>
                <div className="glass-gold px-3 py-1 rounded-full text-xs font-bold text-gold-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {app.status}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-1">{app.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{app.category} • v{app.version}</p>
              
              <div className="space-y-2 mb-6 flex-grow">
                {app.features.slice(0, 3).map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-400 flex-shrink-0" />
                    <span className="leading-tight">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">{app.size}</span>
                  <span className={`text-xs font-black mt-0.5 ${app.price > 0 ? "text-gold-500" : "text-green-400"}`}>
                    {app.price > 0 ? `Rs ${app.price}` : "FREE"}
                  </span>
                </div>
                <Link href={`/apps/${app.slug}`} className="glass hover:bg-gold-500 hover:text-black py-2.5 px-6 rounded-full text-sm font-bold transition-all flex items-center gap-2 hover:border-gold-400">
                  <Download className="w-4 h-4" />
                  {app.price > 0 ? "View & Unlock" : "View & DL"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
