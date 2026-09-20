import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Globe2, Users, ChevronRight, Languages,
  Sparkles, ShieldCheck, Zap, ArrowRight, Sun, Moon
} from "lucide-react";
import PersonaPresets from "../components/PersonaPresets";
import SchemeChatbot from "../components/SchemeChatbot";
import { useTheme } from "../context/ThemeContext";
// Hero banner served from /public (avoids Vite rolldown binary-import limitation)
const heroBanner = "/hero_banner.jpg";

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
      <div className="text-3xl font-black text-blue-600">{count.toLocaleString("en-IN")}{suffix}</div>
      <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 font-medium">{label}</div>
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
  { label: "Rural Artisans", icon: "🎨" },
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
    desc: "Tell us your category, state, sector, and business stage. Takes less than 60 seconds. You can also speak your details in regional languages.",
    icon: <Users size={22} className="text-blue-600" />,
  },
  {
    step: "02",
    title: "AI Matches Your Profile",
    desc: "Our Sentence-BERT semantic engine understands your business craft and filters 1,000+ government schemes down to what you qualify for.",
    icon: <Sparkles size={22} className="text-blue-600" />,
  },
  {
    step: "03",
    title: "Get Ranked Results",
    desc: "Receive ranked scheme cards with plain-language summaries, document checklists, and authentic regional voice readout in your mother tongue.",
    icon: <ShieldCheck size={22} className="text-blue-600" />,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showPresets, setShowPresets] = useState(false);
  const { dark, toggle } = useTheme();

  const handlePresetSelect = (profile) => {
    navigate("/match", { state: { presetProfile: profile } });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#090e17] font-sans transition-colors duration-200">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-black shadow-sm">🏛️</div>
            <div>
              <div className="font-black text-gray-900 dark:text-white text-lg leading-none">SchemeAI</div>
              <div className="text-[10px] text-blue-600 font-semibold leading-none mt-1">Smart India Hackathon 2026 · PS #26092</div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-slate-400">
            <button onClick={() => navigate("/match")} className="hover:text-blue-600 transition-colors">Find Schemes</button>
            <button onClick={() => setShowPresets(true)} className="hover:text-blue-600 transition-colors">Demo Presets</button>
            <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">myScheme Portal</a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2.5 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => navigate("/match")}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 px-3.5 py-2 rounded-full transition-colors"
            >
              <Globe2 size={13} /> 10 Regional Languages
            </button>
            <button
              onClick={() => navigate("/match")}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-md shadow-blue-500/20 hover:scale-105"
            >
              Find Schemes <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero — split layout with image (inspired by myscheme.gov.in) ── */}
      <section className="bg-gradient-to-br from-blue-50/80 via-white to-white dark:from-[#0d1929] dark:via-[#090e17] dark:to-[#090e17] border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Left — text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 min-w-0"
            >
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Live data from myscheme.gov.in · Auto-updated every 6 hours
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-5">
                Find Government<br />
                Schemes{" "}
                <span className="text-blue-600">Made For You</span>
              </h1>
              <p className="text-gray-600 dark:text-slate-400 text-base max-w-xl mb-8 leading-relaxed">
                AI-driven scheme matching for women, SC/ST/OBC, minorities, PwD & rural entrepreneurs.{" "}
                <strong className="text-gray-900 dark:text-white">Connect with eligible subsidies in under 90 seconds.</strong>
              </p>

              {/* CTA row */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <button
                  onClick={() => navigate("/match")}
                  className="flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-3.5 rounded-full transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105"
                >
                  <Search size={18} />
                  Find Schemes for Me
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => setShowPresets(true)}
                  className="flex items-center justify-center gap-2.5 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 font-semibold text-base px-8 py-3.5 rounded-full transition-all hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                >
                  <Zap size={18} className="text-amber-500" />
                  Try Demo Persona
                </button>
              </div>

              {/* Stats bar */}
              <div className="inline-flex items-center gap-8 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-slate-700 rounded-2xl px-8 py-4 shadow-sm">
                <AnimatedCounter target={1000} suffix="+" label="Schemes Indexed" />
                <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
                <AnimatedCounter target={10} suffix="" label="Regional Languages" />
                <div className="w-px h-10 bg-gray-200 dark:bg-slate-700" />
                <AnimatedCounter target={90} suffix="s" label="Avg. Time to Results" />
              </div>
            </motion.div>

            {/* Right — Hero Illustration (like myscheme.gov.in) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex-shrink-0 w-full md:w-[48%] max-w-lg"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/15 border border-blue-100 dark:border-slate-700">
                <img
                  src={heroBanner}
                  alt="Diverse Indian entrepreneurs benefitting from government schemes"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                {/* Overlay caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-transparent px-5 py-4">
                  <p className="text-white text-sm font-semibold leading-snug">
                    Empowering 60 crore+ marginalized entrepreneurs across India 🇮🇳
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Category chips ── */}
      <section className="bg-white dark:bg-[#0f172a] border-b border-gray-100 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3.5 text-center">Browse by Target Category</p>
          <div className="flex gap-2.5 flex-wrap justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => navigate("/match")}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 px-4 py-2 rounded-full transition-all shadow-sm"
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-slate-50/60 dark:bg-[#090e17] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">How It Works</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Three simple steps to discover schemes you qualify for</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-slate-700 p-7 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-blue-100 dark:text-blue-900/80">{step.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="bg-white dark:bg-[#0f172a] py-16 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🤖", title: "Sentence-BERT AI", desc: "Maps your business craft to scheme eligibility semantically" },
              { icon: "🔊", title: "Native Regional Voice", desc: "High-fidelity authentic voice in Tamil, Telugu, Hindi & 7 more" },
              { icon: "💬", title: "Multilingual Chatbot", desc: "Ask questions on applications, document checklists & loans" },
              { icon: "🔄", title: "Live Syncing", desc: "Auto-synced every 6 hours directly from myscheme.gov.in" },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 items-start p-5 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all">
                <span className="text-3xl shrink-0">{f.icon}</span>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">{f.title}</div>
                  <div className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages banner ── */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950 py-14 shadow-inner">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Languages size={36} className="mx-auto text-blue-200 mb-4" />
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Available in 10 Indian Regional Languages</h2>
          <p className="text-blue-100 text-sm mb-8">Full UI, scheme cards, and authentic native speaker voice readout</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {LANGS.map((l) => (
              <span
                key={l.label}
                className="bg-white/15 hover:bg-white/25 border border-white/25 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-default backdrop-blur-sm"
              >
                {l.native}
                <span className="ml-1.5 text-blue-200 text-xs font-normal">({l.label})</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-slate-50 dark:bg-[#090e17] py-16 border-t border-gray-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Ready to find your eligible schemes?</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Takes less than 2 minutes. No paperwork or sign up needed.</p>
          <button
            onClick={() => navigate("/match")}
            className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-10 py-4 rounded-full transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105"
          >
            <Search size={18} /> Start Matching Now — Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0B1727] text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black">🏛️</div>
              <div>
                <div className="text-white font-bold text-sm">SchemeAI</div>
                <div className="text-[11px] text-gray-400">SIH 2026 — Problem Statement #26092</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs font-medium">
              <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">myScheme Portal</a>
              <a href="https://digitalindia.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors">Digital India</a>
            </div>
            <div className="text-[11px] text-center text-gray-500">
              Data source: myscheme.gov.in · Built with FastAPI, Sentence-BERT &amp; React
            </div>
          </div>
        </div>
      </footer>

      {showPresets && (
        <PersonaPresets onSelect={handlePresetSelect} onClose={() => setShowPresets(false)} />
      )}

      <SchemeChatbot currentLang="en" />
    </div>
  );
}
