@echo off
title GovtJob.site Automated Scraper Daemon
color 0A

echo ========================================================
echo   GovtJob.site 24/7 Automated Scraper Worker
echo ========================================================
echo.

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found. Please install Node.js from https://nodejs.org
    pause
    exit /b
)

:: Install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [INFO] First time run detected. Installing required packages...
    call npm install --omit=dev
)

echo [INFO] Starting scraper runner in background loop...
echo [INFO] Laptop will scan SarkariResult every 2 hours automatically.
echo [INFO] Minimize this window to keep it running 24/7.
echo.

node scripts/runner.js

pause
