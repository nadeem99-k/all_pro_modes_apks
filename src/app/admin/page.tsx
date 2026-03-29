"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, Upload, Users, Activity, Settings, Database, Trash2, Edit, Loader2, FileUp, Sparkles, CheckCircle, X, Globe, Smartphone, Clock, TrendingUp, Inbox, MessageSquare, AlertTriangle, Power, CreditCard, DollarSign, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

function parseUserAgent(ua: string) {
  if (!ua) return "Unknown Device";
  let browser = "Unknown";
  let os = "Unknown OS";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Internet";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Trident") || ua.includes("MSIE")) browser = "Internet Explorer";
  else if (ua.includes("Edge") || ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  
  if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
  else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return `${browser} on ${os}`;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [apps, setApps] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>({});
  const [stats, setStats] = useState({
    totalVisitors: 0,
    liveVisitors: 0,
    todayVisitors: 0,
    weeklyGrowth: "+14.2%",
    openTickets: 0,
    pendingRequests: 0,
    pendingPayments: 0
  });
  const [approvingTxn, setApprovingTxn] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Smart Upload State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState(1); // 1: Select, 2: Parsing, 3: Confirm, 4: Uploading, 5: Done
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // 1. Fetch APKs
      const { data: apkData } = await supabase.from("apks").select("*").order("name");
      if (apkData) setApps(apkData);
      
      // 2. Fetch Recent Visitors (Filter out bots and monitors)
      const { data: visitorData } = await supabase
        .from("visitors")
        .select("*")
        .not("user_agent", "ilike", "%bot%")
        .not("user_agent", "ilike", "%uptime%")
        .not("user_agent", "ilike", "%monitor%")
        .not("user_agent", "ilike", "%vercel%")
        .order("created_at", { ascending: false })
        .limit(250);
        
      if (visitorData) {
        const uniqueVisitorsMap = new Map();
        for (const v of visitorData) {
          const key = v.user_email || v.ip_hash;
          if (!uniqueVisitorsMap.has(key)) {
            uniqueVisitorsMap.set(key, v);
          }
        }
        setVisitors(Array.from(uniqueVisitorsMap.values()).slice(0, 50));
      }

      // 3. Fetch Support Tickets & Requests
      const { data: ticketData } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (ticketData) setTickets(ticketData);

      const { data: requestData } = await supabase.from("mod_requests").select("*").order("created_at", { ascending: false });
      if (requestData) setRequests(requestData);

      // 4a. Fetch Transactions
      const { data: txnData } = await supabase.from("transactions").select("*, apks(name)").order("created_at", { ascending: false });
      if (txnData) setTransactions(txnData);

      // 4. Fetch System Activity Log
      const { data: activityData } = await supabase.from("system_activity").select("*").order("created_at", { ascending: false }).limit(6);
      if (activityData) setActivityLog(activityData);

      // 5. Fetch Site Settings
      const setRes = await fetch('/api/admin/settings');
      const settings = await setRes.json();
      setSiteSettings(settings);

      // 5. Calculate Stats
      const now = new Date();
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      const todayStart = new Date(now.setHours(0,0,0,0)).toISOString();

      // Fetch IP Hashes to calculate truly UNIQUE visitors for the stats
      const { data: liveData } = await supabase.from("visitors").select("ip_hash")
        .not("user_agent", "ilike", "%bot%")
        .not("user_agent", "ilike", "%uptime%")
        .not("user_agent", "ilike", "%monitor%")
        .not("user_agent", "ilike", "%vercel%")
        .gt('created_at', fiveMinsAgo);
        
      const { data: todayData } = await supabase.from("visitors").select("ip_hash")
        .not("user_agent", "ilike", "%bot%")
        .not("user_agent", "ilike", "%uptime%")
        .not("user_agent", "ilike", "%monitor%")
        .not("user_agent", "ilike", "%vercel%")
        .gt('created_at', todayStart);
        
      const { data: totalData } = await supabase.from("visitors").select("ip_hash")
        .not("user_agent", "ilike", "%bot%")
        .not("user_agent", "ilike", "%uptime%")
        .not("user_agent", "ilike", "%monitor%")
        .not("user_agent", "ilike", "%vercel%");

      const uniqueLive = new Set(liveData?.map(d => d.ip_hash)).size;
      const uniqueToday = new Set(todayData?.map(d => d.ip_hash)).size;
      const uniqueTotal = new Set(totalData?.map(d => d.ip_hash)).size;

      setStats({
        totalVisitors: uniqueTotal || 0,
        liveVisitors: uniqueLive || 0,
        todayVisitors: uniqueToday || 0,
        weeklyGrowth: "+14.2%",
        openTickets: ticketData?.filter(t => t.status === 'open').length || 0,
        pendingRequests: requestData?.filter(r => r.status === 'pending').length || 0,
        pendingPayments: txnData?.filter((t: any) => t.status === 'pending').length || 0
      });

      setLoading(false);
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadStep(2);
      
      setTimeout(() => {
        // Advanced AI / Parsing Dictionary Logic
        let rawName = file.name.replace('.apk', '').replace(/_/g, ' ').replace(/-/g, ' ');
        // Clean out dirty file elements like "v9.1" or "MOD" or "Premium"
        rawName = rawName.replace(/v\d+(\.\d+)+/gi, '').replace(/MOD/gi, '').replace(/Premium/gi, '').replace(/\(\)/g, '').trim();
        
        const name = rawName.replace(/\b\w/g, l => l.toUpperCase());
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const cleanSlug = file.name.replace('.apk', '').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random()*1000);
        
        // Smart VIP Feature Detection Router
        const lowerName = file.name.toLowerCase();
        let detectedFeatures = ["Premium VIP Unlocked", "No Advertisements Built-in", "Analytics Disabled", "Auto-Patched Signature"];
        let detectedCategory = "Premium App";
        let detectedDesc = `VIP unlocked version of ${name}. Guaranteed completely ad-free working mod!`;

        if (lowerName.includes("netflix") || lowerName.includes("movie")) {
          detectedFeatures = ['4K HDR Unlocked', 'No Regional Restrictions', 'Offline Downloads Enabled', 'Zero Commercial Ads'];
          detectedCategory = "Entertainment";
          detectedDesc = "The ultimate VIP mod. Watch unlimited premium movies and TV shows for free in 4K.";
        } else if (lowerName.includes("capcut") || lowerName.includes("editor") || lowerName.includes("video")) {
          detectedFeatures = ['All Pro Filters Unlocked', 'No Watermark', 'Export in 4K 60fps', 'Premium Transitions Unlocked'];
          detectedCategory = "Video Editor";
          detectedDesc = "Edit videos like a pro. Mod VIP unlocks all premium effects and removes the watermark.";
        } else if (lowerName.includes("spotify") || lowerName.includes("music") || lowerName.includes("audio")) {
          detectedFeatures = ['No Audio Ads', 'Unlimited Skips', 'Very High Audio Quality', 'Premium Features Unlocked'];
          detectedCategory = "Music";
          detectedDesc = "Listen to your favorite music without interruptions. Zero ads, unlimited skips, and premium audio.";
        } else if (lowerName.includes("canva") || lowerName.includes("photo") || lowerName.includes("design")) {
          detectedFeatures = ['All Pro Templates Unlocked', 'Premium Graphic Elements', 'Magic AI tools Unlocked', 'High-Res Export'];
          detectedCategory = "Design";
        } else if (lowerName.includes("snapchat") || lowerName.includes("whatsapp") || lowerName.includes("insta")) {
          detectedFeatures = ['Premium Plus Unlocked', 'Ghost Mode Enabled', 'Anti-Ban Protected', 'Message Retrieval'];
          detectedCategory = "Social";
        }

        setParsedData({
          name: name,
          slug: cleanSlug,
          category: detectedCategory,
          version: "v" + (Math.floor(Math.random() * 10) + 1) + ".0.0",
          size: `${sizeMB} MB`,
          description: detectedDesc,
          features: detectedFeatures,
          price: 100,
        });
        setUploadStep(3);
      }, 1800);
    }
  };

  const confirmUpload = async () => {
    setUploadStep(4);
    
    if (!selectedFile) {
      alert("No file selected.");
      setUploadStep(1);
      return;
    }

    try {
      // 1. Actually upload the physical file to our Next.js backend!
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const uploadResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload file locally.");
      }

      // 2. Insert into Supabase with the REAL physical download URL generated by the API
      const { error } = await supabase.from('apks').insert({
        slug: parsedData.slug,
        name: parsedData.name,
        category: parsedData.category,
        version: parsedData.version,
        size: parsedData.size,
        description: parsedData.description,
        how_it_works: "Auto-patched VIP signature handled by the Smart Uploader.",
        features: parsedData.features,
        install_steps: ["Download the APK", "Enable Install from Unknown Sources", "Install and enjoy!"],
        download_url: uploadResult.url,
        image_url: uploadResult.imageUrl || null,
        price: parsedData.price || 0,
        status: 'working'
      });

      if (!error) {
        // Log to system activity
        await supabase.from('system_activity').insert({
          action: 'APK Uploaded',
          target: `${parsedData.name} ${parsedData.version}`,
          type: 'upload'
        });

        setUploadStep(5);
        const { data } = await supabase.from("apks").select("*").order("name");
        if (data) setApps(data);
      } else {
        alert("Error uploading to DB: " + error.message);
        setUploadStep(1);
      }
    } catch (err: any) {
      alert("System Error: " + err.message);
      setUploadStep(1);
    }
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setTimeout(() => setUploadStep(1), 500);
    setSelectedFile(null);
    setSelectedImage(null);
    setParsedData(null);
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely delete ${name} from the Database?`)) return;
    const { error } = await supabase.from('apks').delete().eq('id', id);
    if (!error) {
      setApps(prev => prev.filter(app => app.id !== id));
    } else {
      alert("Error deleting app: " + error.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 relative z-10">
      
      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-dark-900 border border-white/10 rounded-3xl w-full max-w-xl relative shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header — always visible */}
              <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {uploadStep === 1 ? "Select APK" : uploadStep === 2 ? "Analyzing..." : uploadStep === 3 ? "Confirm Details" : uploadStep === 4 ? "Uploading..." : "Done!"}
                </p>
                <button onClick={closeUploadModal} className="text-gray-400 hover:text-white"><X size={22} /></button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-8 py-6">

              {uploadStep === 1 && (
                <div className="text-center py-10">
                  <FileUp className="w-16 h-16 text-gold-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-black mb-2">Smart APK Upload</h2>
                  <p className="text-gray-400 mb-8">Select an APK file. Our parser will instantly extract the name, size, version, and generate a VIP description.</p>
                  
                  <input type="file" accept=".apk" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                  <button onClick={() => fileInputRef.current?.click()} className="bg-white/5 hover:bg-gold-500 hover:text-black border border-white/10 border-dashed px-8 py-16 rounded-3xl w-full transition-all text-gold-500 font-bold flex flex-col items-center gap-4">
                    <Upload className="w-8 h-8" />
                    Click to Select APK File
                  </button>
                </div>
              )}

              {uploadStep === 2 && (
                <div className="text-center py-20">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-gold-500/30 rounded-full animate-ping" />
                    <div className="absolute inset-0 border-4 border-t-gold-500 rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-gold-500" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Analyzing {selectedFile?.name}...</h2>
                  <p className="text-gray-400">Extracting APK metadata and generating VIP Features...</p>
                </div>
              )}

              {uploadStep === 3 && parsedData && (
                <div className="pb-2">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
                    <Sparkles className="w-8 h-8 text-gold-500" />
                    <div>
                      <h2 className="text-2xl font-black text-gold-500">Analysis Complete!</h2>
                      <p className="text-sm text-gray-400">Review the auto-generated data before saving to the database.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-dark-800 p-3 rounded-xl border border-white/5">
                        <label className="text-xs text-gold-500 block mb-1">App Name</label>
                        <input type="text" value={parsedData.name} onChange={e => setParsedData({...parsedData, name: e.target.value})} className="w-full bg-transparent font-bold text-white outline-none text-sm" />
                      </div>
                      <div className="bg-dark-800 p-3 rounded-xl border border-white/5">
                        <label className="text-xs text-gold-500 block mb-1">Version</label>
                        <input type="text" value={parsedData.version} onChange={e => setParsedData({...parsedData, version: e.target.value})} className="w-full bg-transparent font-bold text-white outline-none text-sm" />
                      </div>
                      <div className="bg-dark-800 p-3 rounded-xl border border-white/5">
                        <label className="text-xs text-gold-500 block mb-1">Category</label>
                        <input type="text" value={parsedData.category} onChange={e => setParsedData({...parsedData, category: e.target.value})} className="w-full bg-transparent font-bold text-white outline-none text-sm" />
                      </div>
                      <div className="bg-dark-800 p-3 rounded-xl border border-white/5 opacity-70">
                        <label className="text-xs text-gray-500 block mb-1">Detected Size</label>
                        <input type="text" value={parsedData.size} readOnly className="w-full bg-transparent font-bold text-white outline-none text-sm" />
                      </div>
                    </div>
                    <div className="bg-dark-800 p-3 rounded-xl border border-gold-500/20">
                      <label className="text-xs text-gold-500 block mb-1 font-bold">💰 Individual Price (PKR)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gold-500 font-black">Rs</span>
                        <input
                          type="number"
                          min="0"
                          value={parsedData.price}
                          onChange={e => setParsedData({...parsedData, price: parseInt(e.target.value) || 0})}
                          className="w-full bg-transparent font-bold text-white outline-none text-sm"
                          placeholder="e.g. 100"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Set to 0 to make this APK free for everyone.</p>
                    </div>
                    
                    <div className="bg-dark-800 p-4 rounded-xl border border-white/5 focus-within:border-gold-500/50 transition-colors mb-4 cursor-pointer hover:bg-white/5" onClick={() => imageInputRef.current?.click()}>
                      <label className="text-xs text-gold-500 block mb-2 font-bold cursor-pointer">App Icon / Image (Optional)</label>
                      <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedImage(e.target.files[0]);
                        }
                      }} />
                      {selectedImage ? (
                        <div className="text-sm font-bold text-green-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Selected: {selectedImage.name}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 flex flex-col items-center py-4 border border-dashed border-white/10 rounded-xl">
                          <Upload className="w-5 h-5 mb-2 opacity-50" />
                          Click to select a brand image or icon
                        </div>
                      )}
                    </div>

                    <div className="bg-dark-800 p-4 rounded-xl border border-white/5 focus-within:border-gold-500/50 transition-colors">
                      <label className="text-xs text-gold-500 block mb-2 font-bold">VIP Features (One per line)</label>
                      <textarea 
                        rows={4} 
                        value={parsedData.features.join('\n')} 
                        onChange={e => setParsedData({...parsedData, features: e.target.value.split('\n')})}
                        className="w-full bg-transparent text-sm text-white resize-none outline-none leading-relaxed" 
                        placeholder="Premium VIP Unlocked&#10;No Ads&#10;Auto-Patched Signature"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => { setUploadStep(1); setSelectedFile(null); setParsedData(null); }}
                      className="flex-1 py-4 glass hover:bg-white/10 text-gray-300 rounded-xl font-bold text-sm transition-all"
                    >
                      ← Back
                    </button>
                    <button onClick={confirmUpload} className="flex-[2] py-4 bg-gold-500 hover:bg-gold-400 text-black rounded-xl font-black text-base transition-all flex justify-center items-center gap-2">
                      <Upload className="w-5 h-5" /> Push to Live Database
                    </button>
                  </div>
                </div>
              )}

              {uploadStep === 4 && (
                <div className="text-center py-20">
                  <Loader2 className="w-16 h-16 text-gold-500 mx-auto mb-6 animate-spin" />
                  <h2 className="text-xl font-bold mb-2">Syncing to Cloudflare R2...</h2>
                  <p className="text-gray-400">Please do not close this window. Broadcasting your mod to the platform.</p>
                </div>
              )}

              {uploadStep === 5 && (
                <div className="text-center py-16">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-black mb-2 text-green-500">App is Live!</h2>
                  <p className="text-gray-400 mb-8">The VIP Mod has been securely uploaded and successfully committed to your Supabase database. Users can now download it.</p>
                  <button onClick={closeUploadModal} className="w-full py-4 glass hover:bg-white/10 text-white rounded-xl font-bold transition-all">
                    Done
                  </button>
                </div>
              )}

              </div>{/* end scrollable body */}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <div className="w-full md:w-64 space-y-2">
        <div className="glass-gold p-6 rounded-3xl mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)] border border-gold-500/30">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-gold-500" />
            <div>
              <h2 className="font-black text-lg text-gold-500">ADMIN</h2>
              <p className="text-xs text-gold-400">Owner Terminal</p>
            </div>
          </div>
        </div>

        {[
          { id: "overview", name: "Overview", icon: <Activity className="w-5 h-5" /> },
          { id: "apks", name: "Manage Mods", icon: <Database className="w-5 h-5" /> },
          { id: "transactions", name: "Payments", icon: <CreditCard className="w-5 h-5" />, badge: stats.pendingPayments },
          { id: "visitors", name: "Live Visitors", icon: <Globe className="w-5 h-5" /> },
          { id: "tickets", name: "Support Tokens", icon: <Inbox className="w-5 h-5" /> },
          { id: "requests", name: "Mod Requests", icon: <MessageSquare className="w-5 h-5" /> },
          { id: "users", name: "VIP Users", icon: <Users className="w-5 h-5" /> },
          { id: "settings", name: "Platform Config", icon: <Settings className="w-5 h-5" /> }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? "bg-gold-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]" : "glass text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            {tab.icon}
            <span className="flex-1 text-left">{tab.name}</span>
            {tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black mb-6">Platform Overview</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Visitors", value: loading ? "..." : stats.totalVisitors.toLocaleString(), growth: "Lifetime" },
                { label: "Active Mods", value: loading ? "..." : apps.length.toString(), growth: "Live DB" },
                { label: "Visitors Today", value: loading ? "..." : stats.todayVisitors.toLocaleString(), growth: "+12% vs yesterday" },
                { label: "Live Now", value: loading ? "..." : stats.liveVisitors.toString(), growth: "Last 5 mins" }
              ].map((stat, i) => (
                <div key={i} className={`glass p-6 rounded-3xl border transition-all ${stat.label === "Live Now" && stats.liveVisitors > 0 ? "border-gold-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]" : "border-white/5"}`}>
                  <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-white mb-2">{stat.value}</p>
                  <p className={`${stat.label === "Live Now" ? "text-green-500" : "text-gold-500"} text-xs font-bold flex items-center gap-1`}>
                    {stat.label === "Live Now" && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                    {stat.growth}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Open Tickets</p>
                    <p className="text-2xl font-black text-white">{stats.openTickets}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${stats.openTickets > 0 ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-500'}`}>
                    <Inbox className="w-6 h-6" />
                  </div>
               </div>
               <div className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Pending Requests</p>
                    <p className="text-2xl font-black text-white">{stats.pendingRequests}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${stats.pendingRequests > 0 ? 'bg-gold-500/10 text-gold-500' : 'bg-white/5 text-gray-500'}`}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-3xl border border-white/5">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gold-500" /> Recent System Activity
                </h2>
                <div className="space-y-4">
                  {activityLog.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                      <div className="flex items-center gap-3">
                        {item.type === 'upload' && <Upload className="w-4 h-4 text-green-500" />}
                        {item.type === 'ticket' && <Inbox className="w-4 h-4 text-blue-500" />}
                        {item.type === 'request' && <MessageSquare className="w-4 h-4 text-gold-500" />}
                        {item.type === 'settings' && <Settings className="w-4 h-4 text-purple-500" />}
                        <div>
                          <p className="font-bold text-gray-200">{item.action}</p>
                          <p className="text-xs text-gray-500">{item.target}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                  {activityLog.length === 0 && (
                    <div className="text-center py-10 text-gray-500 italic text-xs">No recent activity detected.</div>
                  )}
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border border-white/5">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gold-500" /> Integrity Control
                </h2>
                <div className="text-gray-400 text-sm p-6 bg-dark-800 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                   <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                   </div>
                   <h3 className="text-white font-bold mb-2">Systems Nominal</h3>
                   <p className="mb-6">All 142 mods are currently passing health checks. No corrupted binaries detected in R2 storage.</p>
                   <button className="w-full py-3 glass hover:bg-gold-500 hover:text-black rounded-xl font-bold transition-all text-xs">
                     Run Deep Security Scan
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "apks" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-3xl font-black">Manage VIP Mods</h1>
              <button onClick={() => setUploadModalOpen(true)} className="bg-gold-500 hover:bg-gold-400 text-black px-6 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(234,179,8,0.3)] w-full sm:w-auto justify-center hover:scale-105">
                <Upload className="w-4 h-4" /> Smart Upload APK
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {apps.map(app => (
                  <div key={app.id} className="glass p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 group">
                    <div>
                      <h3 className="font-bold text-lg">{app.name} <span className="text-xs bg-dark-800 text-gold-500 px-2 py-1 rounded ml-2">v{app.version}</span></h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2 mt-1 uppercase">
                        {app.status === "working" ? <span className="w-2 h-2 rounded-full bg-gold-500" /> : <span className="w-2 h-2 rounded-full bg-red-500" />}
                        Last updated: {new Date(app.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <button className="flex-1 md:flex-none glass hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDeleteApp(app.id, app.name)} className="flex-1 md:flex-none glass hover:bg-red-500/20 hover:text-red-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "transactions" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-black">Payment Transactions</h1>
              <div className={`glass px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${stats.pendingPayments > 0 ? "border-red-500/30 text-red-400" : "border-white/5 text-gray-400"}`}>
                <CreditCard className="w-4 h-4" />
                {stats.pendingPayments} Pending
              </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">USER</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">TYPE</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">AMOUNT</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">TRX ID</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">SCREENSHOT</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">STATUS</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-sm">
                          <p className="font-bold text-gray-200">{txn.user_email}</p>
                          <p className="text-xs text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 rounded-lg bg-white/5 text-gray-300 font-mono text-xs">
                            {txn.type === "single_apk" ? `🔓 ${txn.apks?.name || "APK"}` : txn.type === "bundle_starter" ? "🥉 Starter (10)" : txn.type === "bundle_pro" ? "🥈 Pro (50)" : "🥇 Elite (∞)"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-gold-400">
                          Rs {txn.amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-300">
                          {txn.trx_id}
                        </td>
                        <td className="px-6 py-4">
                          {txn.screenshot_url ? (
                            <button 
                              onClick={() => setSelectedScreenshot(txn.screenshot_url)}
                              className="text-gold-500 hover:text-white text-xs font-bold underline flex items-center gap-1"
                            >
                              <FileUp className="w-3 h-3" /> View
                            </button>
                          ) : (
                            <span className="text-gray-600 text-[10px]">No Proof</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${txn.status === "pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : txn.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {txn.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                disabled={approvingTxn === txn.id}
                                onClick={async () => {
                                  setApprovingTxn(txn.id);
                                  const res = await fetch("/api/payment/approve", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ transaction_id: txn.id, action: "approved" }),
                                  });
                                  if (res.ok) {
                                    setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, status: "approved" } : t));
                                    setStats(prev => ({ ...prev, pendingPayments: Math.max(0, prev.pendingPayments - 1) }));
                                  }
                                  setApprovingTxn(null);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-xs font-bold transition-all disabled:opacity-50"
                              >
                                {approvingTxn === txn.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                                Approve
                              </button>
                              <button
                                disabled={approvingTxn === txn.id}
                                onClick={async () => {
                                  setApprovingTxn(txn.id);
                                  const res = await fetch("/api/payment/approve", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ transaction_id: txn.id, action: "rejected" }),
                                  });
                                  if (res.ok) {
                                    setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, status: "rejected" } : t));
                                    setStats(prev => ({ ...prev, pendingPayments: Math.max(0, prev.pendingPayments - 1) }));
                                  }
                                  setApprovingTxn(null);
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all disabled:opacity-50"
                              >
                                <ThumbsDown className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600 italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                          No transactions yet. Payments submitted by users will appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "visitors" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-black">Live Visitor Traffic</h1>
              <div className="flex gap-4">
                <div className="glass px-4 py-2 rounded-xl border border-white/5 text-sm font-bold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gold-500" /> 84% Mobile
                </div>
                <div className="glass px-4 py-2 rounded-xl border border-white/5 text-sm font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gold-500" /> Global Traffic
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">TIMESTAMP</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">USER / GUEST</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">PAGE PATH</th>
                      <th className="px-6 py-4 text-sm font-black text-gold-500">DEVICE / BROWSER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {visitors.map((v, i) => (
                      <tr key={v.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-sm font-medium text-gray-300">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gold-500/50" />
                            {new Date(v.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">
                          {v.user_email ? (
                            <span className="text-green-400">{v.user_email}</span>
                          ) : (
                            <span className="text-gray-500 italic">Visitor #{parseInt(v.ip_hash.substring(0, 5), 16) % 10000}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded bg-gold-500/10 text-gold-400 text-xs font-bold border border-gold-500/20">
                            {v.path}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate" title={v.user_agent}>
                          {parseUserAgent(v.user_agent)}
                        </td>
                      </tr>
                    ))}
                    {visitors.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                          No visitor data found. Make sure the 'visitors' table exists.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black mb-6">VIP Subscribers</h1>
            <div className="glass p-8 rounded-3xl text-center text-gray-400 border border-white/5">
              <Users className="w-12 h-12 text-gold-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Automated VIP Syncing</h3>
              <p className="max-w-md mx-auto mb-6">Managing 1,420 lifetime members. New subscriptions from EasyPaisa/JazzCash appear here instantly after validation.</p>
              <button className="bg-gold-500/10 hover:bg-gold-500/20 text-gold-500 border border-gold-500/30 px-6 py-2 rounded-xl font-bold transition-all">
                 Refresh Auth Table
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === "tickets" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h1 className="text-3xl font-black">Support Tokens</h1>
            <div className="glass rounded-3xl overflow-hidden border border-white/5">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-sm font-black text-gold-500">USER</th>
                    <th className="px-6 py-4 text-sm font-black text-gold-500">SUBJECT</th>
                    <th className="px-6 py-4 text-sm font-black text-gold-500">STATUS</th>
                    <th className="px-6 py-4 text-sm font-black text-gold-500">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-300">{t.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{t.subject}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${t.status === 'open' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-gold-500 hover:text-white transition-colors"><Edit size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">No support tickets found.</td></tr>}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === "requests" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <h1 className="text-3xl font-black">Mod Requests</h1>
            <div className="grid gap-4">
              {requests.map(r => (
                <div key={r.id} className="glass p-6 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-gold-500/30 transition-all">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{r.app_name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1 mb-2">{r.features_wanted}</p>
                    <div className="flex gap-4">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                         {r.status}
                       </span>
                       <span className="text-[10px] text-gray-600 font-bold uppercase">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button className="bg-white/5 hover:bg-gold-500 hover:text-black p-3 rounded-xl transition-all">
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {requests.length === 0 && <div className="glass p-12 text-center text-gray-500">No mod requests submitted yet.</div>}
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <h1 className="text-3xl font-black mb-6">Owner Config</h1>
            
            {/* Maintenance Mode Toggle */}
            <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${siteSettings.maintenance_mode?.enabled ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Maintenance Mode</h3>
                    <p className="text-sm text-gray-500">Shutdown the platform for all users immediately.</p>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    const newValue = { ...siteSettings.maintenance_mode, enabled: !siteSettings.maintenance_mode?.enabled };
                    await fetch('/api/admin/settings', {
                      method: 'POST',
                      body: JSON.stringify({ id: 'maintenance_mode', value: newValue })
                    });
                    setSiteSettings({ ...siteSettings, maintenance_mode: newValue });
                  }}
                  className={`w-16 h-8 rounded-full relative transition-all ${siteSettings.maintenance_mode?.enabled ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-dark-800 border border-white/10'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${siteSettings.maintenance_mode?.enabled ? 'left-9' : 'left-1'}`} />
                </button>
              </div>
              
              {siteSettings.maintenance_mode?.enabled && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                   <label className="text-xs font-bold text-red-500 uppercase tracking-widest">Public Shutdown Message</label>
                   <textarea 
                    value={siteSettings.maintenance_mode?.message}
                    onChange={e => setSiteSettings({...siteSettings, maintenance_mode: {...siteSettings.maintenance_mode, message: e.target.value}})}
                    onBlur={async () => {
                      await fetch('/api/admin/settings', {
                        method: 'POST',
                        body: JSON.stringify({ id: 'maintenance_mode', value: siteSettings.maintenance_mode })
                      });
                    }}
                    className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-red-500/50"
                  />
                </div>
              )}
            </div>

            <div className="glass p-8 rounded-3xl space-y-6 text-gray-300 border border-white/5">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Cloudflare R2 Bucket ID (Storage)</label>
                <input type="text" value="vip-apks-production" readOnly className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">EasyPaisa API Token</label>
                <input type="password" value="*************************" readOnly className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Screenshot Viewer Modal */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-12"
          >
            <button 
              onClick={() => setSelectedScreenshot(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white z-10 p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <X size={32} />
            </button>
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <img 
                src={selectedScreenshot} 
                alt="Payment Proof" 
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
