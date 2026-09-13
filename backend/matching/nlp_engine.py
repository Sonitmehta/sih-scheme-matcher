"""
NLP Matching Engine — Semantic similarity
Dual-engine architecture for guaranteed hackathon reliability:
1. Primary: Sentence-BERT (all-MiniLM-L6-v2) via sentence-transformers
2. Fallback: TF-IDF (1-2 ngrams) + Cosine Similarity via Scikit-Learn
Ensures zero demo crashes even if offline or behind SSL inspection proxies.
"""

import os
import pickle
import ssl
import numpy as np
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Patch httpx and urllib3 to smoothly handle Windows certificate inspection
import httpx
import urllib3
urllib3.disable_warnings()

_old_client_init = httpx.Client.__init__
def _new_client_init(self, *args, **kwargs):
    kwargs['verify'] = False
    _old_client_init(self, *args, **kwargs)
httpx.Client.__init__ = _new_client_init

_old_async_init = httpx.AsyncClient.__init__
def _new_async_init(self, *args, **kwargs):
    kwargs['verify'] = False
    _old_async_init(self, *args, **kwargs)
httpx.AsyncClient.__init__ = _new_async_init

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["CURL_CA_BUNDLE"] = ""
os.environ["REQUESTS_CA_BUNDLE"] = ""
os.environ["PYTHONHTTPSVERIFY"] = "0"

MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDINGS_CACHE_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "scheme_embeddings.pkl")

_model = None
_model_failed = False
_scheme_embeddings: Optional[Dict] = None
_tfidf_vectorizer: Optional[TfidfVectorizer] = None
_tfidf_matrix = None
_tfidf_scheme_ids: List[str] = []


def build_scheme_text(scheme: Dict) -> str:
    """
    Builds a rich text representation of a scheme for embedding.
    Combines name, benefit description, raw eligibility, sector, and tags.
    """
    parts = [
        scheme.get("name", ""),
        scheme.get("benefit_description", ""),
        scheme.get("eligibility_text_raw", ""),
        " ".join(scheme.get("tags", [])),
        " ".join(scheme.get("sector", [])),
    ]
    return " ".join(filter(None, parts))


def get_sentence_transformer():
    global _model, _model_failed
    if _model_failed:
        return None
    if _model is not None:
        return _model

    try:
        # Avoid hanging on connection issues
        import urllib.request
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE

        from sentence_transformers import SentenceTransformer
        print(f"[NLP] Attempting to load SentenceTransformer: {MODEL_NAME}")
        _model = SentenceTransformer(MODEL_NAME)
        print("[NLP] SentenceTransformer loaded successfully [OK]")
        return _model
    except Exception as e:
        print(f"[NLP Warning] SentenceTransformer unavailable ({e}). Using Scikit-Learn TF-IDF semantic engine.")
        _model_failed = True
        return None


def init_tfidf_engine(schemes: List[Dict]):
    """Initialize TF-IDF vectorizer over all schemes as a reliable local fallback."""
    global _tfidf_vectorizer, _tfidf_matrix, _tfidf_scheme_ids
    if _tfidf_vectorizer is not None:
        return

    _tfidf_scheme_ids = [s["scheme_id"] for s in schemes]
    corpus = [build_scheme_text(s) for s in schemes]

    _tfidf_vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        stop_words="english",
        max_features=5000,
        sublinear_tf=True
    )
    _tfidf_matrix = _tfidf_vectorizer.fit_transform(corpus)
    print(f"[NLP] TF-IDF semantic engine initialized for {len(schemes)} schemes [OK]")


def load_or_build_embeddings(schemes: List[Dict]) -> Optional[Dict]:
    """Loads pre-computed embeddings from disk if available, or attempts to build them."""
    global _scheme_embeddings
    if _scheme_embeddings is not None:
        return _scheme_embeddings

    init_tfidf_engine(schemes)

    if os.path.exists(EMBEDDINGS_CACHE_PATH):
        try:
            with open(EMBEDDINGS_CACHE_PATH, "rb") as f:
                _scheme_embeddings = pickle.load(f)
            print(f"[NLP] Loaded {len(_scheme_embeddings)} cached embeddings from disk [OK]")
            return _scheme_embeddings
        except Exception:
            pass

    st_model = get_sentence_transformer()
    if st_model is not None:
        try:
            embeddings = {}
            for scheme in schemes:
                scheme_id = scheme["scheme_id"]
                text = build_scheme_text(scheme)
                embedding = st_model.encode(text, convert_to_numpy=True)
                embeddings[scheme_id] = embedding
            
            os.makedirs(os.path.dirname(EMBEDDINGS_CACHE_PATH), exist_ok=True)
            with open(EMBEDDINGS_CACHE_PATH, "wb") as f:
                pickle.dump(embeddings, f)
            print(f"[NLP] Built and cached {len(embeddings)} sentence embeddings [OK]")
            _scheme_embeddings = embeddings
            return _scheme_embeddings
        except Exception as e:
            print(f"[NLP] Failed building sentence embeddings: {e}")

    return None


def semantic_match(
    user_description: str,
    schemes: List[Dict],
    top_k: int = 25
) -> List[Dict]:
    """
    Computes semantic similarity between user description and candidate schemes.
    Uses Sentence-BERT if available, otherwise TF-IDF.
    """
    if not user_description or not user_description.strip():
        return [
            {"scheme_id": s["scheme_id"], "semantic_score": 0.5, "matched_concepts": []}
            for s in schemes
        ]

    st_model = get_sentence_transformer()
    embeddings = load_or_build_embeddings(schemes)

    results = []

    if st_model is not None and embeddings:
        try:
            user_embedding = st_model.encode(user_description, convert_to_numpy=True).reshape(1, -1)
            for scheme in schemes:
                scheme_id = scheme["scheme_id"]
                if scheme_id in embeddings:
                    scheme_emb = embeddings[scheme_id].reshape(1, -1)
                    sim = float(cosine_similarity(user_embedding, scheme_emb)[0][0])
                    results.append({
                        "scheme_id": scheme_id,
                        "semantic_score": round(max(0.0, sim), 4),
                        "matched_concepts": _extract_matched_concepts(user_description, scheme.get("tags", []))
                    })
        except Exception as e:
            print(f"[NLP] ST match failed ({e}), falling back to TF-IDF")
            results = []

    # Fallback to TF-IDF semantic engine
    if not results:
        init_tfidf_engine(schemes)
        user_vec = _tfidf_vectorizer.transform([user_description])
        sims = cosine_similarity(user_vec, _tfidf_matrix)[0]

        id_to_sim = dict(zip(_tfidf_scheme_ids, sims))
        for scheme in schemes:
            scheme_id = scheme["scheme_id"]
            sim_score = float(id_to_sim.get(scheme_id, 0.2))
            # Normalise TF-IDF score slightly for parity
            normalized_score = min(round(sim_score * 1.5, 4), 1.0)
            results.append({
                "scheme_id": scheme_id,
                "semantic_score": max(0.1, normalized_score),
                "matched_concepts": _extract_matched_concepts(user_description, scheme.get("tags", []))
            })

    results.sort(key=lambda x: x["semantic_score"], reverse=True)
    return results[:top_k]


def _extract_matched_concepts(user_desc: str, tags: List[str]) -> List[str]:
    user_lower = user_desc.lower()
    matched = []
    for tag in tags:
        if len(tag) > 3 and tag.lower() in user_lower:
            matched.append(tag)
    return matched[:4]


def combine_scores(rule_score: float, semantic_score: float) -> Dict:
    normalized_rule = min(rule_score / 1.5, 1.0)
    combined = (normalized_rule * 0.6) + (semantic_score * 0.4)
    combined = round(combined, 4)

    if combined >= 0.60:
        label = "Strong Match"
        label_color = "green"
    elif combined >= 0.42:
        label = "Good Match"
        label_color = "blue"
    elif combined >= 0.25:
        label = "Possible Match"
        label_color = "yellow"
    else:
        label = "Low Relevance"
        label_color = "gray"

    return {
        "combined_score": combined,
        "match_label": label,
        "match_color": label_color,
        "rule_score": round(rule_score, 3),
        "semantic_score": round(semantic_score, 4),
        "score_breakdown": {
            "rule_weight": "60%",
            "semantic_weight": "40%",
            "rule_contribution": round(normalized_rule * 0.6, 3),
            "semantic_contribution": round(semantic_score * 0.4, 3)
        }
    }
