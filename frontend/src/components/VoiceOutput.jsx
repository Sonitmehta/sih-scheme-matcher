import { useState, useRef, useEffect } from "react";
import { Volume2, Loader2, Square } from "lucide-react";
import { getTTSAudio } from "../lib/api";

const SPEECH_LANG_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
};

// Global audio object to prevent overlapping voices
let currentGlobalAudio = null;

export default function VoiceOutput({ text, lang = "en", label, compact = false }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const blobUrlCache = useRef({});

  // Stop playback whenever text or lang changes
  useEffect(() => {
    handleStop();
  }, [text, lang]);

  const handleStop = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
      audioRef.current = null;
    }
    if (currentGlobalAudio) {
      try {
        currentGlobalAudio.pause();
        currentGlobalAudio.currentTime = 0;
      } catch (e) {}
      currentGlobalAudio = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    setLoading(false);
  };

  // 1. PRIMARY ENGINE: High-Fidelity Google Native Voice (Authentic Regional Accents)
  const speakWithBackend = async (speechText) => {
    const cacheKey = `${speechText}_${lang}`;
    let url = blobUrlCache.current[cacheKey];
    if (!url) {
      url = await getTTSAudio(speechText, lang);
      blobUrlCache.current[cacheKey] = url;
    }
    return new Promise((resolve, reject) => {
      // Stop any other currently playing audio
      if (currentGlobalAudio) {
        try { currentGlobalAudio.pause(); } catch (e) {}
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      currentGlobalAudio = audio;

      audio.onplay = () => {
        setLoading(false);
        setPlaying(true);
      };
      audio.onended = () => {
        setPlaying(false);
        audioRef.current = null;
        currentGlobalAudio = null;
        resolve();
      };
      audio.onerror = (e) => {
        setPlaying(false);
        currentGlobalAudio = null;
        reject(e);
      };
      audio.play().catch(reject);
    });
  };

  // 2. FALLBACK ENGINE: Browser Web Speech API
  const speakWithBrowser = (speechText) => {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("No Web Speech API"));
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = SPEECH_LANG_MAP[lang] || "en-IN";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Check if browser has a native voice for this language
      const voices = window.speechSynthesis.getVoices() || [];
      const prefix = (SPEECH_LANG_MAP[lang] || "en").split("-")[0].toLowerCase();
      const matchedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        setLoading(false);
        setPlaying(true);
      };
      utterance.onend = () => {
        setPlaying(false);
        resolve();
      };
      utterance.onerror = (e) => {
        setPlaying(false);
        reject(e);
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const handlePlay = async () => {
    if (playing) {
      handleStop();
      return;
    }
    if (!text?.trim()) return;

    handleStop();
    setLoading(true);
    const cleanText = text.replace(/[*#_`[\]()~]/g, " ").replace(/\s+/g, " ").trim().slice(0, 450);

    try {
      // Primary: High-fidelity authentic Google regional accent
      await speakWithBackend(cleanText);
    } catch (err) {
      console.warn("[VoiceOutput] Backend voice failed, attempting browser speech fallback:", err);
      try {
        await speakWithBrowser(cleanText);
      } catch (browserErr) {
        console.error("[VoiceOutput] Both voice engines failed:", browserErr);
        setLoading(false);
        setPlaying(false);
      }
    }
  };

  if (compact) {
    return (
      <button
        onClick={handlePlay}
        disabled={loading}
        title={playing ? "Stop voice" : `Listen in ${lang.toUpperCase()}`}
        className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
          playing
            ? "bg-green-100 text-green-800 animate-pulse border border-green-300"
            : "text-gray-400 hover:text-green-700 hover:bg-green-50 border border-transparent"
        }`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin text-green-600" />
        ) : playing ? (
          <Square size={13} className="fill-current text-green-800" />
        ) : (
          <Volume2 size={14} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handlePlay}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
        playing
          ? "bg-green-700 text-white border-green-800 shadow-sm animate-pulse"
          : "text-green-700 hover:text-green-900 border-green-200 hover:border-green-400 bg-green-50 hover:bg-green-100"
      } disabled:opacity-50`}
      title={`Listen in ${lang.toUpperCase()}`}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin text-green-700" />
      ) : playing ? (
        <Square size={12} className="fill-current" />
      ) : (
        <Volume2 size={13} />
      )}
      <span>{loading ? "Loading Voice..." : playing ? "Stop" : label || "▶ Listen"}</span>
    </button>
  );
}
