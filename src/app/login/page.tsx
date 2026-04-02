"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Mail, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If login fails because user doesn't exist, try to sign up!
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        router.push("/apps");
      }
    } else {
      router.push("/apps");
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center relative z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 rounded-3xl w-full max-w-md relative overflow-hidden shadow-2xl"
      >
        <div className="text-center mb-8">
          <Crown className="w-12 h-12 text-gold-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-2">VIP Access</h1>
          <p className="text-gray-400 text-sm">Sign in to download guaranteed mods or join the lifetime club.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-800 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-800 border border-white/10 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gold-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)] hover:bg-gold-400 rounded-xl font-black text-lg transition-all flex justify-center items-center h-14"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sign In / Register"}
          </button>
        </form>

      </motion.div>
    </div>
  );
}
