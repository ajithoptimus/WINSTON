@echo off
REM WINSTON Desktop Agent Shutdown
cd /d "%~dp0"
echo STOP> STOP
echo WINSTON Agent shutdown signal sent.
timeout /t 2 >nul
