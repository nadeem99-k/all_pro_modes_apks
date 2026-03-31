"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { CheckCircle, Download, Shield, Zap, Info, Settings, ArrowLeft, Loader2, CreditCard, X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AppDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const params = use(props.params);
  const slug = params.slug; // Using slug from the directory param
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [trxId, setTrxId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [isElite, setIsElite] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch App
      const { data: appData } = await supabase.from("apks").select("*").eq("slug", slug).single();
      if (appData) setApp(appData);

      // Check User & Unlock Status
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user && appData) {
        // Check if Elite member (Elite has access to everything)
        const { data: profile } = await supabase.from("profiles").select("plan, credits").eq("id", user.id).single();
        if (profile) {
          setCredits(profile.credits || 0);
          if (profile.plan === "elite") {
            setIsElite(true);
            setIsUnlocked(true);
          }
        }
        
        // Check specific unlock if not already unlocked
        if (!isElite) {
          const { data: unlock } = await supabase
            .from("unlocked_apks")
            .select("id")
            .eq("user_id", user.id)
            .eq("apk_id", appData.id)
            .single();
          if (unlock) setIsUnlocked(true);
        }
      }
      
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (showPaymentModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPaymentModal]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId || !screenshot) {
      setMessage({ type: "error", text: "Please provide both Transaction ID and Screenshot." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Upload Screenshot
      const formData = new FormData();
      formData.append("file", screenshot);
      const uploadRes = await fetch("/api/payment/upload-screenshot", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.error);

      // 2. Submit Transaction
      const res = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trx_id: trxId,
          amount: app.price,
          type: "single_apk",
          apk_id: app.id,
          screenshot_url: uploadData.url,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Payment submitted! Admin will approve it soon." });
        setTimeout(() => setShowPaymentModal(false), 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreditUnlock = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/payment/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apk_id: app.id }),
      });

      const result = await res.json();
      if (res.ok) {
        setIsUnlocked(true);
        setCredits(prev => prev - 1);
        setMessage({ type: "success", text: "Successfully unlocked with 1 Credit!" });
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            {isUnlocked || app.price === 0 ? (
              <a href={app.download_url} download target="_blank" rel="noopener noreferrer" className="bg-gold-500 hover:bg-gold-400 text-black px-8 py-3 rounded-full font-black text-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Download className="w-5 h-5" /> Download VIP Mod
              </a>
            ) : (
              <>
                {credits > 0 && (
                  <button 
                    onClick={handleCreditUnlock}
                    disabled={isSubmitting}
                    className="bg-gold-500 hover:bg-gold-400 text-black px-8 py-3 rounded-full font-black text-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />} 
                    Unlock with 1 Credit ({credits} left)
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    if (!user) {
                      window.location.href = "/login";
                    } else {
                      setShowPaymentModal(true);
                    }
                  }}
                  className={`${credits > 0 ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gold-500 hover:bg-gold-400 text-black'} px-8 py-3 rounded-full font-black text-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]`}
                >
                  <CreditCard className="w-5 h-5" /> Buy for Rs {app.price}
                </button>
              </>
            )}
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

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-y-auto px-4 py-8 sm:py-20 flex flex-col items-center"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="glass p-6 sm:p-10 rounded-[2.5rem] w-full max-w-xl relative"
            >
              <button 
                onClick={() => setShowPaymentModal(false)} 
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-[110] bg-white/5 p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Unlock VIP Access</h2>
                  <p className="text-gold-500 font-bold">Total Price: Rs {app.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-dark-800 p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-gold-500/30 transition-all">
                  <div className="absolute top-[-20%] right-[-20%] w-16 h-16 bg-gold-500/10 blur-xl rounded-full" />
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">JazzCash</p>
                  <p className="text-lg font-black text-white">03139183850</p>
                  <p className="text-xs text-gold-500 font-bold">HAMEER ALI KALHORO</p>
                </div>
                <div className="bg-dark-800 p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-gold-500/30 transition-all">
                  <div className="absolute top-[-20%] right-[-20%] w-16 h-16 bg-gold-500/10 blur-xl rounded-full" />
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">EasyPaisa</p>
                  <p className="text-lg font-black text-white">03400324526</p>
                  <p className="text-xs text-gold-500 font-bold">Waseemali</p>
                </div>
              </div>

              <div className="bg-gold-500/5 border border-gold-500/20 p-4 rounded-2xl mb-8">
                <p className="text-sm text-gray-300 leading-relaxed">
                  <span className="text-gold-500 font-bold">Instructions:</span> Send exactly <span className="text-white font-bold">Rs {app.price}</span> to either account above. After sending, enter the Transaction ID and upload a screenshot of the confirmation below.
                </p>
                <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Need Help? WhatsApp Support: <span className="text-white font-bold">+92 341 0720377</span>
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Transaction ID (TRX ID)</label>
                  <input 
                    type="text" 
                    required 
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="Enter the 11-digit TRX ID"
                    className="w-full bg-dark-800 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-gold-500 transition-all shadow-inner" 
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Proof of Payment (Screenshot)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 bg-dark-800 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-gold-500/30 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-500 mb-2" />
                      <p className="text-sm text-gray-400 font-bold">{screenshot ? screenshot.name : "Click to upload screenshot"}</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      required 
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {message.text && (
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl text-sm font-bold text-center ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"}`}
                  >
                    {message.text}
                  </motion.p>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting || !trxId || !screenshot}
                  className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black rounded-2xl font-black text-lg transition-all flex justify-center items-center gap-2 shadow-[0_0_25px_rgba(234,179,8,0.3)] disabled:opacity-30 disabled:grayscale transform active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    !trxId || !screenshot ? "Complete All Fields Above" : "Verify & Submit Review"
                  )}
                </button>
              </form>

              <p className="mt-8 text-[10px] text-center text-gray-500 leading-relaxed uppercase tracking-tighter">
                Payments are verified manually by the VIP team. <br/>
                Typical response time: <span className="text-gold-500 font-bold">5 - 30 Minutes</span> • ID: {app.id.substring(0,8)}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
