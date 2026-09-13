"""
High-Performance Text-to-Speech (TTS) Router
Generates and caches audio streams across 10 Indian Regional Languages using gTTS.
"""

import io
import os
import hashlib
from fastapi import APIRouter, HTTPException, Query
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

AUDIO_CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "audio_cache")
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)


class TTSRequest(BaseModel):
    text: str
    lang: str = "en"


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech in requested regional language and return MP3 audio stream."""
    text = request.text.strip() if request.text else ""
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    lang_code = LANG_MAP.get(request.lang.lower().strip(), "en")
    
    # Generate cache key
    cache_hash = hashlib.md5(f"{text}_{lang_code}".encode("utf-8")).hexdigest()
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

    # Otherwise synthesize audio via gTTS and cache
    try:
        tts = gTTS(text=text[:500], lang=lang_code, slow=False)
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_bytes = audio_buffer.getvalue()

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
        print(f"[TTS Error] {e}")
        # Fallback to English TTS if specific regional voice fails
        if lang_code != "en":
            try:
                tts = gTTS(text=text[:500], lang="en", slow=False)
                fallback_buf = io.BytesIO()
                tts.write_to_fp(fallback_buf)
                fallback_buf.seek(0)
                return StreamingResponse(fallback_buf, media_type="audio/mpeg")
            except Exception:
                pass

        raise HTTPException(status_code=500, detail=f"TTS generation error: {str(e)}")
