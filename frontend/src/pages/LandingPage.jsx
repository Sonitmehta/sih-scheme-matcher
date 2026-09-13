import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mic, Globe2, Users, ChevronRight, Zap, ShieldCheck, Languages } from "lucide-react";
import PersonaPresets from "../components/PersonaPresets";
import SchemeChatbot from "../components/SchemeChatbot";

// Animated counter component
function AnimatedCounter({ target, label, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-white">
        {count.toLocaleString("en-IN")}{suffix}
      </div>
      <div className="text-indigo-200 text-sm mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [showPresets, setShowPresets] = useState(false);

  const handlePresetSelect = (profile) => {
    navigate("/match", { state: { presetProfile: profile } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-700 to-purple-800">
      {/* Top nav bar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
            <Sparkles size={18} className="text-indigo-900" />
          </div>
          <span className="text-white font-bold text-lg">SchemeAI</span>
          <span className="text-indigo-300 text-xs ml-1">by SIH 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-indigo-200 hover:text-white text-sm transition-colors">
            About
          </button>
          <button
            onClick={() => navigate("/match")}
            className="bg-amber-400 text-indigo-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors"
          >
            Find Schemes →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-800 border border-indigo-500 text-indigo-200 text-sm px-4 py-1.5 rounded-full mb-6">
            <Zap size={14} className="text-amber-400" />
            AI-Powered • Multilingual • Offline-first
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Find Government Schemes
            <br />
            <span className="text-amber-400">Made for You</span>
          </h1>
          <p className="text-indigo-200 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Hundreds of schemes exist for women, SC/ST/OBC, minorities, PwD &amp; rural entrepreneurs —
            but discovering them takes weeks. <strong className="text-white">We do it in 90 seconds.</strong>
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate("/match")}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-indigo-900 font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Sparkles size={20} />
              Start Matching — Free
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setShowPresets(true)}
              className="flex items-center gap-2 border-2 border-indigo-400 text-white hover:bg-indigo-800 font-semibold text-lg px-8 py-4 rounded-2xl transition-all"
            >
              <Zap size={20} />
              Try a Demo Persona
            </button>
          </div>

          {/* Impact stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-4">
            <AnimatedCounter target={25} label="Schemes Active" suffix="+" />
            <AnimatedCounter target={10} label="Regional Languages" suffix="+" />
            <AnimatedCounter target={90} label="Seconds to Results" suffix="s" />
          </div>
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-center text-gray-500 mb-12">
            AI that understands your story, not just your checkboxes
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users size={28} className="text-indigo-600" />,
                title: "1. Tell Us About You",
                desc: "Category, state, sector, business stage — takes 60 seconds. Or speak in Hindi/Marathi.",
                color: "bg-indigo-50 border-indigo-100"
              },
              {
                icon: <Sparkles size={28} className="text-amber-500" />,
                title: "2. AI Matches Your Profile",
                desc: "Our NLP engine reads your business description and finds schemes that match semantically — not just by keywords.",
                color: "bg-amber-50 border-amber-100"
              },
              {
                icon: <ShieldCheck size={28} className="text-green-600" />,
                title: "3. Get Your Top Schemes",
                desc: "Ranked results with plain-language summaries, document checklists, and voice output in 3 languages.",
                color: "bg-green-50 border-green-100"
              }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`${f.color} border rounded-2xl p-6 card-hover`}
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Multilingual section */}
      <section className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Languages size={40} className="mx-auto text-indigo-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Speak &amp; Hear in Your Native Language</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience complete text and voice assistance across <strong>10 Indian Regional Languages</strong>.
            Click the speaker button anywhere to listen in your mother tongue.
          </p>
          <div className="flex justify-center gap-3 flex-wrap max-w-4xl mx-auto">
            {[
              "🇬🇧 English", "🟧 हिंदी (Hindi)", "🔵 मराठी (Marathi)",
              "🟨 தமிழ் (Tamil)", "🟣 తెలుగు (Telugu)", "🟩 বাংলা (Bengali)",
              "🟥 ગુજરાતી (Gujarati)", "🟦 ಕನ್ನಡ (Kannada)", "🟫 മലയാളം (Malayalam)", "🟨 ਪੰਜਾਬੀ (Punjabi)"
            ].map((lang) => (
              <span key={lang} className="bg-white border border-indigo-200 text-indigo-800 px-4 py-2 rounded-2xl font-semibold shadow-sm text-xs md:text-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-indigo-300 text-center py-8 text-sm">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Globe2 size={16} />
          <span>Powered by Sentence-BERT · Bhashini · gTTS · FastAPI · React</span>
        </div>
        <p>SIH 2026 — Problem Statement #26092 · AI-Driven Scheme Matching for Marginalized Entrepreneurs</p>
      </footer>

      {/* Persona Presets Modal */}
      {showPresets && (
        <PersonaPresets
          onSelect={handlePresetSelect}
          onClose={() => setShowPresets(false)}
        />
      )}

      {/* Floating AI Scheme Assistant */}
      <SchemeChatbot currentLang="en" />
    </div>
  );
}
