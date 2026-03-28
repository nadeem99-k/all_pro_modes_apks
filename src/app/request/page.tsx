"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Crown, AlertCircle, Loader2 } from "lucide-react";

export default function RequestModPage() {
  const [formData, setFormData] = useState({
    app_name: "",
    store_link: "",
    features_wanted: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (result.success) {
        setSuccess(true);
      } else {
        alert("Error: " + (result.error || "Failed to submit request"));
      }
    } catch (err) {
      alert("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-3xl mx-auto relative z-10">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-3xl relative overflow-hidden shadow-2xl"
      >
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          <h1 className="text-4xl font-black mb-2">Request a <span className="text-gold-500">Mod</span></h1>
          <p className="text-gray-400">Exclusive feature for Lifetime VIP Members. Tell us which app to crack next.</p>
        </div>

        {success ? (
          <div className="bg-gold-500/10 border border-gold-500/50 text-gold-500 p-8 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">Request Received!</h3>
            <p className="text-sm">Our expert crackers have been notified. We usually fulfill Lifetime VIP requests within 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">App Name</label>
              <input 
                type="text" 
                value={formData.app_name}
                onChange={e => setFormData({...formData, app_name: e.target.value})}
                required
                placeholder="e.g. Canva Pro, Duolingo, Truecaller..."
                className="w-full bg-dark-800 border border-white/10 text-white pl-4 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Play Store / App Store Link</label>
              <input 
                type="url" 
                value={formData.store_link}
                onChange={e => setFormData({...formData, store_link: e.target.value})}
                required
                placeholder="https://play.google.com/..."
                className="w-full bg-dark-800 border border-white/10 text-white pl-4 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Which Premium Features do you want unlocked?</label>
              <textarea 
                value={formData.features_wanted}
                onChange={e => setFormData({...formData, features_wanted: e.target.value})}
                required
                rows={4}
                placeholder="Describe exactly what needs to be modded (e.g., Remove Ads, Unlock VIP skins, Bypass Coins)..."
                className="w-full bg-dark-800 border border-white/10 text-white pl-4 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
              ></textarea>
            </div>

            <div className="flex items-start gap-3 bg-dark-800/50 p-4 rounded-xl border border-white/5">
              <AlertCircle className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                By submitting this request, you agree that server-sided features (like unlimited online currency in heavily secured MMOs) cannot be modded. We craft client-side unlocks, feature patches, and subscription bypasses.
              </p>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-gold-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:bg-gold-400 rounded-xl font-black text-lg transition-all flex justify-center items-center gap-2 h-14"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> Submit to Crackers</>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
