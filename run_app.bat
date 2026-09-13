@echo off
title SchemeAI - SIH 2026 Scheme Matcher
echo ======================================================================
echo    Starting SchemeAI (SIH 2026 Problem Statement #26092)
echo ======================================================================
echo.
cd /d "%~dp0\backend"
echo [1/2] Launching AI Scheme Matcher Server on http://localhost:8080 ...
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"
echo [2/2] Opening application in your default browser...
python -m uvicorn main:app --host 0.0.0.0 --port 8080
pause
