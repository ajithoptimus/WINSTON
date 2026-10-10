@echo off
REM WINSTON Desktop Agent Launcher
REM Runs silently with zero visual footprint using pythonw.exe
cd /d "%~dp0"
if exist STOP del STOP
start "" /B pythonw.exe winston_agent.py
echo WINSTON Agent started silently in the background.
timeout /t 2 >nul
