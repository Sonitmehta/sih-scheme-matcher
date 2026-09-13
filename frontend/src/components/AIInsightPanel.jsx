import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Tag, AlertCircle } from "lucide-react";

export default function AIInsightPanel({ match }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 300); }, []);

  const ruleContrib = match.score_breakdown?.rule_contribution ?? 0;
  const semContrib = match.score_breakdown?.semantic_contribution ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 8 }}
      className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain size={16} className="text-indigo-600" />
        <span className="text-indigo-700 font-semibold text-sm">AI Match Insight</span>
      </div>

      {/* Score breakdown */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>📋 Rule match (category, state, sector)</span>
            <span className="font-bold text-indigo-700">{Math.round(ruleContrib * 100 / 0.6)}%</span>
          </div>
          <div className="score-bar">
            <div
              className="score-fill bg-indigo-500"
              style={{ width: `${Math.min(ruleContrib / 0.6 * 100, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>🧠 Semantic match (AI text similarity)</span>
            <span className="font-bold text-purple-700">{Math.round(semContrib * 100 / 0.4)}%</span>
          </div>
          <div className="score-bar">
            <div
              className="score-fill bg-purple-500"
              style={{ width: `${Math.min(semContrib / 0.4 * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Explanation */}
      {match.ai_explanation && (
        <p className="text-xs text-indigo-800 bg-white rounded-lg px-3 py-2 border border-indigo-100">
          <AlertCircle size={11} className="inline mr-1 text-indigo-500" />
          {match.ai_explanation}
        </p>
      )}

      {/* Matched concepts */}
      {match.matched_concepts?.length > 0 && (
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Tag size={12} className="text-gray-400" />
          {match.matched_concepts.map((c) => (
            <span key={c} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
              {c}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
