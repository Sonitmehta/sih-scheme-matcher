import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink, ChevronDown, ChevronUp, FileText,
  Gift, CheckCircle2, Navigation, MessageSquare, Radio, Volume2
} from "lucide-react";
import AIInsightPanel from "./AIInsightPanel";
import VoiceOutput from "./VoiceOutput";
import { getSchemeSummary } from "../lib/api";

const MATCH_CONFIG = {
  "Strong Match": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", dot: "bg-green-500" },
  "Good Match":   { bg: "bg-blue-100",  text: "text-blue-800",  border: "border-blue-300",  dot: "bg-blue-500"  },
  "Possible Match": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", dot: "bg-amber-500" },
  "Low Relevance":  { bg: "bg-gray-100",  text: "text-gray-600",  border: "border-gray-300",  dot: "bg-gray-400"  },
};

const FUNDING_FORMAT = (n) => {
  if (!n || n === 0) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(0)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(0)} L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

export default function SchemeCard({ match, lang = "en", index, onAskBot = null }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [showAI, setShowAI] = useState(false);
  const [localized, setLocalized] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const existingWhat = match.plain_summary_what?.[lang];
    if (existingWhat) {
      setLocalized({
        what:  match.plain_summary_what[lang],
        need:  match.plain_summary_need?.[lang]  || match.plain_summary_need?.en  || "",
        apply: match.plain_summary_apply?.[lang] || match.plain_summary_apply?.en || "",
      });
    } else if (lang !== "en") {
      getSchemeSummary(match.scheme_id, lang)
        .then((data) => { if (isMounted && data) setLocalized({ what: data.what, need: data.need, apply: data.apply }); })
        .catch(() => {});
    } else {
      setLocalized(null);
    }
    return () => { isMounted = false; };
  }, [lang, match]);

  const what  = localized?.what  || match.plain_summary_what?.[lang]  || match.plain_summary_what?.en  || match.benefit_description || "";
  const need  = localized?.need  || match.plain_summary_need?.[lang]  || match.plain_summary_need?.en  || "";
  const apply = localized?.apply || match.plain_summary_apply?.[lang] || match.plain_summary_apply?.en || "";
  const fullText = [what, need, apply].filter(Boolean).join(". ");

  const style = MATCH_CONFIG[match.match_label] || MATCH_CONFIG["Low Relevance"];
  const funding = FUNDING_FORMAT(match.funding_max);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* ── Card Header ── */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Score circle */}
          <div className={`shrink-0 w-12 h-12 rounded-xl ${style.bg} border ${style.border} flex flex-col items-center justify-center`}>
            <span className={`text-base font-black ${style.text} leading-none`}>{Math.round(match.combined_score * 100)}</span>
            <span className={`text-[9px] font-bold ${style.text} leading-none mt-0.5`}>%</span>
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                {match.match_label}
              </span>
              {funding && (
                <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full font-semibold">
                  Up to {funding}
                </span>
              )}
              {match.is_live_synced && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  <Radio size={10} className="text-emerald-500 animate-pulse" /> Live
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-base leading-snug">{match.name}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{match.issuing_body}</p>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex items-center gap-1.5">
            <VoiceOutput text={fullText} lang={lang} compact />
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Expandable body ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-5 py-5 space-y-4">
              {/* 3 summary panels */}
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Gift size={14} className="text-green-600" />
                    <span className="text-green-700 font-bold text-[11px] uppercase tracking-wide">What you get</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{what || "See official portal for benefit details."}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    <span className="text-blue-700 font-bold text-[11px] uppercase tracking-wide">Who can apply</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{need || "Check eligibility on the official portal."}</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Navigation size={14} className="text-amber-600" />
                    <span className="text-amber-700 font-bold text-[11px] uppercase tracking-wide">How to apply</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{apply || "Visit the official portal to apply."}</p>
                </div>
              </div>

              {/* Documents */}
              {match.required_documents?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText size={13} className="text-gray-400" />
                    <span className="text-gray-600 font-semibold text-xs">Documents Required</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.required_documents.map((doc) => (
                      <span key={doc} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-full">
                        ✓ {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer row */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAI((v) => !v)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    🧠 {showAI ? "Hide" : "Show"} AI Explanation
                  </button>
                  {onAskBot && (
                    <button
                      onClick={() => onAskBot(match)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full border border-purple-200 transition-colors"
                    >
                      <MessageSquare size={12} /> Ask Chatbot
                    </button>
                  )}
                </div>
                <a
                  href={match.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm"
                >
                  Apply on Portal <ExternalLink size={12} />
                </a>
              </div>

              {/* AI panel */}
              {showAI && <AIInsightPanel match={match} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
