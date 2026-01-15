@echo off
echo ========================================
echo   STREACS Web Application
echo ========================================
echo.
echo Starting local HTTP server...
echo.
echo Open in browser: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python -m http.server 8000
