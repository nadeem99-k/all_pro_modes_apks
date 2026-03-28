"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { CheckCircle, Download, Shield, Zap, Info, Settings, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AppDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const slug = params.id; // Using slug as id from the directory param
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApp() {
      const supabase = createClient();
      const { data } = await supabase.from("apks").select("*").eq("slug", slug).single();
      if (data) setApp(data);
      setLoading(false);
    }
    fetchApp();
  }, [slug]);
  
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (!app) return notFound();

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-5xl mx-auto relative z-10">
      <Link href="/apps" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-3xl mb-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-dark-800 p-4 border border-white/5 shadow-2xl flex-shrink-0">
          {app.image_url ? (
            <img src={app.image_url} alt={`${app.name} icon`} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <Zap className="w-full h-full text-gold-500 p-2" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-black">{app.name}</h1>
            <div className="glass-gold px-4 py-1.5 rounded-full text-sm font-bold text-gold-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {app.status}
            </div>
          </div>
          <p className="text-gray-400 text-lg mb-6">{app.category} • Version {app.version} • {app.size}</p>
          
          <div className="flex flex-wrap gap-4">
            <a href={app.download_url} download target="_blank" rel="noopener noreferrer" className="bg-gold-500 hover:bg-gold-400 text-black px-8 py-3 rounded-full font-black text-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              <Download className="w-5 h-5" /> Download VIP Mod
            </a>
            <p className="text-sm text-gray-500 flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
              <Shield className="w-4 h-4 text-gold-500" /> 100% Virus-Free & Guaranteed
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Main Info */}
        <div className="md:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-gold-500" /> What is {app.name}?
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">{app.description}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-gold-500" /> How It Works
            </h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{app.how_it_works}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-gold p-8 rounded-3xl border border-gold-500/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gold-400">
              <Download className="w-6 h-6" /> Step-by-Step Installation
            </h2>
            <ol className="space-y-4">
              {app.install_steps.map((step: string, idx: number) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-gray-200 mt-1">{step}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-gold-500" /> Premium Features
            </h3>
            <ul className="space-y-3">
              {app.features.map((feat: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <span className="text-gray-300 text-sm leading-tight">{feat}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Guarantee Box */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-3xl bg-gradient-to-br from-dark-800 to-black border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/20 blur-[50px]" />
            <Shield className="w-10 h-10 text-gold-500 mb-4 relative z-10" />
            <h4 className="text-xl font-bold mb-2 relative z-10">Lifetime Guarantee</h4>
            <p className="text-gray-400 text-sm mb-4 relative z-10">
              If {app.name} ever stops working, VIP members can download the updated patch immediately here.
            </p>
            <Link href="/pricing" className="text-gold-500 font-bold text-sm hover:underline relative z-10">
              Upgrade to VIP &rarr;
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
