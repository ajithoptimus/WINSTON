@echo off
setlocal
cd /d "%~dp0\pc-agent"
python winston_agent.py %*
