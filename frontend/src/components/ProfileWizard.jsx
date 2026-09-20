import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, ChevronRight, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import { createProfile, matchSchemes } from "../lib/api";

const STEPS = ["Category", "Location", "Sector", "Business", "Description"];

const CATEGORIES = [
  { id: "General", label: "General", emoji: "👤" },
  { id: "Women", label: "Women", emoji: "👩" },
  { id: "SC", label: "Scheduled Caste (SC)", emoji: "🏷️" },
  { id: "ST", label: "Scheduled Tribe (ST)", emoji: "🏕️" },
  { id: "OBC", label: "Other Backward Classes (OBC)", emoji: "📋" },
  { id: "Minority", label: "Minority (Muslim/Christian/Sikh/Buddhist)", emoji: "☪️" },
  { id: "PwD", label: "Person with Disability (PwD)", emoji: "♿" },
];

const SECTORS = [
  { id: "Manufacturing", label: "Manufacturing / Production", emoji: "🏭" },
  { id: "Services", label: "Services / Retail", emoji: "🛍️" },
  { id: "Handicrafts", label: "Handicrafts / Artisan Work", emoji: "🎨" },
  { id: "Food processing", label: "Food / Catering / Tiffin", emoji: "🍱" },
  { id: "Agriculture-allied", label: "Farming / Agro-based", emoji: "🌾" },
  { id: "Technology", label: "Technology / Digital", emoji: "💻" },
  { id: "Transport", label: "Transport / Logistics", emoji: "🚛" },
];

const STAGES = [
  { id: "idea", label: "Just an idea — not started yet", emoji: "💡" },
  { id: "early", label: "Early stage — just started (< 2 years)", emoji: "🌱" },
  { id: "existing", label: "Existing business — want to grow", emoji: "📈" },
];

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Puducherry"
];

export default function ProfileWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [profile, setProfile] = useState({
    category: "",
    state: "",
    sector: "",
    business_stage: "",
    age: "",
    annual_income: "",
    funding_need: "",
    business_description: "",
  });

  const set = (key, value) => setProfile((p) => ({ ...p, [key]: value }));

  const canProceed = () => {
    if (currentStep === 0) return !!profile.category;
    if (currentStep === 1) return !!profile.state;
    if (currentStep === 2) return !!profile.sector;
    if (currentStep === 3) return !!profile.business_stage;
    return true;
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported in this browser. Please use Chrome.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      set("business_description", profile.business_description ? `${profile.business_description} ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const profilePayload = {
        category: profile.category,
        state: profile.state,
        sector: profile.sector,
        business_stage: profile.business_stage,
        age: profile.age ? parseInt(profile.age) : null,
        annual_income: profile.annual_income ? parseFloat(profile.annual_income) : null,
        funding_need: profile.funding_need ? parseFloat(profile.funding_need) : null,
        business_description: profile.business_description || "",
      };
      const { profile_id } = await createProfile(profilePayload);
      const matchData = await matchSchemes(profile_id);
      onComplete(matchData, profilePayload);
    } catch (e) {
      setError("Could not connect to the AI engine. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const stepContent = [
    // Step 0: Category
    <div key="cat" className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">What best describes you?</h2>
      <p className="text-gray-500 text-sm mb-4">This helps us find schemes you're specifically eligible for</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => set("category", cat.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
              ${profile.category === cat.id
                ? "border-blue-600 bg-blue-50 text-blue-900 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-300 text-gray-700"
              }`}
          >
            <span className="text-2xl">{cat.emoji}</span>
            <span className="font-medium text-sm">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Location
    <div key="loc" className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Where are you based?</h2>
      <p className="text-gray-500 text-sm mb-4">Some schemes are state-specific or have higher benefits in certain states</p>
      <select
        value={profile.state}
        onChange={(e) => set("state", e.target.value)}
        className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:border-blue-600 focus:outline-none text-base"
      >
        <option value="">Select your state...</option>
        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>,

    // Step 2: Sector
    <div key="sec" className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">What kind of business?</h2>
      <p className="text-gray-500 text-sm mb-4">Pick the closest category for your business</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTORS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => set("sector", sec.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
              ${profile.sector === sec.id
                ? "border-blue-600 bg-blue-50 text-blue-900 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-300 text-gray-700"
              }`}
          >
            <span className="text-2xl">{sec.emoji}</span>
            <span className="font-medium text-sm">{sec.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Business Stage
    <div key="stage" className="space-y-3">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">What stage is your business at?</h2>
      <p className="text-gray-500 text-sm mb-4">This determines which schemes you can access now</p>
      <div className="space-y-3">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => set("business_stage", stage.id)}
            className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all
              ${profile.business_stage === stage.id
                ? "border-blue-600 bg-blue-50 text-blue-900 shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-300 text-gray-700"
              }`}
          >
            <span className="text-3xl">{stage.emoji}</span>
            <span className="font-medium">{stage.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 4: Description (optional)
    <div key="desc" className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Describe your business</h2>
      <p className="text-gray-500 text-sm mb-1">Optional but <span className="text-blue-600 font-semibold">strongly recommended</span> — our AI uses this to find non-obvious matches</p>
      <div className="relative">
        <textarea
          value={profile.business_description}
          onChange={(e) => set("business_description", e.target.value)}
          placeholder='e.g. "I make handwoven silk sarees in Varanasi and want to sell online" or "I run a small catering business serving lunch tiffins to offices"'
          className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:border-blue-600 focus:outline-none resize-none text-base"
          rows={4}
        />
        <button
          onClick={handleVoiceInput}
          className={`absolute bottom-3 right-3 p-2 rounded-lg transition-colors ${
            isListening ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
          title="Speak your description"
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>
      {isListening && (
        <p className="text-red-500 text-sm animate-pulse flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
          Listening... speak now
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Annual income (₹) — optional</label>
          <input
            type="number"
            placeholder="e.g. 200000"
            value={profile.annual_income}
            onChange={(e) => set("annual_income", e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-800 focus:border-blue-400 focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Funding needed (₹) — optional</label>
          <input
            type="number"
            placeholder="e.g. 500000"
            value={profile.funding_need}
            onChange={(e) => set("funding_need", e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg p-3 text-gray-800 focus:border-blue-400 focus:outline-none text-sm"
          />
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= currentStep ? "text-blue-600 font-semibold" : ""}>{s}</span>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {stepContent[currentStep]}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={18} /> Back
        </button>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
          >
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-xl hover:scale-105"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Finding Schemes...</>
            ) : (
              <><Sparkles size={18} /> Find My Schemes</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
