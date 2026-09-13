"""
High-Performance Multilingual Translation Engine
Supports 10 Indian Regional Languages with Multi-Tier Redundant Fallback:
1. Memory + Disk Cache (0ms)
2. Google Translate Web API (GTX)
3. deep-translator GoogleTranslator
Ensures zero rate-limit blocks and maximum translation speed.
"""

import os
import json
import hashlib
import urllib.parse
import urllib.request
from typing import Dict, Optional

# Supported language codes and native display
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "flag": "🇬🇧"},
    "hi": {"name": "Hindi", "native": "हिंदी", "flag": "🟧"},
    "mr": {"name": "Marathi", "native": "मराठी", "flag": "🔵"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "flag": "🟨"},
    "te": {"name": "Telugu", "native": "తెలుగు", "flag": "🟣"},
    "bn": {"name": "Bengali", "native": "বাংলা", "flag": "🟩"},
    "gu": {"name": "Gujarati", "native": "ગુજરાતી", "flag": "🟥"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "flag": "🟦"},
    "ml": {"name": "Malayalam", "native": "മലയാളം", "flag": "🟫"},
    "pa": {"name": "Punjabi", "native": "ਪੰਜਾਬੀ", "flag": "🟨"},
}

CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "translation_cache.json")
_memory_cache: Dict[str, str] = {}


def _load_disk_cache():
    global _memory_cache
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                _memory_cache.update(json.load(f))
        except Exception:
            pass

_load_disk_cache()


def _save_disk_cache():
    try:
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_memory_cache, f, ensure_ascii=False, indent=1)
    except Exception:
        pass


def _translate_gtx(text: str, target_lang: str) -> Optional[str]:
    """Fast Google Web Translation fallback without strict SDK rate limit."""
    try:
        import ssl
        ssl_ctx = ssl._create_unverified_context()
        encoded = urllib.parse.quote(text)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang}&dt=t&q={encoded}"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=3.5) as res:
            raw = json.loads(res.read().decode("utf-8"))
            if raw and isinstance(raw, list) and raw[0]:
                translated_parts = [part[0] for part in raw[0] if part and len(part) > 0 and part[0]]
                return "".join(translated_parts)
    except Exception as e:
        return None
    return None


def translate_text(text: str, target_lang: str = "en", source_lang: str = "auto") -> str:
    """
    Translates text to target_lang using 3-tier fallback with persistent caching.
    """
    if not text or not text.strip():
        return text

    target_lang = target_lang.lower().strip()
    if target_lang not in SUPPORTED_LANGUAGES:
        target_lang = "en"

    if target_lang == "en" and source_lang == "en":
        return text

    # Check cache first
    cache_key = hashlib.md5(f"{text}_{target_lang}".encode("utf-8")).hexdigest()
    if cache_key in _memory_cache:
        return _memory_cache[cache_key]

    # 1. Try fast GTX endpoint
    gtx_result = _translate_gtx(text, target_lang)
    if gtx_result:
        _memory_cache[cache_key] = gtx_result
        if len(_memory_cache) % 10 == 0:
            _save_disk_cache()
        return gtx_result

    # 2. Try deep_translator GoogleTranslator
    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated = translator.translate(text)
        if translated:
            _memory_cache[cache_key] = translated
            if len(_memory_cache) % 10 == 0:
                _save_disk_cache()
            return translated
    except Exception as e:
        print(f"[Translation Warning] Translation to {target_lang} failed: {e}")

    return text


def translate_scheme_summary(scheme: Dict, target_lang: str) -> Dict[str, str]:
    """
    Returns localized 3-part plain-language summary for any of the 10 languages.
    """
    target_lang = target_lang.lower().strip()
    if target_lang not in SUPPORTED_LANGUAGES:
        target_lang = "en"

    def get_part(field: str) -> str:
        data = scheme.get(field, {})
        if isinstance(data, dict):
            if target_lang in data and data[target_lang]:
                return data[target_lang]
            base_en = data.get("en", "")
            if base_en:
                trans = translate_text(base_en, target_lang=target_lang)
                data[target_lang] = trans
                return trans
        elif isinstance(data, str):
            return translate_text(data, target_lang=target_lang)
        return ""

    return {
        "what": get_part("plain_summary_what"),
        "need": get_part("plain_summary_need"),
        "apply": get_part("plain_summary_apply"),
    }
