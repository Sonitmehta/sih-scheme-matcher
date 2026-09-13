import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages, Sparkles, TrendingUp, Users, ArrowLeft,
  Radio, RefreshCw, Search, Loader2, CheckCircle, ExternalLink
} from "lucide-react";
import SchemeCard from "./SchemeCard";
import SchemeChatbot from "./SchemeChatbot";
import { matchSchemes, createProfile, searchLiveSchemes, triggerLiveSync } from "../lib/api";

const LANGS = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", native: "हिंदी", flag: "🟧" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🔵" },
  { code: "ta", label: "Tamil", native: "தமிழ்", flag: "🟨" },
  { code: "te", label: "Telugu", native: "తెలుగు", flag: "🟣" },
  { code: "bn", label: "Bengali", native: "বাংলা", flag: "🟩" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "🟥" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🟦" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", flag: "🟫" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🟨" },
];

function PipelineStats({ data, onSync, syncing }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-800">
            Real-Time Automated Data Ingestion Active
          </span>
        </div>
        <button
          onClick={onSync}
          disabled={syncing}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync Live Schemes"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active Pool", value: data.pipeline_info?.total_schemes || 25, color: "text-gray-800" },
          { label: "Rule Qualified", value: data.pipeline_info?.after_rule_filter || "–", color: "text-indigo-600" },
          { label: "Ranked AI Matches", value: data.matches?.length || 0, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-[11px] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage({ matchData: initialData, profileData, onRetry }) {
  const [lang, setLang] = useState("en");
  const [matchData, setMatchData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [syncing, setSyncing] = useState(false);
  const [activeSchemeForBot, setActiveSchemeForBot] = useState(null);

  // Live real-time search state
  const [liveQuery, setLiveQuery] = useState("");
  const [liveSearching, setLiveSearching] = useState(false);
  const [liveResults, setLiveResults] = useState([]);

  // Fetch results if coming from preset persona
  useEffect(() => {
    if (!initialData && profileData) {
      (async () => {
        setLoading(true);
        try {
          const { profile_id } = await createProfile(profileData);
          const data = await matchSchemes(profile_id);
          setMatchData(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  const handleSyncLive = async () => {
    setSyncing(true);
    try {
      await triggerLiveSync();
      if (profileData) {
        const { profile_id } = await createProfile(profileData);
        const refreshed = await matchSchemes(profile_id);
        setMatchData(refreshed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleLiveSearch = async (e) => {
    e?.preventDefault();
    if (!liveQuery.trim() || liveSearching) return;
    setLiveSearching(true);
    try {
      const res = await searchLiveSchemes(
        liveQuery,
        profileData?.category || "",
        profileData?.state || ""
      );
      setLiveResults(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLiveSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-700 font-bold text-base">Running Real-Time AI Scheme Discovery...</p>
        <p className="text-gray-400 text-xs">Querying live government databases & semantic model</p>
      </div>
    );
  }

  if (!matchData) return null;

  const matches = matchData.matches || [];
  const strong = matches.filter((m) => m.match_label === "Strong Match" || m.match_label === "Good Match");
  const others = matches.filter((m) => m.match_label === "Possible Match" || m.match_label === "Low Relevance");

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 relative pb-28">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-amber-500" />
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            Found <span className="text-indigo-600">{matches.length} Eligible Schemes</span>
          </h1>
        </div>
        <p className="text-gray-500 text-xs md:text-sm">
          Matched for: <strong className="text-gray-800">{profileData?.category || "General"}</strong> ·{" "}
          <strong className="text-gray-800">{profileData?.state || "All India"}</strong> ·{" "}
          <strong className="text-gray-800">{profileData?.sector || "All Sectors"}</strong> ·{" "}
          <strong className="text-gray-800">{profileData?.business_stage || "Early stage"}</strong>
        </p>
      </motion.div>

      {/* Pipeline transparency + Live sync stats */}
      <PipelineStats data={matchData} onSync={handleSyncLive} syncing={syncing} />

      {/* 10 Regional Languages Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Languages size={18} className="text-indigo-600" />
          <span className="text-xs font-bold text-gray-700">Choose Language for Text &amp; Regional Voice (10 Languages):</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                lang === l.code
                  ? "bg-indigo-600 text-white font-bold shadow-md scale-105"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.native}</span>
              <span className="text-[10px] opacity-70">({l.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Real-Time Search Bar */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-amber-50 rounded-2xl border border-indigo-100 p-4 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <Search size={14} className="text-indigo-600" /> Search Any Live Government Scheme in Real Time:
          </span>
          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">
            Live Web Discovery
          </span>
        </div>
        <form onSubmit={handleLiveSearch} className="flex gap-2">
          <input
            type="text"
            value={liveQuery}
            onChange={(e) => setLiveQuery(e.target.value)}
            placeholder="e.g. 'solar pump subsidy for farmers', 'drone scheme', 'weaver grant Tamil Nadu'..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={liveSearching || !liveQuery.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {liveSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            <span>{liveSearching ? "Searching..." : "Live Search"}</span>
          </button>
        </form>

        {/* Live Search Results */}
        {liveResults.length > 0 && (
          <div className="mt-4 pt-3 border-t border-indigo-100/60 space-y-3">
            <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">
              <Radio size={12} className="text-emerald-500 animate-pulse" /> Discovered {liveResults.length} Real-Time Schemes:
            </h4>
            <div className="space-y-3">
              {liveResults.map((lr, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-gray-900">{lr.name}</h5>
                    <a
                      href={lr.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5 font-medium shrink-0"
                    >
                      Portal <ExternalLink size={10} />
                    </a>
                  </div>
                  <p className="text-gray-600 text-[11px] mt-1 line-clamp-2">{lr.benefit_description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Matches */}
      {strong.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-600" />
            <h2 className="font-bold text-gray-800 text-base md:text-lg">Top Recommended Schemes</h2>
            <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {strong.length} schemes
            </span>
          </div>
          <div className="space-y-4">
            {strong.map((m, i) => (
              <SchemeCard
                key={m.scheme_id}
                match={m}
                lang={lang}
                index={i}
                onAskBot={(s) => setActiveSchemeForBot(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Additional Matches */}
      {others.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-amber-600" />
            <h2 className="font-bold text-gray-800 text-base md:text-lg">Also Worth Exploring</h2>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {others.length} schemes
            </span>
          </div>
          <div className="space-y-4">
            {others.map((m, i) => (
              <SchemeCard
                key={m.scheme_id}
                match={m}
                lang={lang}
                index={i}
                onAskBot={(s) => setActiveSchemeForBot(s)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Retry CTA */}
      <div className="mt-12 text-center">
        <button
          onClick={onRetry}
          className="text-xs md:text-sm text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 bg-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm"
        >
          ↺ Search with a Different Profile
        </button>
      </div>

      {/* Floating Multilingual AI Assistant */}
      <SchemeChatbot
        currentLang={lang}
        currentScheme={activeSchemeForBot}
        userProfile={profileData}
      />
    </div>
  );
}
