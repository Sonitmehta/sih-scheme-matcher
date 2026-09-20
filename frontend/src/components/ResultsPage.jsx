import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Languages, Sparkles, TrendingUp, Users, ArrowLeft,
  Radio, RefreshCw, Search, Loader2, ExternalLink, Globe2, ChevronRight
} from "lucide-react";
import SchemeCard from "./SchemeCard";
import SchemeChatbot from "./SchemeChatbot";
import { matchSchemes, createProfile, searchLiveSchemes, triggerLiveSync } from "../lib/api";

const LANGS = [
  { code: "en", label: "English",   native: "English",    flag: "🇬🇧" },
  { code: "hi", label: "Hindi",     native: "हिंदी",      flag: "🟧" },
  { code: "mr", label: "Marathi",   native: "मराठी",      flag: "🔵" },
  { code: "ta", label: "Tamil",     native: "தமிழ்",      flag: "🟨" },
  { code: "te", label: "Telugu",    native: "తెలుగు",     flag: "🟣" },
  { code: "bn", label: "Bengali",   native: "বাংলা",      flag: "🟩" },
  { code: "gu", label: "Gujarati",  native: "ગુજરાતી",   flag: "🟥" },
  { code: "kn", label: "Kannada",   native: "ಕನ್ನಡ",      flag: "🟦" },
  { code: "ml", label: "Malayalam", native: "മലയാളം",     flag: "🟫" },
  { code: "pa", label: "Punjabi",   native: "ਪੰਜਾਬੀ",    flag: "🟨" },
];

export default function ResultsPage({ matchData: initialData, profileData, onRetry }) {
  const [lang, setLang] = useState("en");
  const [matchData, setMatchData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [syncing, setSyncing] = useState(false);
  const [activeSchemeForBot, setActiveSchemeForBot] = useState(null);
  const [liveQuery, setLiveQuery] = useState("");
  const [liveSearching, setLiveSearching] = useState(false);
  const [liveResults, setLiveResults] = useState([]);

  useEffect(() => {
    if (!initialData && profileData) {
      (async () => {
        setLoading(true);
        try {
          const { profile_id } = await createProfile(profileData);
          const data = await matchSchemes(profile_id);
          setMatchData(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
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
    } catch (e) { console.error(e); }
    finally { setSyncing(false); }
  };

  const handleLiveSearch = async (e) => {
    e?.preventDefault();
    if (!liveQuery.trim() || liveSearching) return;
    setLiveSearching(true);
    try {
      const res = await searchLiveSchemes(liveQuery, profileData?.category || "", profileData?.state || "");
      setLiveResults(res.results || []);
    } catch (err) { console.error(err); }
    finally { setLiveSearching(false); }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-gray-50">
        <div className="w-14 h-14 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-gray-800 font-bold text-lg">Finding your schemes...</p>
          <p className="text-gray-400 text-sm mt-1">Running AI matching across live government databases</p>
        </div>
      </div>
    );
  }

  if (!matchData) return null;

  const matches = matchData.matches || [];
  const strong = matches.filter((m) => m.match_label === "Strong Match" || m.match_label === "Good Match");
  const others = matches.filter((m) => m.match_label === "Possible Match" || m.match_label === "Low Relevance");
  const currentLang = LANGS.find((l) => l.code === lang);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-green-600" />
              <span className="font-bold text-gray-900 text-sm">
                {matches.length} Schemes Found
              </span>
              <span className="text-gray-400 text-xs hidden sm:inline">
                · {profileData?.category || "General"} · {profileData?.state || "All India"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live sync */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live data
            </div>
            <button
              onClick={handleSyncLive}
              disabled={syncing}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-green-700 border border-gray-200 hover:border-green-400 bg-white px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {/* ── Pipeline summary row ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Schemes in Pool", value: matchData.pipeline_info?.total_schemes || 25, color: "text-gray-800" },
            { label: "Passed Rule Filter",    value: matchData.pipeline_info?.after_rule_filter || "–", color: "text-blue-600" },
            { label: "AI Ranked Matches",     value: matches.length, color: "text-green-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-[11px] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Language selector ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Languages size={16} className="text-green-600" />
            <span className="text-xs font-bold text-gray-700">Language for Text & Voice:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                  lang === l.code
                    ? "bg-green-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700 border border-gray-200"
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        {/* ── Live search ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Search size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-700">Search any government scheme live:</span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Live from myscheme.gov.in
            </span>
          </div>
          <form onSubmit={handleLiveSearch} className="flex gap-2">
            <input
              type="text"
              value={liveQuery}
              onChange={(e) => setLiveQuery(e.target.value)}
              placeholder="e.g. 'solar pump subsidy', 'women handicraft loan', 'drone policy'..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={liveSearching || !liveQuery.trim()}
              className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-5 py-2 rounded-full transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {liveSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              {liveSearching ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Live results */}
          {liveResults.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-1.5 mb-2">
                <Radio size={12} className="text-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-700">Found {liveResults.length} live schemes:</span>
              </div>
              {liveResults.map((lr, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 text-xs">{lr.name}</h5>
                    <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{lr.benefit_description}</p>
                  </div>
                  <a
                    href={lr.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[11px] text-green-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    View <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top matches ── */}
        {strong.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={17} className="text-green-600" />
              <h2 className="font-bold text-gray-900 text-base">Best Matching Schemes</h2>
              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {strong.length}
              </span>
            </div>
            <div className="space-y-3">
              {strong.map((m, i) => (
                <SchemeCard key={m.scheme_id} match={m} lang={lang} index={i} onAskBot={setActiveSchemeForBot} />
              ))}
            </div>
          </div>
        )}

        {/* ── Other matches ── */}
        {others.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users size={17} className="text-amber-600" />
              <h2 className="font-bold text-gray-900 text-base">Also Worth Exploring</h2>
              <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {others.length}
              </span>
            </div>
            <div className="space-y-3">
              {others.map((m, i) => (
                <SchemeCard key={m.scheme_id} match={m} lang={lang} index={i} onAskBot={setActiveSchemeForBot} />
              ))}
            </div>
          </div>
        )}

        {/* ── Retry CTA ── */}
        <div className="text-center mt-10">
          <button
            onClick={onRetry}
            className="text-sm text-gray-600 hover:text-green-700 border border-gray-200 hover:border-green-400 bg-white px-6 py-2.5 rounded-full font-medium transition-all shadow-sm"
          >
            ↺ Search with a Different Profile
          </button>
        </div>
      </div>

      {/* Floating chatbot */}
      <SchemeChatbot currentLang={lang} currentScheme={activeSchemeForBot} userProfile={profileData} />
    </div>
  );
}
