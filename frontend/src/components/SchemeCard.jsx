import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink, ChevronDown, ChevronUp, FileText,
  Gift, CheckCircle2, Navigation, MessageSquare, Radio
} from "lucide-react";
import AIInsightPanel from "./AIInsightPanel";
import VoiceOutput from "./VoiceOutput";
import { getSchemeSummary } from "../lib/api";

const MATCH_STYLES = {
  "Strong Match": "match-strong",
  "Good Match": "match-good",
  "Possible Match": "match-possible",
  "Low Relevance": "match-low",
};

const FUNDING_FORMAT = (n) => {
  if (!n) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(0)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

export default function SchemeCard({ match, lang = "en", index, onAskBot = null }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [showAI, setShowAI] = useState(false);
  const [localized, setLocalized] = useState(null);

  // Dynamically load translation if not pre-populated
  useEffect(() => {
    let isMounted = true;
    const existingWhat = match.plain_summary_what?.[lang];
    if (existingWhat) {
      setLocalized({
        what: match.plain_summary_what[lang],
        need: match.plain_summary_need?.[lang] || match.plain_summary_need?.en || "",
        apply: match.plain_summary_apply?.[lang] || match.plain_summary_apply?.en || "",
      });
    } else if (lang !== "en") {
      getSchemeSummary(match.scheme_id, lang)
        .then((data) => {
          if (isMounted && data) {
            setLocalized({
              what: data.what,
              need: data.need,
              apply: data.apply,
            });
          }
        })
        .catch(() => {});
    } else {
      setLocalized(null);
    }
    return () => { isMounted = false; };
  }, [lang, match]);

  const what = localized?.what || match.plain_summary_what?.[lang] || match.plain_summary_what?.en || match.benefit_description || "";
  const need = localized?.need || match.plain_summary_need?.[lang] || match.plain_summary_need?.en || "";
  const apply = localized?.apply || match.plain_summary_apply?.[lang] || match.plain_summary_apply?.en || "";
  const fullText = `${what}. ${need}. ${apply}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover"
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${MATCH_STYLES[match.match_label] || "match-low"}`}>
                {match.match_label} • {Math.round(match.combined_score * 100)}%
              </span>
              {match.funding_max > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Up to {FUNDING_FORMAT(match.funding_max)}
                </span>
              )}
              {match.is_live_synced && (
                <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <Radio size={10} className="text-emerald-500 animate-pulse" /> Live Ingested
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{match.name}</h3>
            <p className="text-gray-500 text-xs">{match.issuing_body}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <VoiceOutput text={fullText} lang={lang} label="▶ Listen" />
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1"
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
              {/* 3 summary sections */}
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-green-50/80 border border-green-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Gift size={15} className="text-green-600" />
                    <span className="text-green-700 font-bold text-xs uppercase tracking-wide">What you get</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{what || "See official link for details."}</p>
                </div>
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={15} className="text-blue-600" />
                    <span className="text-blue-700 font-bold text-xs uppercase tracking-wide">What you need</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{need || "Check eligibility on the official portal."}</p>
                </div>
                <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Navigation size={15} className="text-amber-600" />
                    <span className="text-amber-700 font-bold text-xs uppercase tracking-wide">How to apply</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{apply || "Visit the official portal to apply."}</p>
                </div>
              </div>

              {/* Document checklist */}
              {match.required_documents?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={15} className="text-gray-500" />
                    <span className="text-gray-600 font-semibold text-sm">Documents Needed</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.required_documents.map((doc) => (
                      <span key={doc} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                        ✓ {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer: AI Insight toggle + Apply link */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAI((v) => !v)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
                  >
                    🧠 {showAI ? "Hide" : "Show"} AI Match Explanation
                  </button>
                  {onAskBot && (
                    <button
                      onClick={() => onAskBot(match)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors"
                    >
                      <MessageSquare size={12} /> Ask Bot About This
                    </button>
                  )}
                </div>

                <a
                  href={match.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Apply Now <ExternalLink size={14} />
                </a>
              </div>

              {/* AI Insight Panel */}
              {showAI && <AIInsightPanel match={match} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
