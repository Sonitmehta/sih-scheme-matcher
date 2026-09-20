import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Mic, Globe2, Users, ChevronRight, Languages,
  Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2, FileText, Building2
} from "lucide-react";
import PersonaPresets from "../components/PersonaPresets";
import SchemeChatbot from "../components/SchemeChatbot";

// Animated counter
function AnimatedCounter({ target, label, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(target / 50));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <div className="text-center">
      <div className="text-3xl font-black text-green-700">{count.toLocaleString("en-IN")}{suffix}</div>
      <div className="text-gray-500 text-xs mt-0.5 font-medium">{label}</div>
    </div>
  );
}

const CATEGORIES = [
  { label: "Women Entrepreneurs", icon: "👩‍💼" },
  { label: "SC / ST", icon: "🤝" },
  { label: "OBC", icon: "🏅" },
  { label: "Minorities", icon: "🌙" },
  { label: "PwD", icon: "♿" },
  { label: "Youth / Students", icon: "🎓" },
  { label: "Farmers", icon: "🌾" },
  { label: "Rural Entrepreneurs", icon: "🏘️" },
];

const LANGS = [
  { label: "English", native: "English" },
  { label: "Hindi", native: "हिंदी" },
  { label: "Marathi", native: "मराठी" },
  { label: "Tamil", native: "தமிழ்" },
  { label: "Telugu", native: "తెలుగు" },
  { label: "Bengali", native: "বাংলা" },
  { label: "Gujarati", native: "ગુજરાતી" },
  { label: "Kannada", native: "ಕನ್ನಡ" },
  { label: "Malayalam", native: "മലയാളം" },
  { label: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Enter Your Details",
    desc: "Tell us your category, state, sector, and business stage. Takes less than 60 seconds. You can also speak in Hindi or Marathi.",
    icon: <Users size={22} className="text-green-700" />,
  },
  {
    step: "02",
    title: "AI Matches Your Profile",
    desc: "Our Sentence-BERT model semantically understands your business description and filters schemes you actually qualify for.",
    icon: <Sparkles size={22} className="text-green-700" />,
  },
  {
    step: "03",
    title: "Get Ranked Results",
    desc: "Receive ranked scheme cards with plain-language summaries, document checklists, and voice readout in your language.",
    icon: <ShieldCheck size={22} className="text-green-700" />,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showPresets, setShowPresets] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");

  const handlePresetSelect = (profile) => {
    navigate("/match", { state: { presetProfile: profile } });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white text-lg font-black">
              🏛️
            </div>
            <div>
              <div className="font-black text-gray-900 text-base leading-none">SchemeAI</div>
              <div className="text-[10px] text-gray-400 leading-none mt-0.5">Powered by AI · SIH 2026</div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <button onClick={() => navigate("/match")} className="hover:text-green-700 transition-colors">Find Schemes</button>
            <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-green-700 transition-colors">myScheme Portal</a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-700 border border-green-300 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors">
              <Globe2 size={13} /> English (EN)
            </button>
            <button
              onClick={() => navigate("/match")}
              className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              Find Schemes <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-green-50 to-white pt-14 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live data from myscheme.gov.in · Auto-updated every 6 hours
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-5">
              Find Government Schemes<br />
              <span className="text-green-700">Made For You</span>
            </h1>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              AI-powered scheme discovery for women, SC/ST/OBC, minorities, PwD & rural entrepreneurs.
              <strong className="text-gray-800"> Get matched in under 90 seconds.</strong>
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
              <button
                onClick={() => navigate("/match")}
                className="flex items-center gap-2.5 bg-green-700 hover:bg-green-800 text-white font-bold text-base px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Search size={18} />
                Find Schemes for Me
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setShowPresets(true)}
                className="flex items-center gap-2.5 border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700 font-semibold text-base px-8 py-3.5 rounded-full transition-all"
              >
                <Zap size={18} />
                Try a Demo Profile
              </button>
            </div>

            {/* Stats bar */}
            <div className="inline-flex items-center gap-10 bg-white border border-gray-200 rounded-2xl px-10 py-5 shadow-sm">
              <AnimatedCounter target={1000} suffix="+" label="Schemes Indexed" />
              <div className="w-px h-10 bg-gray-200" />
              <AnimatedCounter target={10} suffix="" label="Regional Languages" />
              <div className="w-px h-10 bg-gray-200" />
              <AnimatedCounter target={90} suffix="s" label="Avg. Time to Results" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category quick-filter chips ───────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 text-center">Browse by Category</p>
          <div className="flex gap-2.5 flex-wrap justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate("/match")}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:border-green-500 hover:text-green-700 hover:bg-green-50 px-4 py-2 rounded-full transition-all shadow-sm"
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 text-sm">Three simple steps to discover schemes you qualify for</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-gray-100">{step.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features strip ────────────────────────────────────── */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🤖", title: "AI Matching", desc: "Sentence-BERT semantic engine goes beyond keyword matching" },
              { icon: "🔊", title: "Voice in 10 Languages", desc: "Listen to any scheme in Hindi, Tamil, Telugu & 7 more" },
              { icon: "💬", title: "AI Chatbot", desc: "Ask questions about eligibility, documents & how to apply" },
              { icon: "🔄", title: "Live Data", desc: "Schemes auto-synced every 6 hours from myscheme.gov.in" },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 items-start p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all">
                <span className="text-3xl shrink-0">{f.icon}</span>
                <div>
                  <div className="font-bold text-gray-900 text-sm mb-1">{f.title}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages ─────────────────────────────────────────── */}
      <section className="bg-green-700 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Languages size={36} className="mx-auto text-green-200 mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Available in 10 Indian Languages</h2>
          <p className="text-green-200 text-sm mb-8">Full UI, scheme summaries & voice output — all in your mother tongue</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {LANGS.map((l) => (
              <span
                key={l.label}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-default"
              >
                {l.native}
                <span className="ml-1.5 text-green-300 text-xs font-normal">({l.label})</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Ready to find your eligible schemes?</h2>
          <p className="text-gray-500 text-sm mb-8">It takes less than 2 minutes. No login required.</p>
          <button
            onClick={() => navigate("/match")}
            className="inline-flex items-center gap-2.5 bg-green-700 hover:bg-green-800 text-white font-bold text-base px-10 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Search size={18} /> Start Now — It's Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-sm">🏛️</div>
              <div>
                <div className="text-white font-bold text-sm">SchemeAI</div>
                <div className="text-[11px] text-gray-500">SIH 2026 — Problem Statement #26092</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">myScheme Portal</a>
              <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Digital India</a>
            </div>
            <div className="text-[11px] text-center text-gray-600">
              Data source: myscheme.gov.in · Powered by FastAPI + Sentence-BERT + React
            </div>
          </div>
        </div>
      </footer>

      {/* Presets modal */}
      {showPresets && (
        <PersonaPresets onSelect={handlePresetSelect} onClose={() => setShowPresets(false)} />
      )}

      {/* Floating AI chatbot */}
      <SchemeChatbot currentLang="en" />
    </div>
  );
}
