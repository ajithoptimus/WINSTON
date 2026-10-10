# WINSTON Desktop Screen Agent

Lightweight, silent background agent for Windows that allows WINSTON on your mobile device to inspect your PC screen and answer questions on-demand.

## Prerequisites
- Python 3.11+
- Virtual environment or system Python

## Quick Setup
1. Open PowerShell / Command Prompt in this `pc-agent` directory:
   ```cmd
   pip install -r requirements.txt
   ```
2. Edit `config.json`:
   - `server_url`: Set to your Render URL (e.g. `https://winston-xxxx.onrender.com`) or `http://localhost:3000` for local testing.
   - `pairing_token`: Matches `WINSTON_PAIRING_TOKEN` (default: `winston-kongad-2027`).

## Usage
- **Start Agent**: Double-click `start_winston.bat`.
  The agent launches using `pythonw.exe` with zero console windows, no system tray icons, and minimal background CPU/RAM usage.
- **On Mobile**: Open WINSTON. The header status will show `● Desktop Linked`.
- **Inspect Screen**: Tap the camera icon (`Inspect Screen` / `Capture & Solve`) in the WINSTON chat header.
- **Stop Agent**: Double-click `stop_winston.bat`.
