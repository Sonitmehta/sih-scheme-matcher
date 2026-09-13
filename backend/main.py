"""
FastAPI main entry point for SIH Scheme Matcher
AI-Driven Scheme Matching for Marginalized Entrepreneurs
SIH 2026 — Team Sonit
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from contextlib import asynccontextmanager
import json, os, asyncio

from routers import profile, schemes, tts, chatbot
from matching.nlp_engine import load_or_build_embeddings
from matching.live_fetcher import load_live_cache, run_auto_sync


def load_schemes():
    path = os.path.join(os.path.dirname(__file__), "data", "schemes.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


async def _background_auto_sync_loop():
    """
    Runs every 6 hours automatically to keep schemes fresh from myscheme.gov.in.
    Starts after a 30-second delay so startup is not slowed down.
    """
    await asyncio.sleep(30)  # let the server fully start first
    while True:
        try:
            print("\n[AutoSync] ⏰ Scheduled auto-sync starting...")
            result = await run_auto_sync()
            print(f"[AutoSync] ✅ Done — {result.get('live_schemes_fetched', 0)} live schemes indexed")
        except Exception as e:
            print(f"[AutoSync] ❌ Error during auto-sync: {e}")
        # Sleep 6 hours before next sync
        await asyncio.sleep(6 * 60 * 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: Pre-load NLP model, embeddings cache, and warm live scheme cache.
    Then launch background auto-sync loop.
    """
    print("=" * 60)
    print("  SIH 2026 — AI Scheme Matcher — Starting Up")
    print("=" * 60)

    # Load curated base schemes
    all_schemes = load_schemes()
    print(f"[Startup] Loaded {len(all_schemes)} curated schemes from database")

    # Pre-build/load embedding cache (fast if .pkl exists)
    load_or_build_embeddings(all_schemes)

    # Warm live cache from disk (instant — no network needed)
    cached = load_live_cache()
    print(f"[Startup] Live scheme cache: {len(cached)} schemes loaded from disk")

    # Launch background auto-sync loop (runs every 6 hours)
    sync_task = asyncio.create_task(_background_auto_sync_loop())
    print("[Startup] Background auto-sync scheduled every 6 hours ✅")
    print("[Startup] Ready to serve [OK]")
    print("=" * 60)

    yield

    # Clean shutdown
    sync_task.cancel()
    try:
        await sync_task
    except asyncio.CancelledError:
        pass
    print("[Shutdown] Goodbye.")


app = FastAPI(
    title="SIH 2026 — AI Scheme Matcher",
    description=(
        "AI-Driven Scheme Matching for Marginalized Entrepreneurs. "
        "Uses rule-based filtering + Sentence-BERT semantic matching to connect "
        "women, SC/ST/OBC, minorities, and PwD entrepreneurs with relevant government schemes. "
        "Live scheme data auto-synced every 6 hours from myscheme.gov.in."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS — allow frontend on any port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(profile.router, prefix="/api", tags=["Profile"])
app.include_router(schemes.router, prefix="/api", tags=["Schemes"])
app.include_router(tts.router, prefix="/api", tags=["TTS"])
app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "healthy", "version": "2.0.0"}


# ── Serve React frontend (production build) ───────────────────────────────────
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        target = os.path.join(DIST_DIR, full_path)
        if os.path.isfile(target):
            return FileResponse(target)
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        return JSONResponse({"message": "Frontend build not found. Run 'npm run build' in the frontend directory."})
else:
    @app.get("/", tags=["Health"])
    async def root():
        return {
            "service": "SIH 2026 — AI Scheme Matcher",
            "status": "running",
            "version": "2.0.0",
            "note": "Frontend dist not found. Run 'npm run build' in frontend/",
            "docs": "/docs"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=False)
