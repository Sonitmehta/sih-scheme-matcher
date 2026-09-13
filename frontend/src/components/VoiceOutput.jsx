import { useState, useRef, useEffect } from "react";
import { Volume2, Loader2, Square, VolumeX } from "lucide-react";
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

export default function VoiceOutput({ text, lang = "en", label, compact = false }) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const cacheRef = useRef({});

  // Stop playback if text or lang changes
  useEffect(() => {
    handleStop();
  }, [text, lang]);

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    setLoading(false);
  };

  const handlePlay = async () => {
    if (playing) {
      handleStop();
      return;
    }

    if (!text || !text.trim()) return;

    setLoading(true);
    const cleanText = text.replace(/[*#_`]/g, "").trim().slice(0, 500);

    // 1. Try backend gTTS audio stream
    try {
      const cacheKey = `${cleanText}_${lang}`;
      let url = cacheRef.current[cacheKey];

      if (!url) {
        url = await getTTSAudio(cleanText, lang);
        cacheRef.current[cacheKey] = url;
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => {
        setLoading(false);
        setPlaying(true);
      };

      audio.onended = () => {
        setPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        fallbackToBrowserSpeech(cleanText);
      };

      await audio.play();
    } catch (err) {
      console.warn("[VoiceOutput] Backend TTS failed, using browser speech synthesis fallback:", err);
      fallbackToBrowserSpeech(cleanText);
    }
  };

  const fallbackToBrowserSpeech = (speechText) => {
    if (!("speechSynthesis" in window)) {
      setLoading(false);
      setPlaying(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = SPEECH_LANG_MAP[lang] || "en-IN";
      utterance.rate = 0.95;

      utterance.onstart = () => {
        setLoading(false);
        setPlaying(true);
      };

      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => {
        setLoading(false);
        setPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setLoading(false);
      setPlaying(false);
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
      <span>{loading ? "Synthesizing..." : playing ? "Stop" : label || "▶ Listen"}</span>
    </button>
  );
}
