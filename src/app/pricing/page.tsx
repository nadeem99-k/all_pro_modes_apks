"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Zap, Crown, X, Copy, Loader2, Shield, Star, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EASYPAISA_NUMBER = "03400324526"; 
const JAZZCASH_NUMBER = "03139183850";
const EASYPAISA_NAME = "Waseemali";
const JAZZCASH_NAME = "HAMEER ALI KALHORO";

const bundles = [
  {
    id: "bundle_starter",
    name: "Starter Pack",
    emoji: "🥉",
    price: 500,
    credits: 10,
    label: "10 App Unlocks",
    description: "Pick any 10 premium mods and unlock them forever.",
    features: [
      "10 App Unlocks (your choice)",
      "Lifetime access to chosen apps",
      "100% Working Guarantee",
      "Standard Support",
    ],
    color: "border-white/10",
    glow: "",
    badge: null,
    btnStyle: "glass text-white hover:bg-white/10",
    icon: <Zap className="w-6 h-6 text-gray-300" />,
  },
  {
    id: "bundle_pro",
    name: "Pro Bundle",
    emoji: "🥈",
    price: 1500,
    credits: 50,
    label: "50 App Unlocks",
    description: "The power user's choice. Unlock 50 premium mods.",
    features: [
      "50 App Unlocks (your choice)",
      "Lifetime access to chosen apps",
      "Priority 'Request a Mod' feature",
      "Fast-track Support",
    ],
    color: "border-blue-500/30",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.1)]",
    badge: "Best Value",
    btnStyle: "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30",
    icon: <Star className="w-6 h-6 text-blue-400" />,
  },
  {
    id: "bundle_elite",
    name: "VIP Elite",
    emoji: "🥇",
    price: 3000,
    credits: -1,
    label: "UNLIMITED — All Apps Forever",
    description: "Every single APK, forever. New uploads included automatically.",
    features: [
      "ALL current & future APKs unlocked",
      "100% Lifetime Guarantee",
      "VIP Priority Support (24h)",
      "Early Access to new mods",
      "Request a Mod — Free",
    ],
    color: "border-gold-500/40",
    glow: "shadow-[0_0_40px_rgba(234,179,8,0.15)]",
    badge: "Most Popular",
    btnStyle: "bg-gold-500 text-black hover:bg-gold-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    icon: <Crown className="w-6 h-6 text-gold-500" />,
  },
];

export default function PricingPage() {
  const [selectedBundle, setSelectedBundle] = useState<typeof bundles[0] | null>(null);
  const [trxId, setTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copiedNum, setCopiedNum] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const copyNumber = (num: string, label: string) => {
    navigator.clipboard.writeText(num.replace(/-/g, ""));
    setCopiedNum(label);
    setTimeout(() => setCopiedNum(""), 2000);
  };

  const handleSubmit = async () => {
    if (!trxId.trim() || trxId.trim().length < 6) {
      setError("Please enter a valid Transaction ID (at least 6 characters).");
      return;
    }
    setError("");
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to purchase a bundle.");
      setSubmitting(false);
      return;
    }

    try {
      let screenshotUrl = null;
      if (screenshot) {
        const formData = new FormData();
        formData.append("file", screenshot);
        const uploadRes = await fetch("/api/payment/upload-screenshot", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) throw new Error(uploadData.error);
        screenshotUrl = uploadData.url;
      }

      const res = await fetch("/api/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          trx_id: trxId.trim(), 
          amount: selectedBundle!.price, 
          type: selectedBundle!.id,
          screenshot_url: screenshotUrl
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  const closeModal = () => {
    setSelectedBundle(null);
    setTrxId("");
    setError("");
    setSubmitted(false);
    setSubmitting(false);
    setScreenshot(null);
  };

  useEffect(() => {
    if (selectedBundle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedBundle]);

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold-500/30 text-gold-400 text-sm font-bold mb-6">
          <Shield className="w-4 h-4" /> 100% Money-Back Guarantee on all plans
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-6">
          Choose Your <span className="text-gold-500">VIP</span> Bundle
        </h1>
        <p className="text-xl text-gray-400">
          Buy a credit bundle. Each credit unlocks <strong className="text-white">one premium mod forever</strong>. Elite unlocks everything, unlimited.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-16">
        <p className="text-sm text-gray-500">
          Want just one app?{" "}
          <a href="/apps" className="text-gold-400 hover:underline font-bold">Browse the catalog</a>
          {" "}— each APK shows its individual price.
        </p>
      </motion.div>

      {/* Bundle Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
        {bundles.map((bundle, i) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass p-8 rounded-3xl relative overflow-hidden flex flex-col border ${bundle.color} ${bundle.glow} hover:scale-[1.02] transition-transform duration-200`}
          >
            {bundle.badge && (
              <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-black border ${bundle.id === "bundle_elite" ? "bg-gold-500 text-black border-gold-400" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>
                {bundle.badge}
              </div>
            )}
            {bundle.id === "bundle_elite" && (
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 blur-[60px] pointer-events-none" />
            )}

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{bundle.emoji}</span>
            </div>

            <h3 className={`text-2xl font-black mb-1 ${bundle.id === "bundle_elite" ? "text-gold-400" : "text-white"}`}>
              {bundle.name}
            </h3>
            <p className="text-sm text-gray-400 mb-6">{bundle.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-black text-white">Rs {bundle.price.toLocaleString()}</span>
              <span className="text-gray-400 text-sm ml-2">one-time</span>
              <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-black ${bundle.id === "bundle_elite" ? "bg-gold-500/20 text-gold-400" : "bg-white/5 text-gray-300"}`}>
                {bundle.label}
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-grow relative z-10">
              {bundle.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${bundle.id === "bundle_elite" ? "text-gold-500" : bundle.id === "bundle_pro" ? "text-blue-400" : "text-gray-400"}`} />
                  <span className="text-gray-300">{feat}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => { setSelectedBundle(bundle); setSubmitted(false); setTrxId(""); setError(""); }}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all relative z-10 flex items-center justify-center gap-2 ${bundle.btnStyle}`}
            >
              {bundle.icon} Buy Now — Rs {bundle.price.toLocaleString()}
            </button>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto glass p-8 rounded-3xl border border-white/5"
      >
        <h2 className="text-2xl font-black mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            { step: "1", title: "Pick a Bundle", desc: "Choose the plan that fits your needs and click Buy Now." },
            { step: "2", title: "Send Payment", desc: "Send PKR via EasyPaisa or JazzCash and enter your TRX ID." },
            { step: "3", title: "Get Unlocked", desc: "Admin approves within minutes. Credits appear in your account instantly." },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 text-gold-500 font-black text-xl flex items-center justify-center mb-3">
                {item.step}
              </div>
              <h3 className="font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedBundle && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0d0d0d] border border-white/10 rounded-3xl w-full max-w-md relative shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Sticky header */}
              <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedBundle.emoji}</span>
                  <div>
                    <p className="font-black text-sm text-white">{selectedBundle.name}</p>
                    <p className="text-xs text-gold-500 font-bold">Rs {selectedBundle.price.toLocaleString()} • {selectedBundle.label}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={22} /></button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-8 py-6">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-5" />
                    <h2 className="text-2xl font-black mb-2 text-green-400">Payment Submitted!</h2>
                    <p className="text-gray-400 mb-6">
                      Your transaction ID has been recorded. Admin will verify and approve your{" "}
                      <strong className="text-white">{selectedBundle.name}</strong> within a few minutes.
                      Refresh your dashboard to see your credits.
                    </p>
                    <button onClick={closeModal} className="w-full py-3 glass hover:bg-white/10 rounded-xl font-bold">
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Payment account numbers */}
                    <div className="space-y-3 mb-5">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Send Payment To</p>
                      {[
                        { label: "EasyPaisa", number: EASYPAISA_NUMBER, name: EASYPAISA_NAME, color: "text-green-400" },
                        { label: "JazzCash",  number: JAZZCASH_NUMBER,  name: JAZZCASH_NAME,  color: "text-red-400" },
                      ].map(({ label, number, name, color }) => (
                        <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                          <div>
                            <p className={`font-black text-[10px] uppercase tracking-widest mb-1 ${color}`}>{label}</p>
                            <p className="text-white font-mono font-bold text-lg">{number}</p>
                            <p className="text-[10px] text-gray-500 font-bold">{name}</p>
                          </div>
                          <button onClick={() => copyNumber(number, label)} className="p-2 glass hover:bg-white/10 rounded-xl transition-all">
                            {copiedNum === label ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Amount reminder */}
                    <div className="bg-gold-500/10 border border-gold-500/20 rounded-2xl p-4 mb-5 text-center">
                      <p className="text-xs text-gold-400 font-bold uppercase tracking-widest mb-1">Exact Amount to Send</p>
                      <p className="text-3xl font-black text-gold-500">Rs {selectedBundle.price.toLocaleString()}</p>
                    </div>

                    {/* TRX ID */}
                    <div className="mb-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                        Transaction ID (TRX ID)
                      </label>
                      <input
                        type="text"
                        value={trxId}
                        onChange={(e) => { setTrxId(e.target.value); setError(""); }}
                        placeholder="e.g. EP24082300123456"
                        className="w-full bg-white/5 border border-white/10 focus:border-gold-500/50 rounded-xl px-4 py-3 text-white font-mono outline-none transition-all"
                      />
                    </div>

                    {/* Screenshot Upload */}
                    <div className="mb-6">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">
                        Proof of Payment (Screenshot)
                      </label>
                      <label className="flex flex-col items-center justify-center w-full h-24 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-gold-500/30 transition-all">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-xs text-gray-400 font-bold">{screenshot ? screenshot.name : "Click to upload screenshot"}</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                        />
                      </label>
                      {error && <p className="text-red-400 text-xs mt-2 font-bold">{error}</p>}
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !trxId || !screenshot}
                      className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-black rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        !trxId || !screenshot ? "Complete Fields Above" : "I've Paid — Submit Proof"
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-4 leading-relaxed">
                      After submission, admin verifies and approves. Credits appear within minutes.<br/>
                      <span className="text-[10px] text-gray-500 flex items-center justify-center gap-1 mt-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Help? WhatsApp Support: <span className="text-white">+92 341 0720377</span>
                      </span>
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
