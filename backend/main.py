"""
FastAPI main entry point for SIH Scheme Matcher
AI-Driven Scheme Matching for Marginalized Entrepreneurs
SIH 2026 — Team Sonit
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import json, os

from routers import profile, schemes, tts
from matching.nlp_engine import load_or_build_embeddings


def load_schemes():
    path = os.path.join(os.path.dirname(__file__), "data", "schemes.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: Pre-load NLP model and build embeddings cache.
    This ensures the first API request is fast (no cold start).
    """
    print("=" * 60)
    print("  SIH 2026 — AI Scheme Matcher — Starting Up")
    print("=" * 60)
    all_schemes = load_schemes()
    print(f"[Startup] Loaded {len(all_schemes)} schemes from database")
    load_or_build_embeddings(all_schemes)
    print("[Startup] Ready to serve [OK]")
    print("=" * 60)
    yield
    print("[Shutdown] Goodbye.")


app = FastAPI(
    title="SIH 2026 — AI Scheme Matcher",
    description=(
        "AI-Driven Scheme Matching for Marginalized Entrepreneurs. "
        "Uses rule-based filtering + Sentence-BERT semantic matching to connect "
        "women, SC/ST/OBC, minorities, and PwD entrepreneurs with relevant government schemes."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS — allow React frontend on any port during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import profile, schemes, tts, chatbot

# Include routers
app.include_router(profile.router, prefix="/api", tags=["Profile"])
app.include_router(schemes.router, prefix="/api", tags=["Schemes"])
app.include_router(tts.router, prefix="/api", tags=["TTS"])
app.include_router(chatbot.router, prefix="/api", tags=["Chatbot"])


from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi import HTTPException

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "healthy"}

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
        return JSONResponse({"message": "Frontend build not found. Run 'npm run build' in frontend directory."})
else:
    @app.get("/", tags=["Health"])
    async def root():
        return {
            "service": "SIH 2026 — AI Scheme Matcher",
            "status": "running",
            "version": "1.0.0",
            "docs": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
