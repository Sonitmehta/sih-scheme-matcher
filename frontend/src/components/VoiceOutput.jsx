import { useState, useRef, useEffect } from "react";
import { Volume2, Loader2, Square } from "lucide-react";
import { getTTSAudio } from "../lib/api";

// BCP-47 locale codes for Web Speech API — best match for Indian voices
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

// Check once whether Web Speech API is available & pick the best voice per lang
const voiceCache = {};
function getBestVoice(langCode) {
  if (voiceCache[langCode] !== undefined) return voiceCache[langCode];
  const target = SPEECH_LANG_MAP[langCode] || "en-IN";
  const voices = window.speechSynthesis?.getVoices?.() || [];
  // Exact locale match first, then language prefix match
  const exact = voices.find((v) => v.lang === target);
  const prefix = voices.find((v) => v.lang.startsWith(target.split("-")[0]));
  voiceCache[langCode] = exact || prefix || null;
  return voiceCache[langCode];
}

// Pre-load voices (Chrome loads them async on first call)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => {
    Object.keys(voiceCache).forEach((k) => delete voiceCache[k]);
  });
}

export default function VoiceOutput({ text, lang = "en", label, compact = false }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const blobUrlCache = useRef({}); // cache blob URLs from backend (fallback only)

  // Stop playback whenever text or lang changes
  useEffect(() => {
    handleStop();
  }, [text, lang]);

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
    setLoading(false);
  };

  // PRIMARY: instant browser Web Speech synthesis
  const speakWithBrowser = (speechText) => {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("No Web Speech API"));
        return;
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = SPEECH_LANG_MAP[lang] || "en-IN";
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voice = getBestVoice(lang);
      if (voice) utterance.voice = voice;

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

      // Chrome bug: speech sometimes silently stops after ~15s on long text
      // Workaround: resume if paused
      const keepAlive = setInterval(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        if (!window.speechSynthesis.speaking) clearInterval(keepAlive);
      }, 5000);
      utterance.onend = () => { clearInterval(keepAlive); setPlaying(false); resolve(); };
    });
  };

  // FALLBACK: backend gTTS (only when browser speech is unavailable/fails)
  const speakWithBackend = async (speechText) => {
    const cacheKey = `${speechText}_${lang}`;
    let url = blobUrlCache.current[cacheKey];
    if (!url) {
      url = await getTTSAudio(speechText, lang);
      blobUrlCache.current[cacheKey] = url;
    }
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => { setLoading(false); setPlaying(true); };
      audio.onended = () => { setPlaying(false); audioRef.current = null; resolve(); };
      audio.onerror = (e) => { setPlaying(false); reject(e); };
      audio.play().catch(reject);
    });
  };

  const handlePlay = async () => {
    if (playing) { handleStop(); return; }
    if (!text?.trim()) return;

    setLoading(true);
    const cleanText = text.replace(/[*#_`[\]]/g, "").trim().slice(0, 500);

    try {
      // Try instant browser TTS first
      await speakWithBrowser(cleanText);
    } catch (err) {
      console.warn("[VoiceOutput] Browser TTS unavailable, using backend gTTS:", err?.message);
      try {
        await speakWithBackend(cleanText);
      } catch (backendErr) {
        console.error("[VoiceOutput] Both TTS methods failed:", backendErr);
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
            ? "bg-amber-100 text-amber-800 animate-pulse border border-amber-300"
            : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent"
        }`}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin text-indigo-600" />
        ) : playing ? (
          <Square size={13} className="fill-current text-amber-700" />
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
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
        playing
          ? "bg-amber-500 text-white border-amber-600 shadow-sm"
          : "text-indigo-700 hover:text-indigo-900 border-indigo-200 hover:border-indigo-400 bg-indigo-50/80 hover:bg-indigo-100"
      } disabled:opacity-50`}
      title={`Listen in ${lang.toUpperCase()}`}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : playing ? (
        <Square size={12} className="fill-current" />
      ) : (
        <Volume2 size={13} />
      )}
      <span>{loading ? "Loading..." : playing ? "Stop" : label || "▶ Listen"}</span>
    </button>
  );
}
