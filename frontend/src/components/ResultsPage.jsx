import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Languages, Sparkles, TrendingUp, Users, ArrowLeft,
  Radio, RefreshCw, Search, Loader2, ExternalLink
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

const PAGE_UI = {
  en: { back: "Back", found: "Eligible Schemes Found", langSelect: "Choose Language for Text & Native Voice (10 Languages):", searchLive: "Search any government scheme live in real time:", searchBtn: "Search", searching: "Searching...", topMatches: "Best Matching Schemes", otherMatches: "Also Worth Exploring", retry: "↺ Search with a Different Profile", liveBadge: "Live from myscheme.gov.in", pool: "Total Schemes in Pool", passed: "Passed Rule Filter", aiMatches: "AI Ranked Matches" },
  hi: { back: "वापस", found: "पात्र सरकारी योजनाएं मिलीं", langSelect: "पाठ और मूल आवाज़ हेतु भाषा चुनें (10 भाषाएँ):", searchLive: "वास्तविक समय में किसी भी सरकारी योजना को खोजें:", searchBtn: "खोजें", searching: "खोज रहे हैं...", topMatches: "सर्वोत्तम अनुशंसित योजनाएं", otherMatches: "अन्य उपयोगी योजनाएं", retry: "↺ भिन्न प्रोफ़ाइल के साथ खोजें", liveBadge: "myscheme.gov.in से लाइव", pool: "कुल योजनाएं", passed: "पात्रता उत्तीर्ण", aiMatches: "AI अनुशंसित" },
  mr: { back: "मागे", found: "पात्र सरकारी योजना मिळाल्या", langSelect: "मजकूर आणि मूळ आवाजासाठी भाषा निवडा (10 भाषा):", searchLive: "रिअल-टाइममध्ये कोणतीही सरकारी योजना शोधा:", searchBtn: "शोधा", searching: "शोधत आहे...", topMatches: "सर्वोत्तम शिफारस केलेल्या योजना", otherMatches: "इतर उपयुक्त योजना", retry: "↺ वेगळ्या प्रोफाइलसह शोधा", liveBadge: "myscheme.gov.in वरून थेट", pool: "एकूण योजना", passed: "पात्रता उत्तीर्ण", aiMatches: "AI शिफारस" },
  ta: { back: "பின்செல்", found: "தகுதியான அரசுத் திட்டங்கள் கிடைத்தன", langSelect: "உரை மற்றும் குரலுக்கான மொழியைத் தேர்ந்தெடுக்கவும் (10 மொழிகள்):", searchLive: "அரசுத் திட்டங்களை நிகழ்நேரத்தில் தேடுங்கள்:", searchBtn: "தேடு", searching: "தேடுகிறது...", topMatches: "மிகவும் பொருத்தமான திட்டங்கள்", otherMatches: "பிற பயனுள்ள திட்டங்கள்", retry: "↺ வேறு விவரக்குறிப்புடன் தேடவும்", liveBadge: "myscheme.gov.in நேரலை", pool: "மொத்த திட்டங்கள்", passed: "தகுதி பெற்றது", aiMatches: "AI தரவரிசை" },
  te: { back: "వెనుకకు", found: "అర్హత కలిగిన ప్రభుత్వ పథకాలు లభించాయి", langSelect: "వచనం మరియు వాయిస్ కోసం భాషను ఎంచుకోండి (10 భాషలు):", searchLive: "రియల్ టైమ్‌లో ఏదైనా ప్రభుత్వ పథకాన్ని శోధించండి:", searchBtn: "శోధించండి", searching: "శోధిస్తోంది...", topMatches: "ఉత్తమ సిఫార్సు పథకాలు", otherMatches: "ఇతర ఉపయోగకరమైన పథకాలు", retry: "↺ వేరే ప్రొఫైల్‌తో శోధించండి", liveBadge: "myscheme.gov.in నుండి లైవ్", pool: "మొత్తం పథకాలు", passed: "అర్హత సాధించినవి", aiMatches: "AI ర్యాంక్ పథకాలు" },
  bn: { back: "ফিরে যান", found: "যোগ্য সরকারি প্রকল্প পাওয়া গেছে", langSelect: "পাঠ্য ও কণ্ঠের জন্য ভাষা নির্বাচন করুন (১০টি ভাষা):", searchLive: "রিয়েল-টাইমে যেকোনো সরকারি স্কিম অনুসন্ধান করুন:", searchBtn: "অনুসন্ধান", searching: "অনুসন্ধান করা হচ্ছে...", topMatches: "সর্বোত্তম প্রস্তাবিত প্রকল্প", otherMatches: "অন্যান্য কার্যকর প্রকল্প", retry: "↺ অন্য প্রোফাইল দিয়ে অনুসন্ধান করুন", liveBadge: "myscheme.gov.in থেকে লাইভ", pool: "মোট প্রকল্প", passed: "যোগ্যতা উত্তীর্ণ", aiMatches: "AI প্রস্তাবিত" },
  gu: { back: "પાછા જાઓ", found: "પાત્ર સરકારી યોજનાઓ મળી", langSelect: "ટેક્સ્ટ અને અવાજ માટે ભાષા પસંદ કરો (10 ભાષાઓ):", searchLive: "વાસ્તવિક સમયમાં કોઈપણ સરકારી યોજના શોધો:", searchBtn: "શોધો", searching: "શોધી રહ્યું છે...", topMatches: "શ્રેષ્ઠ ભલામણ કરેલ યોજનાઓ", otherMatches: "અન્ય ઉપયોગી યોજનાઓ", retry: "↺ અલગ પ્રોફાઇલ સાથે શોધો", liveBadge: "myscheme.gov.in થી લાઇવ", pool: "કુલ યોજનાઓ", passed: "પાત્રતા પાસ", aiMatches: "AI ક્રમાંકિત" },
  kn: { back: "ಹಿಂದೆ", found: "ಅರ್ಹ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು ದೊರೆತಿವೆ", langSelect: "ಪಠ್ಯ ಮತ್ತು ಧ್ವನಿಗಾಗಿ ಭಾಷೆಯನ್ನು ಆರಿಸಿ (10 ಭಾಷೆಗಳು):", searchLive: "ನೈಜ ಸಮಯದಲ್ಲಿ ಯಾವುದೇ ಸರ್ಕಾರಿ ಯೋಜನೆಯನ್ನು ಹುಡುಕಿ:", searchBtn: "ಹುಡುಕಿ", searching: "ಹುಡುಕಲಾಗುತ್ತಿದೆ...", topMatches: "ಅತ್ಯುತ್ತಮ ಹೊಂದಾಣಿಕೆಯ ಯೋಜನೆಗಳು", otherMatches: "ಇತರ ಉಪಯುಕ್ತ ಯೋಜನೆಗಳು", retry: "↺ ಬೇರೆ ಪ್ರೊಫೈಲ್‌ನೊಂದಿಗೆ ಹುಡುಕಿ", liveBadge: "myscheme.gov.in ಲೈವ್", pool: "ಒಟ್ಟು ಯೋಜನೆಗಳು", passed: "ಅರ್ಹತೆ ಪಡೆದವು", aiMatches: "AI ಶ್ರೇಯಾಂಕ" },
  ml: { back: "പിന്നോട്ട്", found: "അർഹമായ സർക്കാർ പദ്ധതികൾ കണ്ടെത്തി", langSelect: "ടെക്സ്റ്റിനും ശബ്ദത്തിനുമായി ഭാഷ തിരഞ്ഞെടുക്കുക (10 ഭാഷകൾ):", searchLive: "ഏതൊരു സർക്കാർ പദ്ധതിയും തത്സമയം തിരയുക:", searchBtn: "തിരയുക", searching: "തിരയുന്നു...", topMatches: "ഏറ്റവും അനുയോജ്യമായ പദ്ധതികൾ", otherMatches: "മറ്റ് ഉപയോഗപ്രദമായ പദ്ധതികൾ", retry: "↺ മറ്റൊരു പ്രൊഫൈൽ ഉപയോഗിച്ച് തിരയുക", liveBadge: "myscheme.gov.in ലൈവ്", pool: "ആകെ പദ്ധതികൾ", passed: "യോഗ്യത നേടിയത്", aiMatches: "AI റാങ്കിംഗ്" },
  pa: { back: "ਵਾਪਸ", found: "ਯੋਗ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਮਿਲੀਆਂ", langSelect: "ਟੈਕਸਟ ਅਤੇ ਆਵਾਜ਼ ਲਈ ਭਾਸ਼ਾ ਚੁਣੋ (10 ਭਾਸ਼ਾਵਾਂ):", searchLive: "ਰੀਅਲ ਟਾਈਮ ਵਿੱਚ ਕੋਈ ਵੀ ਸਰਕਾਰੀ ਸਕੀਮ ਖੋਜੋ:", searchBtn: "ਖੋਜੋ", searching: "ਖੋਜ ਰਿਹਾ ਹੈ...", topMatches: "ਸਭ ਤੋਂ ਵਧੀਆ ਸਿਫ਼ਾਰਿਸ਼ ਕੀਤੀਆਂ ਸਕੀਮਾਂ", otherMatches: "ਹੋਰ ਲਾਭਦਾਇਕ ਸਕੀਮਾਂ", retry: "↺ ਵੱਖਰੇ ਪ੍ਰੋਫਾਈਲ ਨਾਲ ਦੁਬਾਰਾ ਖੋਜੋ", liveBadge: "myscheme.gov.in ਤੋਂ ਲਾਈਵ", pool: "ਕੁੱਲ ਸਕੀਮਾਂ", passed: "ਯੋਗਤਾ ਪਾਸ", aiMatches: "AI ਦਰਜਾਬੰਦੀ" }
};

export default function ResultsPage({ matchData: initialData, profileData, onRetry }) {
  const [lang, setLang] = useState("en");
  const [matchData, setMatchData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [syncing, setSyncing] = useState(false);
  const [activeSchemeForBot, setActiveSchemeForBot] = useState(null);
  const [liveQuery, setLiveQuery] = useState("");
  const [liveSearching, setLiveSearching] = useState(false);
  const [liveResults, setLiveResults] = useState([]);

  const pUi = PAGE_UI[lang] || PAGE_UI.en;

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
      const results = await searchLiveSchemes(liveQuery);
      setLiveResults(results?.schemes || []);
    } catch { setLiveResults([]); }
    finally { setLiveSearching(false); }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50 dark:bg-[#090e17]">
        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-gray-900 dark:text-white font-bold text-lg">Finding your eligible schemes...</p>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Matching against 1,000+ government databases with Sentence-BERT</p>
        </div>
      </div>
    );
  }

  if (!matchData) return null;

  const matches = matchData.matches || [];
  const strong = matches.filter((m) => m.match_label === "Strong Match" || m.match_label === "Good Match");
  const others = matches.filter((m) => m.match_label === "Possible Match" || m.match_label === "Low Relevance");

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#090e17]">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            >
              <ArrowLeft size={16} /> {pUi.back}
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                {matches.length} {pUi.found}
              </span>
              <span className="text-gray-400 dark:text-slate-500 text-xs hidden sm:inline">
                · {profileData?.category || "General"} · {profileData?.state || "All India"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Live Ingestion Active
            </div>
            <button
              onClick={handleSyncLive}
              disabled={syncing}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-full transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={12} className={syncing ? "animate-spin text-blue-600" : ""} />
              {syncing ? "Syncing..." : "Sync"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">

        {/* ── Pipeline stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: pUi.pool,      value: matchData.pipeline_info?.total_schemes || 24, color: "text-gray-900 dark:text-white" },
            { label: pUi.passed,    value: matchData.pipeline_info?.after_rule_filter || "–", color: "text-blue-600" },
            { label: pUi.aiMatches, value: matches.length, color: "text-blue-700 dark:text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-slate-700 p-4 text-center shadow-sm">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 dark:text-slate-400 text-[11px] mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Language Selector ── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Languages size={16} className="text-blue-600" />
            <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{pUi.langSelect}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 ${
                  lang === l.code
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105"
                    : "bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-400 border border-gray-200 dark:border-slate-700"
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.native}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Live Search ── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 mb-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Search size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-gray-800 dark:text-slate-200">{pUi.searchLive}</span>
            </div>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-semibold">
              {pUi.liveBadge}
            </span>
          </div>
          <form onSubmit={handleLiveSearch} className="flex gap-2">
            <input
              type="text"
              value={liveQuery}
              onChange={(e) => setLiveQuery(e.target.value)}
              placeholder="e.g. 'solar pump subsidy', 'women handicraft loan', 'drone policy'..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 transition-colors"
            />
            <button
              type="submit"
              disabled={liveSearching || !liveQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-full transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {liveSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              {liveSearching ? pUi.searching : pUi.searchBtn}
            </button>
          </form>

          {liveResults.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-1.5 mb-2">
                <Radio size={12} className="text-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-800 dark:text-slate-200">Found {liveResults.length} live schemes:</span>
              </div>
              {liveResults.map((lr, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 bg-blue-50/40 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-gray-900 dark:text-white text-xs">{lr.name}</h5>
                    <p className="text-gray-600 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2">{lr.benefit_description}</p>
                  </div>
                  <a
                    href={lr.official_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    View <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top Matches ── */}
        {strong.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={17} className="text-blue-600" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base">{pUi.topMatches}</h2>
              <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-800">
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

        {/* ── Other Matches ── */}
        {others.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Users size={17} className="text-blue-500" />
              <h2 className="font-bold text-gray-900 dark:text-white text-base">{pUi.otherMatches}</h2>
              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-800">
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
            className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-800 px-6 py-2.5 rounded-full font-medium transition-all shadow-sm"
          >
            {pUi.retry}
          </button>
        </div>
      </div>

      <SchemeChatbot currentLang={lang} currentScheme={activeSchemeForBot} userProfile={profileData} />
    </div>
  );
}
