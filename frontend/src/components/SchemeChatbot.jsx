import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, X, Send, Mic, MicOff, Sparkles,
  Bot, User, ExternalLink, ArrowRight, Loader2
} from "lucide-react";
import { sendChatMessage } from "../lib/api";
import VoiceOutput from "./VoiceOutput";

const LANG_LABELS = {
  en: "English", hi: "हिंदी", mr: "मराठी",
  ta: "தமிழ்", te: "తెలుగు", bn: "বাংলা",
  gu: "ગુજરાતી", kn: "ಕನ್ನಡ", ml: "മലയാളം", pa: "ਪੰਜਾਬੀ"
};

export default function SchemeChatbot({ currentLang = "en", currentScheme = null, userProfile = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Namaste! I am **SchemeSaathi**, your AI Government Scheme Guide. How can I help you today? You can ask me how to apply, eligibility, documents, or subsidies.",
      actions: [
        { label: "How to apply for Stand-Up India?", action: "How do I apply for Stand-Up India?" },
        { label: "Mudra Loan Documents", action: "What documents do I need for Mudra loan?" },
        { label: "Women Entrepreneur Subsidies", action: "What schemes are available for women?" }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported. Please use Google Chrome.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = currentLang === "en" ? "en-IN" : `${currentLang}-IN`;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.start();
    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput((p) => (p ? p + " " + t : t));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;
    const newMessages = [...messages, { sender: "user", text: query }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(query, currentLang, currentScheme?.scheme_id || null, userProfile);
      setMessages([...newMessages, {
        sender: "bot",
        text: res.reply,
        actions: res.suggested_actions || [],
        relevantSchemes: res.relevant_schemes || []
      }]);
    } catch {
      setMessages([...newMessages, {
        sender: "bot",
        text: "I am having trouble connecting to the server. Please ensure the backend is running.",
        actions: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside aria-label="SchemeSaathi AI Chatbot" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-blue-100 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-blue-900 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-400 text-blue-900 flex items-center justify-center font-bold shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm">SchemeSaathi AI</h3>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                </div>
                <p className="text-[11px] text-blue-200">
                  Speaking: <span className="font-semibold text-amber-300">{LANG_LABELS[currentLang] || "English"}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#090e17]/80">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                {m.sender === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs mt-1">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white dark:bg-[#0f172a] text-gray-800 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-bl-none"
                }`}>
                  <div className="whitespace-pre-line">
                    {m.text.split("\n").map((line, i) => (
                      <p key={i} className="mb-1 last:mb-0">{line}</p>
                    ))}
                  </div>

                  {/* Listen button on bot messages */}
                  {m.sender === "bot" && (
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 mt-2.5 pt-2">
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">Listen in {LANG_LABELS[currentLang]}</span>
                      <VoiceOutput text={m.text} lang={currentLang} compact={true} />
                    </div>
                  )}

                  {/* Scheme links */}
                  {m.relevantSchemes?.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-slate-700 space-y-1">
                      {m.relevantSchemes.map((rs, rIdx) => (
                        <a
                          key={rIdx}
                          href={rs.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg mr-1.5 transition-colors"
                        >
                          {rs.name} <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Quick action chips */}
                  {m.actions?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => act.url ? window.open(act.url, "_blank") : handleSend(act.action)}
                          className="text-[10px] bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1 font-medium"
                        >
                          {act.label} <ArrowRight size={9} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 flex items-center justify-center shrink-0 text-xs mt-1">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-gray-400 dark:text-slate-500 italic">
                <Loader2 size={14} className="animate-spin text-blue-600" />
                <span>SchemeSaathi is thinking in {LANG_LABELS[currentLang]}...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="p-3 bg-white dark:bg-[#0f172a] border-t border-gray-100 dark:border-slate-700 flex items-center gap-2">
            <button
              onClick={handleVoiceInput}
              title="Speak in your language"
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening… Speak now" : `Ask anything in ${LANG_LABELS[currentLang]}…`}
              className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-2.5 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 hover:scale-105 text-white font-semibold text-xs px-4 py-3 rounded-full shadow-2xl shadow-blue-500/25 transition-all border-2 border-white/30"
      >
        <div className="w-6 h-6 rounded-full bg-amber-400 text-blue-900 flex items-center justify-center font-bold">
          <Sparkles size={13} />
        </div>
        <span>{isOpen ? "Close Assistant" : "Ask SchemeSaathi"}</span>
        <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
          {LANG_LABELS[currentLang] || "EN"}
        </span>
      </button>
    </aside>
  );
}
