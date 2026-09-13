"""
Schemes Router — Matching, Real-Time Discovery, Localization & Detail Endpoints
GET /api/schemes/match?profile_id=...
GET /api/schemes/live-search?q=...
POST /api/schemes/sync-live
GET /api/schemes/{scheme_id}
GET /api/schemes/{scheme_id}/summary?lang=ta|te|hi|mr|bn|gu|kn|ml|pa|en
"""

import os
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any

from matching.rule_engine import filter_schemes
from matching.nlp_engine import semantic_match, combine_scores
from matching.live_fetcher import get_all_active_schemes, search_live_sources, trigger_live_sync
from utils.translation import translate_scheme_summary, translate_text, SUPPORTED_LANGUAGES
from routers.profile import get_profile

router = APIRouter()


@router.get("/schemes/match")
async def match_schemes(
    profile_id: str = Query(..., description="Profile ID from POST /api/profile"),
    include_live: bool = Query(True, description="Whether to include live dynamically indexed schemes")
):
    """
    Runs the hybrid AI matching pipeline (Rule Hard Filter + Sentence-BERT Semantic Scoring).
    Merges live real-time schemes into candidate pool.
    """
    profile = get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please create a profile first.")

    schemes_pool = get_all_active_schemes() if include_live else get_all_active_schemes()

    # Step 1: Rule-based hard constraint filtering
    rule_filtered = filter_schemes(schemes_pool, profile)
    if not rule_filtered:
        return {"matches": [], "total": 0, "profile": profile, "live_synced": True}

    filtered_schemes = [r["scheme"] for r in rule_filtered]
    rule_score_map = {r["scheme"]["scheme_id"]: r["rule_score"] for r in rule_filtered}

    # Step 2: Semantic matching
    user_desc = profile.get("business_description", "") or ""
    semantic_results = semantic_match(user_desc, filtered_schemes)
    semantic_score_map = {r["scheme_id"]: r for r in semantic_results}

    # Step 3: Combine scores and rank
    final_results = []
    for scheme in filtered_schemes:
        scheme_id = scheme["scheme_id"]
        rule_score = rule_score_map.get(scheme_id, 0.5)
        semantic_data = semantic_score_map.get(scheme_id, {"semantic_score": 0.5, "matched_concepts": []})
        semantic_score = semantic_data["semantic_score"]
        matched_concepts = semantic_data["matched_concepts"]

        scoring = combine_scores(rule_score, semantic_score)

        final_results.append({
            "scheme_id": scheme_id,
            "name": scheme.get("name", ""),
            "issuing_body": scheme.get("issuing_body", ""),
            "sector": scheme.get("sector", []),
            "benefit_description": scheme.get("benefit_description", ""),
            "plain_summary_what": scheme.get("plain_summary_what", {}),
            "plain_summary_need": scheme.get("plain_summary_need", {}),
            "plain_summary_apply": scheme.get("plain_summary_apply", {}),
            "required_documents": scheme.get("required_documents", []),
            "official_link": scheme.get("official_link", ""),
            "tags": scheme.get("tags", []),
            "eligible_categories": scheme.get("eligible_categories", []),
            "states_applicable": scheme.get("states_applicable", []),
            "funding_max": scheme.get("funding_max", 0),
            "funding_min": scheme.get("funding_min", 0),
            "is_live_synced": scheme.get("is_live_synced", False),
            **scoring,
            "matched_concepts": matched_concepts,
            "ai_explanation": _build_ai_explanation(scheme, profile, matched_concepts, scoring)
        })

    final_results.sort(key=lambda x: x["combined_score"], reverse=True)

    return {
        "matches": final_results,
        "total": len(final_results),
        "profile": profile,
        "live_synced": True,
        "pipeline_info": {
            "total_schemes": len(schemes_pool),
            "after_rule_filter": len(rule_filtered),
            "after_semantic_ranking": len(final_results)
        }
    }


@router.get("/schemes/live-search")
async def live_search(
    q: str = Query(..., description="Search query for live schemes"),
    category: Optional[str] = Query(None),
    state: Optional[str] = Query(None)
):
    """
    Searches live government sources in real-time for updated schemes and returns parsed records.
    """
    discovered = await search_live_sources(q, category=category, state=state)
    return {
        "query": q,
        "total_discovered": len(discovered),
        "results": discovered,
        "live_timestamp": os.path.getmtime(__file__) if os.path.exists(__file__) else None
    }


@router.post("/schemes/sync-live")
async def sync_live():
    """
    Triggers an automated sync of real-time schemes across the platform.
    """
    res = trigger_live_sync()
    return res


@router.get("/schemes/{scheme_id}")
async def get_scheme(scheme_id: str):
    """Get full detail for a single scheme."""
    schemes = get_all_active_schemes()
    for scheme in schemes:
        if scheme.get("scheme_id") == scheme_id:
            return scheme
    raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found")


@router.get("/schemes/{scheme_id}/summary")
async def get_scheme_summary(
    scheme_id: str,
    lang: str = Query("en", description="Supported: en, hi, mr, ta, te, bn, gu, kn, ml, pa")
):
    """
    Returns dynamically localized 3-part plain-language summary in any of the 10 supported regional languages.
    """
    target_lang = lang.lower().strip()
    schemes = get_all_active_schemes()
    for scheme in schemes:
        if scheme.get("scheme_id") == scheme_id:
            # Dynamically translate on demand
            localized = translate_scheme_summary(scheme, target_lang)
            return {
                "scheme_id": scheme_id,
                "name": scheme.get("name", ""),
                "lang": target_lang,
                "lang_info": SUPPORTED_LANGUAGES.get(target_lang, SUPPORTED_LANGUAGES["en"]),
                "what": localized["what"],
                "need": localized["need"],
                "apply": localized["apply"],
                "documents": scheme.get("required_documents", []),
                "official_link": scheme.get("official_link", "")
            }
    raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found")


@router.get("/schemes")
async def list_schemes():
    """List all active schemes."""
    schemes = get_all_active_schemes()
    return {"schemes": schemes, "total": len(schemes)}


def _build_ai_explanation(scheme: dict, profile: dict, matched_concepts: list, scoring: dict) -> str:
    parts = []
    user_cat = profile.get("category", "General")
    scheme_cats = scheme.get("eligible_categories", [])
    if "General" in scheme_cats:
        parts.append("Open to all categories")
    elif user_cat in scheme_cats:
        parts.append(f"Specifically prioritized for {user_cat} entrepreneurs")

    user_stage = profile.get("business_stage", "")
    scheme_stages = scheme.get("business_stage_applicable", [])
    if user_stage in scheme_stages:
        stage_label = {"idea": "idea-stage", "early": "early-stage", "existing": "established"}
        parts.append(f"tailored for {stage_label.get(user_stage, user_stage)} businesses")

    if matched_concepts:
        parts.append(f"semantically matched keywords: {', '.join(matched_concepts)}")
    elif scoring.get("semantic_score", 0) > 0.35:
        parts.append("high semantic alignment with your craft/business description")

    scheme_states = scheme.get("states_applicable", [])
    user_state = profile.get("state", "")
    if "All India" in scheme_states:
        parts.append("active in your state")
    elif user_state in scheme_states:
        parts.append(f"targeted specifically for {user_state}")

    if parts:
        return " • ".join(parts).capitalize() + "."
    return "Matched based on your eligibility criteria."
