"""
Context-Aware Multilingual AI Chatbot Router
Empowers entrepreneurs to ask anything about schemes, applications, eligibility, and documents.
Answers in the user's selected regional language with action chips and links.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import re

from matching.live_fetcher import get_all_active_schemes
from utils.translation import translate_text, SUPPORTED_LANGUAGES

router = APIRouter()


class ChatRequest(BaseModel):
    message: str = Field(..., description="User's question or statement")
    lang: str = Field("en", description="Target response language code (e.g. ta, te, hi, mr, en)")
    current_scheme_id: Optional[str] = Field(None, description="Active scheme ID if user is viewing a card")
    profile: Optional[Dict[str, Any]] = Field(None, description="User's profile state if available")


class ChatResponse(BaseModel):
    reply: str
    suggested_actions: List[Dict[str, str]]
    relevant_schemes: List[Dict[str, str]]
    lang: str


def _find_scheme_in_message(message: str, schemes: List[Dict]) -> Optional[Dict]:
    """Fuzzy matches scheme names from user query."""
    m_lower = message.lower()
    for s in schemes:
        name_lower = s.get("name", "").lower()
        # Direct word match or abbreviation match
        if s.get("scheme_id", "").lower() in m_lower or any(word in m_lower for word in name_lower.split() if len(word) > 4):
            return s
    return None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Processes chat query, generates tailored response based on scheme database,
    and returns localized answer with suggested actions.
    """
    user_msg = request.message.strip()
    msg_lower = user_msg.lower()
    target_lang = request.lang.lower().strip()
    if target_lang not in SUPPORTED_LANGUAGES:
        target_lang = "en"

    all_schemes = get_all_active_schemes()

    # Determine context scheme
    target_scheme = None
    if request.current_scheme_id:
        for s in all_schemes:
            if s.get("scheme_id") == request.current_scheme_id:
                target_scheme = s
                break

    if not target_scheme:
        target_scheme = _find_scheme_in_message(user_msg, all_schemes)

    # Contextual knowledge generation in English first
    reply_en = ""
    suggested_actions = []
    relevant_schemes = []

    # 1. "How to apply" or "want to apply"
    if any(k in msg_lower for k in ["apply", "procedure", "how to register", "process", "portal", "link", "form"]):
        if target_scheme:
            link = target_scheme.get("official_link", "https://www.india.gov.in")
            apply_text = target_scheme.get("plain_summary_apply", {}).get("en") or target_scheme.get("benefit_description", "")
            reply_en = (
                f"To apply for **{target_scheme['name']}**:\n\n"
                f"1. **Application Steps**: {apply_text}\n"
                f"2. **Official Application Portal**: [{link}]({link})\n"
                f"3. **Issuing Ministry/Body**: {target_scheme.get('issuing_body', 'Govt of India')}\n\n"
                f"Would you like me to show the exact list of documents you must keep ready before applying?"
            )
            suggested_actions = [
                {"label": "Check Required Documents", "action": f"What documents do I need for {target_scheme['name']}?"},
                {"label": "Check Eligibility", "action": f"Am I eligible for {target_scheme['name']}?"},
                {"label": "Open Official Portal", "url": link}
            ]
            relevant_schemes.append({"id": target_scheme["scheme_id"], "name": target_scheme["name"], "link": link})
        else:
            reply_en = (
                "To apply for any government scheme:\n\n"
                "1. **Identify your target scheme** using our Scheme Matcher.\n"
                "2. **Verify eligibility** based on your category (SC/ST/OBC/Women/PwD/Minority) and sector.\n"
                "3. **Gather core documents**: Aadhaar, Bank passbook, Caste certificate (if applicable), and Business proposal.\n"
                "4. **Submit online** on the respective official portal or visit your local District Industries Centre (DIC) or bank branch.\n\n"
                "Which specific scheme or business would you like to apply for?"
            )
            suggested_actions = [
                {"label": "Apply for Stand-Up India", "action": "How do I apply for Stand-Up India?"},
                {"label": "Apply for PM Mudra Loan", "action": "How do I apply for PM Mudra Yojana?"},
                {"label": "Apply for PMEGP Subsidy", "action": "How do I apply for PMEGP?"}
            ]

    # 2. "Documents needed" or "requirements"
    elif any(k in msg_lower for k in ["document", "paper", "certificate", "id proof", "what do i need", "requirements"]):
        if target_scheme:
            docs = target_scheme.get("required_documents", ["Aadhaar Card", "Bank Account", "Address Proof"])
            docs_list = "\n".join([f"• **{d}**" for d in docs])
            need_text = target_scheme.get("plain_summary_need", {}).get("en", "")
            reply_en = (
                f"Here are the required documents and prerequisites for **{target_scheme['name']}**:\n\n"
                f"{docs_list}\n\n"
                f"📌 **Eligibility summary**: {need_text}\n\n"
                f"Do you have these documents ready, or would you like application assistance?"
            )
            suggested_actions = [
                {"label": "How do I apply?", "action": f"How do I apply for {target_scheme['name']}?"},
                {"label": "What benefits do I get?", "action": f"What are the benefits of {target_scheme['name']}?"}
            ]
        else:
            reply_en = (
                "Standard documents needed for most government entrepreneurship schemes include:\n\n"
                "• **Identity & Address Proof**: Aadhaar Card, PAN Card, Voter ID\n"
                "• **Social Category Proof**: Caste Certificate (for SC/ST/OBC), Minority certificate, or Disability Certificate (40%+ for PwD)\n"
                "• **Banking**: Bank passbook or 6-month account statement\n"
                "• **Business Proof**: Udyam Registration, Project Report, or Trade License (if existing)\n\n"
                "Tell me which scheme you are interested in, and I will give you the exact checklist!"
            )
            suggested_actions = [
                {"label": "Stand-Up India Documents", "action": "Documents for Stand-Up India"},
                {"label": "PM Vishwakarma Documents", "action": "Documents for PM Vishwakarma"},
                {"label": "Mudra Loan Documents", "action": "Documents for Mudra loan"}
            ]

    # 3. Benefits / Funding / Subsidy / Loan
    elif any(k in msg_lower for k in ["benefit", "money", "loan", "subsidy", "interest", "grant", "how much", "funding", "what do i get"]):
        if target_scheme:
            what_text = target_scheme.get("plain_summary_what", {}).get("en") or target_scheme.get("benefit_description", "")
            funding_max = target_scheme.get("funding_max")
            funding_str = f"Up to ₹{funding_max:,}" if funding_max else "Consult portal"
            reply_en = (
                f"**Benefits of {target_scheme['name']}**:\n\n"
                f"💰 **Financial Support**: {what_text}\n"
                f"📈 **Funding Limit**: {funding_str}\n\n"
                f"Would you like to know how to apply or check your eligibility?"
            )
            suggested_actions = [
                {"label": "How to Apply", "action": f"How to apply for {target_scheme['name']}?"},
                {"label": "Document Checklist", "action": f"What documents do I need for {target_scheme['name']}?"}
            ]
        else:
            reply_en = (
                "Government schemes offer multiple types of financial assistance:\n\n"
                "1. **Capital Subsidies (15%–40% free grant)**: Like PMEGP and Mahila Coir Yojana (no repayment on subsidy portion).\n"
                "2. **Collateral-Free Bank Loans**: PM Mudra Yojana (up to ₹10 Lakh) and Stand-Up India (₹10 Lakh to ₹1 Crore).\n"
                "3. **Concessional Low-Interest Credit (4%–6%)**: NSFDC (SC), NBCFDC (OBC), NMDFC (Minority), and NHFDC (PwD).\n"
                "4. **Free Toolkits & Stipends**: PM Vishwakarma Yojana (₹15,000 free toolkit + skill training).\n\n"
                "Which category or business type applies to you?"
            )
            suggested_actions = [
                {"label": "Women Entrepreneur Schemes", "action": "What schemes are available for women?"},
                {"label": "SC/ST Schemes", "action": "What schemes are available for SC and ST?"},
                {"label": "Artisan & Handloom Schemes", "action": "Schemes for artisans and weavers"}
            ]

    # 4. Specific category / demographic queries
    elif any(k in msg_lower for k in ["women", "sc", "st", "obc", "minority", "pwd", "handicap", "artisan", "weaver", "farmer", "rural"]):
        matched = []
        for s in all_schemes:
            tags = [t.lower() for t in s.get("tags", [])]
            cats = [c.lower() for c in s.get("eligible_categories", [])]
            if any(k in cats or k in tags for k in ["women", "sc", "st", "obc", "minority", "pwd", "artisan"]):
                matched.append(s)
                if len(matched) >= 3:
                    break

        scheme_list = "\n".join([f"• **{m['name']}** — {m.get('benefit_description', '')[:100]}..." for m in matched])
        reply_en = (
            f"Here are top government schemes tailored for your demographic:\n\n"
            f"{scheme_list}\n\n"
            f"You can also use our **Smart Intake Wizard** to get an instant ranked matching score!"
        )
        suggested_actions = [
            {"label": "Find My Exact Matches", "action": "Match schemes for my profile"},
            {"label": "Tell me more about Stand-Up India", "action": "Details of Stand-Up India"}
        ]

    # 5. Default welcoming / guidance response
    else:
        reply_en = (
            f"Hello! I am **SchemeSaathi**, your AI Government Scheme Assistant.\n\n"
            f"I can help you:\n"
            f"• **Discover schemes** for your specific background (Women, SC/ST, OBC, Minorities, PwD, Artisans)\n"
            f"• **Get step-by-step application guidance** and official portal links\n"
            f"• **Check document checklists** before visiting a bank or portal\n"
            f"• **Listen to voice explanations** in 10 Indian languages\n\n"
            f"What business are you running or planning to start?"
        )
        suggested_actions = [
            {"label": "How to apply for a loan?", "action": "How to apply for a business loan?"},
            {"label": "Schemes for Women", "action": "What schemes are available for women?"},
            {"label": "Schemes for Artisans", "action": "Schemes for artisans and handicraft makers"}
        ]

    # Translate the generated reply into the user's requested regional language
    final_reply = reply_en
    if target_lang != "en":
        final_reply = translate_text(reply_en, target_lang=target_lang, source_lang="en")

    # Localize suggested action labels
    localized_actions = []
    for a in suggested_actions:
        lbl = a["label"]
        if target_lang != "en":
            lbl = translate_text(lbl, target_lang=target_lang, source_lang="en")
        loc_act = {"label": lbl}
        if "action" in a:
            loc_act["action"] = a["action"]
        if "url" in a:
            loc_act["url"] = a["url"]
        localized_actions.append(loc_act)

    return ChatResponse(
        reply=final_reply,
        suggested_actions=localized_actions,
        relevant_schemes=relevant_schemes,
        lang=target_lang
    )
