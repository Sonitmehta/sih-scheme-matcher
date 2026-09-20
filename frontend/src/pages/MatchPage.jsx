import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import ProfileWizard from "../components/ProfileWizard";
import ResultsPage from "../components/ResultsPage";
import { useTheme } from "../context/ThemeContext";

export default function MatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();
  const presetProfile = location.state?.presetProfile || null;

  const [step, setStep] = useState(presetProfile ? "results" : "wizard");
  const [matchData, setMatchData] = useState(null);
  const [profileData, setProfileData] = useState(presetProfile);

  const handleMatchComplete = (data, profile) => {
    setMatchData(data);
    setProfileData(profile);
    setStep("results");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#090e17] transition-colors duration-200">
      {/* Top bar */}
      <header className="bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
          >
            ← SchemeAI
          </button>

          <div className="flex items-center gap-3">
            {step === "results" && (
              <button
                onClick={() => { setStep("wizard"); setMatchData(null); setProfileData(null); }}
                className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 border border-gray-300 dark:border-slate-700 px-4 py-2 rounded-lg transition-colors"
              >
                ↺ Try Another Profile
              </button>
            )}
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              title={dark ? "Light mode" : "Dark mode"}
              className="p-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === "wizard" && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileWizard
              onComplete={handleMatchComplete}
              onBack={() => navigate("/")}
            />
          </motion.div>
        )}
        {step === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ResultsPage
              matchData={matchData}
              profileData={profileData}
              onRetry={() => { setStep("wizard"); setMatchData(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
