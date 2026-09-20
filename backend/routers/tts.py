"""
High-Performance Text-to-Speech (TTS) Router
Generates and caches audio streams across 10 Indian Regional Languages using gTTS with authentic regional accents.
"""

import io
import os
import re
import hashlib
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from gtts import gTTS

router = APIRouter()

# Supported TTS language mapping
LANG_MAP = {
    "en": "en",
    "hi": "hi",
    "mr": "mr",
    "ta": "ta",
    "te": "te",
    "bn": "bn",
    "gu": "gu",
    "kn": "kn",
    "ml": "ml",
    "pa": "pa",
}

AUDIO_CACHE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "audio_cache"))
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)


class TTSRequest(BaseModel):
    text: str
    lang: str = "en"


def _clean_tts_text(text: str) -> str:
    """Removes markdown, URLs, special symbols for clean, natural speech."""
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    # Remove markdown bold/italic/code
    text = re.sub(r'[*#_`~\[\]()]', ' ', text)
    # Normalize spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:450]


def _synthesize_audio(clean_text: str, lang_code: str) -> bytes:
    """Synchronous worker that calls gTTS with natural accents."""
    # For English, use Indian English accent (co.in)
    if lang_code == "en":
        tts = gTTS(text=clean_text, lang="en", tld="co.in", slow=False)
    else:
        tts = gTTS(text=clean_text, lang=lang_code, slow=False)
        
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    return buf.getvalue()


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech in requested regional language and return MP3 audio stream."""
    raw_text = request.text.strip() if request.text else ""
    if not raw_text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    clean_text = _clean_tts_text(raw_text)
    if not clean_text:
        clean_text = raw_text[:200]

    lang_code = LANG_MAP.get(request.lang.lower().strip(), "en")
    
    # Generate cache key
    cache_hash = hashlib.md5(f"{clean_text}_{lang_code}".encode("utf-8")).hexdigest()
    cache_file = os.path.join(AUDIO_CACHE_DIR, f"{cache_hash}.mp3")

    # If cached on disk, stream directly from cache (0ms latency!)
    if os.path.exists(cache_file):
        def iter_cached_file():
            with open(cache_file, "rb") as f:
                yield from f

        return StreamingResponse(
            iter_cached_file(),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename=speech_{lang_code}.mp3",
                "Cache-Control": "public, max-age=86400"
            }
        )

    # Synthesize audio asynchronously via gTTS in worker threadpool
    try:
        audio_bytes = await asyncio.to_thread(_synthesize_audio, clean_text, lang_code)

        # Save to disk cache
        try:
            with open(cache_file, "wb") as f:
                f.write(audio_bytes)
        except Exception:
            pass

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename=speech_{lang_code}.mp3",
                "Cache-Control": "public, max-age=86400"
            }
        )
    except Exception as e:
        print(f"[TTS Error for {lang_code}] {e}")
        # Fallback to English TTS if regional voice fails
        if lang_code != "en":
            try:
                fallback_bytes = await asyncio.to_thread(_synthesize_audio, clean_text, "en")
                return StreamingResponse(
                    io.BytesIO(fallback_bytes),
                    media_type="audio/mpeg",
                    headers={"Content-Disposition": "inline; filename=speech_en.mp3"}
                )
            except Exception:
                pass

        raise HTTPException(status_code=500, detail=f"TTS generation error: {str(e)}")
