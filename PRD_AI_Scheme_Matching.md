# Product Requirements Document
## AI-Driven Scheme Matching for Marginalized Entrepreneurs
**SIH Problem Statement:** AI-Driven Scheme Matching for Marginalized Entrepreneurs
**Document Version:** 1.0
**Status:** Draft for Hackathon Build

---

## 1. Overview

### 1.1 Problem Statement
Marginalized entrepreneurs — women, SC/ST/OBC individuals, persons with disabilities, minorities, and rural/informal-sector founders — face a fragmented, jargon-heavy landscape of hundreds of government schemes (central, state, and sector-specific) offering grants, subsidies, and loans. Most eligible entrepreneurs never discover the schemes they qualify for, either due to information overload, language barriers, or low digital literacy.

### 1.2 Product Vision
A single platform where an entrepreneur (or an intermediary acting on their behalf) enters basic profile details and receives a ranked, plain-language list of government schemes they are actually eligible for — with a clear "what you get, what you need, how to apply" breakdown, available in their own language.

### 1.3 Objectives
- Reduce time-to-discovery of relevant schemes from hours of manual search to under 2 minutes
- Make eligibility criteria understandable without requiring legal/bureaucratic literacy
- Serve users directly or through intermediaries (NGOs, Common Service Centres, bank correspondents)
- Demonstrate genuine AI/NLP-driven matching, not a static filtered list

---

## 2. Target Users / Personas

| Persona | Description | Primary Need |
|---|---|---|
| **Direct User — Rural Entrepreneur** | Low-to-moderate digital literacy, may prefer voice/regional language | Simple guided intake, spoken results |
| **Direct User — Urban/Semi-Urban Entrepreneur** | Comfortable with apps, wants speed and accuracy | Fast, precise matching with minimal input |
| **Intermediary — NGO/CSC Worker** | Processes many applicants on behalf of communities | Bulk profile handling, case tracking dashboard |
| **Intermediary — Bank Correspondent** | Assists with loan-linked scheme applications | Document checklist, application status tracking |

---

## 3. Scope

### 3.1 In Scope (Hackathon MVP)
- Guided profile intake form (category, location, sector, business stage)
- Rule-based eligibility filtering engine
- NLP-based semantic matching (business description → scheme description)
- Plain-language scheme summarization
- Ranked results with document checklists
- Basic regional-language text + voice output (1–2 languages demoed)
- Curated static dataset of 15–25 real schemes

### 3.2 Out of Scope (Post-Hackathon / Future Roadmap)
- Live scraping/auto-sync with government scheme portals
- Full 22-language coverage
- User authentication and account persistence
- Direct in-app application submission (redirect to official portals instead)
- Full NGO/CSC caseworker dashboard with multi-user roles
- Payment or subsidy disbursement tracking

---

## 4. Features & Functional Requirements

### 4.1 Smart Profile Intake
- **FR-1:** User can input: category (General/SC/ST/OBC/Minority/Women/PwD), state/district, business sector, business stage (idea/early/existing), approximate funding need
- **FR-2:** User can optionally provide a free-text business description ("I make handwoven textiles and want to sell online")
- **FR-3:** Voice input option using speech-to-text for users who prefer not to type
- **FR-4:** Intake form must be completable in under 5 steps / 2 minutes

### 4.2 AI-Powered Matching Engine
- **FR-5:** System applies hard-constraint rule filtering first (category, state, income ceiling, sector match) to narrow the scheme pool
- **FR-6:** System applies semantic similarity matching (sentence embeddings) between the user's free-text business description and each scheme's description/purpose text, to catch non-keyword matches
- **FR-7:** Combined score (rule-match confidence + semantic similarity) produces a ranked list, highest relevance first
- **FR-8:** Each result displays a relevance indicator (e.g., "Strong Match" / "Possible Match")

### 4.3 Scheme Explainer
- **FR-9:** Each matched scheme is summarized into three fields: *What you get*, *What you need*, *How to apply* — max 2–3 lines each
- **FR-10:** Summaries are pre-generated (batch, offline) for the curated dataset to ensure demo reliability; live LLM summarization is a stretch goal only

### 4.4 Multilingual & Voice Output
- **FR-11:** Scheme summaries available in at least one regional language in addition to English/Hindi for the demo
- **FR-12:** Text-to-speech playback of scheme summaries

### 4.5 Document Checklist
- **FR-13:** Each matched scheme displays a checklist of commonly required documents (Aadhaar, caste certificate, business registration proof, bank passbook, etc.)
- **FR-14:** Link to the scheme's official application portal

### 4.6 Intermediary View (Stretch Goal)
- **FR-15:** A simplified caseworker screen to enter multiple applicant profiles and view their matches in a list, for NGO/CSC use

### 4.7 Optional Stretch: Document Verification (CNN)
- **FR-16 (stretch, optional):** If time permits, an OCR/CNN-based module to auto-read uploaded ID/certificate images and pre-fill category or eligibility fields. This is a nice-to-have that demonstrates additional technical depth — not required for the core value proposition, and should only be attempted after FR-1 through FR-14 are solid.

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Matching results returned in under 3 seconds for a dataset of ~25 schemes |
| **Usability** | Interface usable by someone with minimal digital literacy — large touch targets, minimal text, icon-supported navigation |
| **Reliability (for demo)** | Core matching flow must work offline / without live API dependency wherever possible, to avoid demo failure from network issues |
| **Accessibility** | Voice output and simple language support are core accessibility features, not add-ons |
| **Scalability (design intent, not built for MVP)** | Architecture should be describable as scalable to hundreds of schemes and multiple languages, even if the prototype only demonstrates a subset |

---

## 6. System Architecture

```
┌──────────────────────────────┐
│     Frontend (React +        │
│     Tailwind CSS)            │
│  - Profile intake form       │
│  - Results / scheme cards    │
│  - Voice input/output widget │
└───────────────┬──────────────┘
                │ REST API (JSON)
┌───────────────▼──────────────┐
│   Backend API (FastAPI /     │
│   Node.js + Express)         │
│  - Auth-free session handling│
│  - Orchestrates matching     │
└───────┬───────────────┬──────┘
        │               │
┌───────▼──────┐ ┌──────▼────────────┐
│ Rule Engine   │ │ NLP Matching Layer │
│ (Python logic │ │ (Sentence-BERT /   │
│  / decision   │ │  Sentence-         │
│  tables)      │ │  Transformers      │
│               │ │  embeddings +      │
│               │ │  cosine similarity)│
└───────┬──────┘ └──────┬────────────┘
        │               │
┌───────▼───────────────▼──────┐
│   Scheme Database              │
│   (PostgreSQL or MongoDB)      │
│  - Scheme metadata             │
│  - Eligibility rules            │
│  - Pre-generated summaries     │
└────────────────────────────────┘

Supporting services:
- Translation (Bhashini API / Google Translate API) — regional language text
- Text-to-Speech (gTTS or Bhashini TTS) — voice output
- (Stretch) OCR/CNN document reader — Tesseract OCR + lightweight CNN classifier
```

### 6.1 Tech Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React + Tailwind CSS | Fast to build, component-driven, matches modern UI expectations |
| UI Design Reference | Dribbble (mood board / inspiration only) + a component library (e.g., shadcn/ui) for actual build | Dribbble is inspiration, not a code library — pair it with a real component kit |
| Backend | FastAPI (Python) or Node/Express | Python preferred if the NLP layer is in Python, for simpler integration |
| Database | PostgreSQL (structured scheme/eligibility data) | Rule-based filtering benefits from relational queries |
| NLP Matching | Sentence-Transformers (e.g., `all-MiniLM-L6-v2`) | Free, fast, runs locally without heavy GPU needs — ideal for hackathon |
| Summarization | Pre-generated via LLM API (batch, offline) | Avoids live-call latency/failure risk during the demo |
| Translation/TTS | Bhashini API (Govt. of India's language AI initiative) or Google Translate/TTS | Directly relevant given the "marginalized/regional" framing — using an Indian government-backed language API is also a strong narrative point for judges |
| Optional OCR | Tesseract OCR + simple CNN classifier | Only if time permits; supports FR-16 |
| Project Management | Notion | Team task tracking, PRD hosting, sprint board — not part of shipped product |
| Not Used | GAN | No generative-image or synthetic-data need in this problem; omitted to avoid unjustified complexity |

---

## 7. Data Model (Simplified)

**Scheme**
```
scheme_id, name, issuing_body, sector, states_applicable[],
eligible_categories[], min_age, max_age, income_ceiling,
business_stage_applicable[], benefit_description,
eligibility_text_raw, plain_summary_what, plain_summary_need,
plain_summary_apply, required_documents[], official_link,
regional_summaries: { hi: "...", <lang_code>: "..." }
```

**UserProfile (session-based, not persisted long-term for MVP)**
```
category, state, district, sector, business_stage,
funding_need_range, business_description_text
```

**MatchResult**
```
scheme_id, rule_match_score, semantic_similarity_score,
combined_relevance_score, match_label ("Strong"/"Possible")
```

---

## 8. Core User Flow

1. User lands on the app → selects "Start" (or "Speak to Start" for voice mode)
2. Guided intake: category → state → sector → business stage → (optional) free-text description
3. System runs rule filter → narrows scheme pool
4. System runs semantic matching on remaining pool using the free-text description
5. Results screen: ranked scheme cards, each showing relevance label, plain-language summary, document checklist, official link
6. User can toggle language / play audio summary per scheme
7. (Stretch) Caseworker mode: repeat steps 2–6 for multiple applicants, saved in a session list

---

## 9. API Design (Core Endpoints)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/profile` | Submit user profile, returns session/profile ID |
| `GET` | `/api/schemes/match?profile_id=...` | Returns ranked matched schemes |
| `GET` | `/api/schemes/{scheme_id}` | Full detail for one scheme |
| `GET` | `/api/schemes/{scheme_id}/summary?lang=...` | Localized plain-language summary |
| `POST` | `/api/schemes/{scheme_id}/tts?lang=...` | Returns audio stream of the summary |
| `POST` | `/api/caseworker/applicants` | (Stretch) Add applicant under caseworker session |

---

## 10. Success Metrics (for pitch/demo narrative)

| Metric | Target (illustrative, for pitch) |
|---|---|
| Time to receive matched results | < 2 minutes from landing to results |
| Relevant schemes surfaced per user | 3–5 high-confidence matches on average |
| Language accessibility | At least 2 languages demoed (English + 1 regional) |
| Reduction in irrelevant scheme noise | From "100s of schemes to search" → "top 3–5 ranked" |

---

## 11. Risks & Assumptions

| Risk | Mitigation |
|---|---|
| Live LLM/translation API failure during demo | Pre-generate and cache all summaries/translations used in the demo path |
| "AI" claim seen as superficial by judges | Make the semantic-matching step visibly demonstrable — show a business description matching a scheme that doesn't share exact keywords |
| Scheme data becomes outdated | Acknowledge in pitch as a "sync pipeline" roadmap item; not built in MVP |
| Overscoping (trying to build caseworker dashboard + OCR + everything) | Explicitly sequence build priority: core matching flow first, stretch goals only if time remains |

---

## 12. Build Timeline (36-Hour Hackathon Sequencing)

| Phase | Hours | Deliverable |
|---|---|---|
| Setup + dataset curation | 0–4 | Repo scaffolding, 15–25 real schemes structured in DB |
| Rule engine + intake form | 4–10 | Working filter on hard-constraint fields |
| NLP semantic matching | 10–16 | Embedding-based ranking layered on top of rule filter |
| Summaries + document checklist | 16–20 | Pre-generated plain-language content wired to results |
| Frontend polish (Tailwind + UI) | 20–28 | Clean, accessible results screen; mobile-responsive |
| Multilingual + voice layer | 28–32 | 1–2 languages, TTS working end-to-end |
| Testing + demo script rehearsal | 32–36 | Full persona walkthrough tested twice, backup screenshots ready |

---

## 13. Team Roles (Suggested for a 6-Member SIH Team)

| Role | Responsibility |
|---|---|
| Backend/API Lead | FastAPI/Node endpoints, rule engine |
| ML/NLP Lead | Embedding matching, similarity scoring |
| Frontend Lead | React + Tailwind UI |
| Data/Content Lead | Scheme dataset curation, plain-language summaries |
| Language/Accessibility Lead | Translation + TTS integration |
| PM/Presentation Lead | Notion tracking, pitch deck, demo script |

---

## 14. Appendix: Sample Scheme Entry (Reference Format)

```json
{
  "scheme_id": "stand_up_india",
  "name": "Stand-Up India Scheme",
  "issuing_body": "Department of Financial Services, Govt. of India",
  "sector": "General/Manufacturing/Services/Trading",
  "states_applicable": ["All India"],
  "eligible_categories": ["SC", "ST", "Women"],
  "min_age": 18,
  "business_stage_applicable": ["idea", "early"],
  "benefit_description": "Bank loans between ₹10 lakh and ₹1 crore for greenfield enterprises",
  "plain_summary_what": "A bank loan of ₹10 lakh–₹1 crore to start a new business.",
  "plain_summary_need": "You must be SC/ST or a woman, aged 18+, starting a new (not existing) business.",
  "plain_summary_apply": "Apply through any scheduled commercial bank branch or the Stand-Up India portal.",
  "required_documents": ["Aadhaar", "Caste certificate (if applicable)", "Business plan", "Address proof"],
  "official_link": "https://www.standupmitra.in"
}
```

---

*This PRD is scoped for hackathon MVP delivery. Sections marked "stretch" or "future roadmap" should only be pursued once the core matching flow (FR-1 through FR-14) is fully working and demo-ready.*
