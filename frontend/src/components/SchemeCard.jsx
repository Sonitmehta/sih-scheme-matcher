import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink, ChevronDown, ChevronUp, FileText,
  Gift, CheckCircle2, Navigation, MessageSquare, Radio
} from "lucide-react";
import AIInsightPanel from "./AIInsightPanel";
import VoiceOutput from "./VoiceOutput";
import { getSchemeSummary } from "../lib/api";

const MATCH_CONFIG = {
  "Strong Match": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", dot: "bg-blue-600" },
  "Good Match":   { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300", dot: "bg-indigo-600" },
  "Possible Match": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", dot: "bg-amber-500" },
  "Low Relevance":  { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", dot: "bg-slate-400" },
};

const UI_STRINGS = {
  en: { what: "What you get", need: "Who can apply", apply: "How to apply", docs: "Documents Required", applyBtn: "Apply on Portal", listen: "Listen", showAi: "Show AI Explanation", hideAi: "Hide AI Explanation", askBot: "Ask Chatbot" },
  hi: { what: "योजना के लाभ", need: "पात्रता एवं शर्तें", apply: "आवेदन प्रक्रिया", docs: "आवश्यक दस्तावेज़", applyBtn: "पोर्टल पर आवेदन करें", listen: "सुनें", showAi: "AI मिलान विवरण", hideAi: "विवरण छिपाएं", askBot: "चैटबॉट से पूछें" },
  mr: { what: "योजनेचे फायदे", need: "पात्रता व अटी", apply: "अर्ज कसा करावा", docs: "आवश्यक कागदपत्रे", applyBtn: "पोर्टलवर अर्ज करा", listen: "ऐका", showAi: "AI स्पष्टीकरण", hideAi: "स्पष्टीकरण लपवा", askBot: "चॅटबॉटला विचारा" },
  ta: { what: "திட்டத்தின் பயன்கள்", need: "தகுதி வரம்புகள்", apply: "விண்ணப்பிக்கும் முறை", docs: "தேவையான ஆவணங்கள்", applyBtn: "போர்ட்டலில் விண்ணப்பிக்கவும்", listen: "கேளுங்கள்", showAi: "AI விளக்கம்", hideAi: "விளக்கத்தை மறை", askBot: "சாட்போட்டிடம் கேட்க" },
  te: { what: "పథకం ప్రయోజనాలు", need: "అర్హత నిబంధనలు", apply: "దరఖాస్తు విధానం", docs: "కావలసిన పత్రాలు", applyBtn: "పోర్టల్‌లో దరఖాస్తు చేయండి", listen: "వినండి", showAi: "AI వివరణ", hideAi: "వివరణ దాచండి", askBot: "చాట్‌బాట్‌ను అడగండి" },
  bn: { what: "প্রকল্পের সুবিধা", need: "যোগ্যতার মাপকাঠি", apply: "আবেদনের পদ্ধতি", docs: "প্রয়োজনীয় নথি", applyBtn: "পোর্টালে আবেদন করুন", listen: "শুনুন", showAi: "AI ব্যাখ্যা", hideAi: "ব্যাখ্যা লুকান", askBot: "চ্যাটবটকে জিজ্ঞাসা করুন" },
  gu: { what: "યોજનાના લાભો", need: "પાત્રતાના માપદંડ", apply: "અરજી કરવાની રીત", docs: "જરૂરી દસ્તાવેજો", applyBtn: "પોર્ટલ પર અરજી કરો", listen: "સાંભળો", showAi: "AI સમજૂતી", hideAi: "સમજૂતી છુપાવો", askBot: "ચેટબોટને પૂછો" },
  kn: { what: "ಯೋಜನೆಯ ಪ್ರಯೋಜನಗಳು", need: "ಅರ್ಹತೆಯ ಮಾನದಂಡ", apply: "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನ", docs: "ಅಗತ್ಯ ದಾಖಲೆಗಳು", applyBtn: "ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ", listen: "ಕೇಳಿ", showAi: "AI ವಿವರಣೆ", hideAi: "ವಿವರಣೆ ಮರೆಮಾಡಿ", askBot: "ಚಾಟ್‌ಬಾಟ್‌ಗೆ ಕೇಳಿ" },
  ml: { what: "പദ്ധതിയുടെ ആനുകൂല്യങ്ങൾ", need: "യോഗ്യതാ മാനണ്ഡം", apply: "അപേക്ഷിക്കേണ്ട വിധം", docs: "ആവശ്യമായ രേഖകൾ", applyBtn: "പോർട്ടലിൽ അപേക്ഷിക്കുക", listen: "കേൾക്കുക", showAi: "AI വിശദീകരണം", hideAi: "വിശദീകരണം മറയ്ക്കുക", askBot: "ചാറ്റ്ബോട്ടിനോട് ചോദിക്കുക" },
  pa: { what: "ਸਕੀਮ ਦੇ ਲਾਭ", need: "ਯੋਗਤਾ ਦੇ ਮਾਪਦੰਡ", apply: "ਅਪਲਾਈ ਕਰਨ ਦਾ ਤਰੀਕਾ", docs: "ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼", applyBtn: "ਪੋਰਟਲ 'ਤੇ ਅਪਲਾਈ ਕਰੋ", listen: "ਸੁਣੋ", showAi: "AI ਵਿਆਖਿਆ", hideAi: "ਵਿਆਖਿਆ ਛੁਪਾਓ", askBot: "ਚੈਟਬੋਟ ਨੂੰ ਪੁੱਛੋ" }
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

  const ui = UI_STRINGS[lang] || UI_STRINGS.en;

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
        .then((data) => {
          if (isMounted && data) {
            setLocalized({ what: data.what, need: data.need, apply: data.apply });
          }
        })
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
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden"
    >
      {/* ── Card Header ── */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Score circle */}
          <div className={`shrink-0 w-12 h-12 rounded-2xl ${style.bg} border ${style.border} flex flex-col items-center justify-center`}>
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
                <span className="text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold">
                  Up to {funding}
                </span>
              )}
              {match.is_live_synced && (
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                  <Radio size={10} className="text-blue-500 animate-pulse" /> Live
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-base leading-snug">{match.name}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{match.issuing_body}</p>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex items-center gap-1.5">
            <VoiceOutput text={fullText} lang={lang} label={ui.listen} compact={false} />
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-slate-100 transition-colors"
              title={expanded ? "Collapse" : "Expand"}
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
            <div className="border-t border-slate-100 px-5 py-5 space-y-4">
              {/* 3 summary panels with localized headers */}
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Gift size={14} className="text-blue-600" />
                    <span className="text-blue-800 font-bold text-xs tracking-wide">{ui.what}</span>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">{what || "See official portal for benefit details."}</p>
                </div>
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} className="text-indigo-600" />
                    <span className="text-indigo-800 font-bold text-xs tracking-wide">{ui.need}</span>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">{need || "Check eligibility on the official portal."}</p>
                </div>
                <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Navigation size={14} className="text-amber-600" />
                    <span className="text-amber-800 font-bold text-xs tracking-wide">{ui.apply}</span>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">{apply || "Visit the official portal to apply."}</p>
                </div>
              </div>

              {/* Documents */}
              {match.required_documents?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText size={13} className="text-gray-400" />
                    <span className="text-gray-700 font-semibold text-xs">{ui.docs}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.required_documents.map((doc) => (
                      <span key={doc} className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1 rounded-full font-medium">
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
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    🧠 {showAI ? ui.hideAi : ui.showAi}
                  </button>
                  {onAskBot && (
                    <button
                      onClick={() => onAskBot(match)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full border border-purple-200 transition-colors"
                    >
                      <MessageSquare size={12} /> {ui.askBot}
                    </button>
                  )}
                </div>
                <a
                  href={match.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm shadow-blue-500/20"
                >
                  {ui.applyBtn} <ExternalLink size={12} />
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
