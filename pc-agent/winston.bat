@echo off
setlocal
cd /d "%~dp0"
python winston_agent.py %*
