import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileWizard from "../components/ProfileWizard";
import ResultsPage from "../components/ResultsPage";

export default function MatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            ← SchemeAI
          </button>
          {step === "results" && (
            <button
              onClick={() => { setStep("wizard"); setMatchData(null); setProfileData(null); }}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              ↺ Try Another Profile
            </button>
          )}
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
            <ProfileWizard onComplete={handleMatchComplete} />
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
