@echo off
title ApplyBot — AI Job Hunting & Career Operating System
cd /d "%~dp0"
echo ====================================================================
echo   ApplyBot — AI Job Hunting & Career Operating System
echo   FastAPI Backend + 3D Glassmorphic Interface + LaTeX Engine
echo ====================================================================
echo Opening Interface: http://localhost:8000
start "" "http://localhost:8000"
call .venv\Scripts\uvicorn.exe server:app --host 127.0.0.1 --port 8000
pause
