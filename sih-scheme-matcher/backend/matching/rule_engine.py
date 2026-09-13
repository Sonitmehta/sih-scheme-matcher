"""
Rule Engine — Hard constraint filtering
Filters scheme pool based on exact criteria from the user profile.
"""

from typing import List, Dict, Any


def calculate_rule_score(scheme: Dict, profile: Dict) -> float:
    """
    Returns a score 0.0–1.0 based on how well the user profile
    matches the scheme's hard eligibility constraints.
    
    0.0 = hard disqualified
    0.5 = possible match (some uncertainty)
    1.0 = perfect rule match
    """
    score = 1.0
    penalties = []
    disqualified = False

    # --- Category match ---
    scheme_cats = scheme.get("eligible_categories", [])
    user_cat = profile.get("category", "General")
    if "General" in scheme_cats:
        # Scheme open to everyone
        pass
    elif user_cat not in scheme_cats:
        # User's category not in scheme's eligible list
        disqualified = True
    else:
        score += 0.2  # bonus for exact category match

    # --- State match ---
    scheme_states = scheme.get("states_applicable", [])
    user_state = profile.get("state", "")
    if "All India" in scheme_states:
        pass
    elif user_state and user_state not in scheme_states:
        disqualified = True

    # --- Business stage match ---
    scheme_stages = scheme.get("business_stage_applicable", [])
    user_stage = profile.get("business_stage", "idea")
    if scheme_stages and user_stage not in scheme_stages:
        penalties.append(0.3)

    # --- Sector match ---
    scheme_sectors = [s.lower() for s in scheme.get("sector", [])]
    user_sector = profile.get("sector", "").lower()
    if user_sector and scheme_sectors:
        if user_sector in scheme_sectors or any(user_sector in s for s in scheme_sectors):
            score += 0.15  # sector bonus
        else:
            # partial penalty for sector mismatch (not disqualifying)
            penalties.append(0.1)

    # --- Age check ---
    min_age = scheme.get("min_age")
    max_age = scheme.get("max_age")
    user_age = profile.get("age")
    if user_age is not None:
        if min_age and user_age < min_age:
            disqualified = True
        if max_age and user_age > max_age:
            disqualified = True

    # --- Income ceiling check ---
    income_ceiling = scheme.get("income_ceiling")
    user_income = profile.get("annual_income")
    if income_ceiling and user_income:
        if user_income > income_ceiling:
            disqualified = True

    # --- Funding need vs scheme range ---
    funding_need = profile.get("funding_need", 0)
    scheme_max = scheme.get("funding_max", 0)
    if funding_need and scheme_max:
        if scheme_max > 0 and funding_need <= scheme_max:
            score += 0.1  # funding range aligns

    if disqualified:
        return 0.0

    # Apply penalties
    for p in penalties:
        score -= p

    return min(max(score, 0.1), 1.5)  # cap between 0.1 and 1.5


def filter_schemes(schemes: List[Dict], profile: Dict) -> List[Dict]:
    """
    Returns list of (scheme, rule_score) tuples, excluding hard-disqualified schemes.
    """
    results = []
    for scheme in schemes:
        score = calculate_rule_score(scheme, profile)
        if score > 0.0:
            results.append({
                "scheme": scheme,
                "rule_score": round(score, 3)
            })
    return results
