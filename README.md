# SchemeAI — Government Scheme Matcher for Entrepreneurs

> Built for Smart India Hackathon 2026 · Problem Statement #26092

SchemeAI is a web app that helps marginalized entrepreneurs — women, SC/ST/OBC, minorities, and PwD — discover and apply for relevant government schemes. It uses AI-powered matching to cut through the complexity of 1,000+ government schemes and show only what you're actually eligible for.

---

## Features

- **AI Scheme Matching** — Rule-based hard filtering combined with Sentence-BERT semantic matching ranks schemes by relevance to your business description
- **10 Regional Languages** — Full UI and scheme summaries in English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam, and Punjabi
- **Voice Input & Output** — Speak your business details using the microphone; listen to any scheme summary in your selected language
- **AI Chatbot Assistant** — Ask the chatbot about any scheme, eligibility, documents, or how to apply — answers in your chosen language
- **Live Scheme Data** — Schemes are automatically fetched from [myscheme.gov.in](https://www.myscheme.gov.in) every 6 hours so data stays current
- **Instant Results** — Matching takes under 2 seconds; embeddings are pre-cached locally

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | FastAPI (Python), Uvicorn |
| AI Matching | sentence-transformers (`all-MiniLM-L6-v2`), TF-IDF fallback |
| Translation | Google Translate API (GTX endpoint) |
| TTS | Browser Web Speech API (primary), gTTS (fallback) |
| Live Data | myscheme.gov.in public API, auto-synced every 6h |

---

## How It Works

```
User fills 5-step profile (or speaks it)
            │
    Rule Engine (hard filters)
    Category, State, Stage, Income
            │
    Semantic Engine (Sentence-BERT)
    Cosine similarity on business description
            │
    Combined Score = (Rule × 0.6) + (Semantic × 0.4)
            │
    Ranked scheme cards with summaries in your language
```

---

## Quick Start

### Windows (one-click)
Double-click `run_app.bat` — opens the app at `http://localhost:8080` automatically.

### Manual

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8080
```

The backend also serves the pre-built frontend, so no separate frontend server is needed.

To rebuild the frontend after making changes:
```bash
cd frontend
npm install
npm run build
```

---

## Project Structure

```
├── backend/
│   ├── main.py               # FastAPI app, background auto-sync
│   ├── data/
│   │   └── schemes.json      # Curated base scheme database
│   ├── matching/
│   │   ├── nlp_engine.py     # Sentence-BERT + TF-IDF matching
│   │   ├── rule_engine.py    # Hard eligibility filters
│   │   └── live_fetcher.py   # myscheme.gov.in auto-sync engine
│   ├── routers/
│   │   ├── schemes.py        # Matching, live search, sync endpoints
│   │   ├── chatbot.py        # Multilingual AI chatbot
│   │   ├── tts.py            # Text-to-speech endpoint
│   │   └── profile.py        # User profile management
│   └── utils/
│       └── translation.py    # 10-language translation engine
├── frontend/
│   └── src/
│       ├── pages/            # LandingPage, MatchPage
│       └── components/       # SchemeCard, SchemeChatbot, VoiceOutput, ...
├── run_app.bat               # One-click Windows launcher
└── start_servers.bat         # Dev mode launcher
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/profile` | Create user profile |
| GET | `/api/schemes/match?profile_id=` | Get AI-matched schemes |
| GET | `/api/schemes/live-search?q=` | Search live schemes |
| POST | `/api/schemes/sync-live` | Trigger immediate sync |
| GET | `/api/schemes/{id}/summary?lang=hi` | Get localized scheme summary |
| POST | `/api/chat` | Send message to AI chatbot |
| POST | `/api/tts` | Convert text to speech |
| GET | `/api/health` | Health check |

---

## License

MIT
