@echo off
echo ======================================================================
echo    SIH 2026 - AI-Driven Scheme Matching Platform
echo    Starting Backend (FastAPI) and Frontend (React + Vite)...
echo ======================================================================

start "SIH Backend (FastAPI :8080)" cmd /k "cd /d %~dp0\backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8080"
timeout /t 3 /nobreak >nul
start "SIH Frontend (Vite :5173)" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo Both servers are launching!
echo Backend API:   http://localhost:8080/docs (Swagger UI)
echo Frontend App:  http://localhost:5173
echo ======================================================================
pause
