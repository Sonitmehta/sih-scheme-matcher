# 🇮🇳 SchemeAI — AI-Driven Scheme Matching for Marginalized Entrepreneurs
### Smart India Hackathon (SIH) 2026 — Problem Statement #26092

> **Empowering Women, SC, ST, OBC, Minorities, and PwD Entrepreneurs by bridging the information gap to 25+ government schemes in under 90 seconds.**

---

## 🌟 Why This Wins at SIH 2026

1. **True AI / Semantic Understanding (Sentence-BERT)**:
   - Does **not** just match keywords. When an artisan says *"I make terracotta pots and weave handloom garments"*, the model maps this to schemes mentioning *"handicraft cluster development"*, *"traditional crafts"*, and *"greenfield enterprises"*.
2. **Transparent AI Reasoning Panel**:
   - Judges can inspect the exact **60% Rule Match vs 40% Semantic Cosine Similarity** mathematical breakdown for every single recommendation.
3. **Multilingual by Design (English + Hindi + Marathi)**:
   - Includes full plain-language summaries ("What you get", "What you need", "How to apply") localized in **English**, **हिंदी**, and **मराठी**.
4. **Voice Accessibility (Speech-to-Text & Text-to-Speech)**:
   - Rural entrepreneurs can speak their business description using the built-in microphone and listen to any scheme summary with integrated audio playback.
5. **Instant Demo Presets**:
   - Ready-to-demo personas for judges:
     - 👩‍🎨 **Sunita Devi (SC Woman, UP)** — Handloom & terracotta pottery
     - 🍱 **Zaid Khan (Minority, Kerala)** — Cloud kitchen & packaged snacks
     - ♿ **Ramesh Pawar (PwD, Maharashtra)** — Kolhapuri leather & GeM marketplace
     - 🤝 **Ananya Patil (Women SHG, Maharashtra)** — Coconut coir & rural enterprise
6. **Zero-Failure Demo Architecture**:
   - Embeddings are pre-cached locally on disk (`scheme_embeddings.pkl`). The demo runs seamlessly offline without external API latency or failure risks.

---

## 🏗️ Architecture

```
[ Rural / Urban Entrepreneur or Intermediary (NGO / CSC) ]
                           │
                 [ React 18 + Tailwind CSS ]
            • 5-Step Guided Intake (Voice or Click)
            • One-Click Demo Presets for Judges
            • Audio TTS Playback & Language Switcher
            • AI Transparency Score Breakdown
                           │
                    REST API (JSON)
                           │
                 [ FastAPI Python Backend ]
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
[ Rule Engine ]                    [ NLP Semantic Engine ]
• Hard eligibility constraints     • sentence-transformers (all-MiniLM-L6-v2)
• Category, State, Stage, Income   • Cosine similarity between user description
• Disqualification filter            and 25 scheme purpose texts
        └──────────────────┬──────────────────┘
                           ▼
          [ Hybrid Ranking Algorithm ]
          Final Score = (Rule Score × 0.6) + (Semantic Score × 0.4)
          Labels: Strong Match (>=65%) | Good Match (>=45%) | Possible (>=30%)
                           │
               [ Local Cached Scheme DB ]
          25 Curated Central & State Schemes
```

---

## 🚀 Quick Start (One Command)

### Option 1: Using the Batch Launcher (Windows)
Double-click `start_servers.bat` in `sih-scheme-matcher/`.

### Option 2: Manual Start

#### 1. Backend (Terminal 1)
```bash
cd sih-scheme-matcher/backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8080
```
API Documentation will be live at: **http://localhost:8080/docs**

#### 2. Frontend (Terminal 2)
```bash
cd sih-scheme-matcher/frontend
npm run dev
```
Open your browser at: **http://localhost:5173**

---

## 📊 Curated Schemes Included (25 Schemes)

1. **Stand-Up India Scheme** (SC/ST/Women, ₹10L–₹1Cr)
2. **PM Mudra Yojana — Shishu** (Micro-loans up to ₹50K)
3. **PM Mudra Yojana — Kishor** (Loans ₹50K–₹5L)
4. **PM Mudra Yojana — Tarun** (Loans ₹5L–₹10L)
5. **Prime Minister Employment Generation Programme (PMEGP)** (15–35% Subsidy up to ₹50L)
6. **Udyogini Scheme** (Women entrepreneurs, subsidized loan/grant)
7. **PM Vishwakarma Yojana** (Traditional artisans: ₹15K toolkit + collateral-free credit + stipend)
8. **National SC Finance & Development Corp (NSFDC)** (5–6% Concessional loans up to ₹30L)
9. **National Backward Classes Finance & Development Corp (NBCFDC)** (6% Loans up to ₹20L)
10. **National Handicapped Finance & Development Corp (NHFDC)** (PwD self-employment at 5%)
11. **National Minorities Development & Finance Corp (NMDFC)** (Concessional credit up to ₹30L)
12. **TREAD Scheme** (30% Government grant for women via NGOs)
13. **DAY-NRLM** (Women Self-Help Group micro-credit up to ₹5L at 7%)
14. **One District One Product (ODOP)** (Branding, GI tag, e-commerce support)
15. **GeM Artisan & SHG Seller Onboarding** (Direct government supply, 0% commission)
16. **KVIC Khadi & Village Industries** (Handloom, pottery, rural manufacturing)
17. **Mahila Coir Yojana** (75% Machinery subsidy for women)
18. **Annapurna Scheme** (Food catering / tiffin businesses up to ₹50K)
19. **PM Kaushal Vikas Yojana (PMKVY)** (Free skill training + ₹8K reward)
20. **Startup India Seed Fund Scheme (SISFS)** (Up to ₹50L prototype grant/soft loan)
21. **ZED Certification for MSMEs** (Up to 80% subsidy for quality certification)
22. **Mahila Shakti Kendra (MSK)** (Rural women digital literacy & scheme hub)
23. **Coir Udyami Yojana** (40% subsidy for coir processing units)
24. **ASPIRE Scheme** (Livelihood business incubators for agro-food startups)
25. **Pradhan Mantri Jan Dhan Yojana** (Financial inclusion & overdraft linkage)

---

## 🏆 Presentation Script for SIH Judges (3-Minute Demo)

1. **Hook (30s)**:
   > *"Respected judges, India has over 1,000 government schemes, but 85% of marginalized entrepreneurs never receive benefits due to language barriers, technical jargon, and discovery friction. Today, we present SchemeAI — an AI engine that matches entrepreneurs to eligible schemes in 90 seconds."*
2. **The Problem with Keyword Search (30s)**:
   > *"If an artisan writes 'I weave sarees on handloom and make clay pots', a regular keyword search looks for exact words and misses schemes titled 'MSME Cluster Development' or 'PM Vishwakarma'. Our Sentence-BERT model semantically links her craft description to the scheme objectives."*
3. **Interactive Demo (60s)**:
   - Click **"Try a Demo Persona"** on the landing page.
   - Select **"Sunita Devi — Rural SC Woman Artisan"**.
   - Show how the AI filters out ineligible schemes and ranks **PM Vishwakarma**, **Stand-Up India**, and **ODOP** at the top.
   - Expand a scheme card to reveal **"What you get, What you need, How to apply"**.
   - Click the **Language toggle to हिंदी / मराठी**.
   - Click **▶ Listen** to show the Text-to-Speech audio playing.
   - Open **"Show AI Match Explanation"** to prove the mathematical rule + semantic weighting to the judges.
4. **Impact & Future Roadmap (30s)**:
   > *"Our solution works offline, can be integrated directly into Common Service Centres (CSCs) and bank correspondent terminals, and scales to all 22 scheduled languages using the Government of India's Bhashini initiative."*
