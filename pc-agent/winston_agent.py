from __future__ import annotations

import argparse
import base64
import datetime
import io
import json
import logging
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import mss
from PIL import Image
import requests

# Base directory for the agent
BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
STOP_FILE = BASE_DIR / "STOP"
PID_FILE = BASE_DIR / "agent.pid"
LOG_FILE = BASE_DIR / "winston_agent.log"

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


def load_config() -> dict[str, Any]:
    default_config: dict[str, Any] = {
        "server_url": "http://localhost:3000",
        "pairing_token": "winston-kongad-2027",
        "heartbeat_interval": 3,
        "capture_quality": 70,
    }
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                default_config.update(data)
        except Exception as e:
            logging.error(f"Error reading config.json: {e}")
    return default_config


def save_config(cfg: dict[str, Any]) -> None:
    try:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception as e:
        logging.error(f"Error saving config.json: {e}")


def get_monitors_summary() -> list[dict[str, Any]]:
    """Return friendly metadata of detected physical monitors."""
    try:
        with mss.mss() as sct:
            if len(sct.monitors) <= 2:
                return [{"id": "primary", "name": "Primary Screen"}]
            return [
                {"id": "laptop", "name": "Laptop Screen (Testing)"},
                {"id": "all", "name": "Both Screens (Stitched)"},
                {"id": "external", "name": "External Monitor"},
            ]
    except Exception:
        return [{"id": "primary", "name": "Display Screen"}]


def capture_screen(target_monitor: str = "laptop", quality: int = 70) -> str:
    """Capture specified monitor (laptop / external / all) silently and return base64 JPEG."""
    with mss.mss() as sct:
        num_monitors = len(sct.monitors)

        if num_monitors <= 2:
            # Single monitor setup
            mon = sct.monitors[1] if num_monitors > 1 else sct.monitors[0]
            sct_img = sct.grab(mon)
            img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
        elif target_monitor in ("all", "both", "stitched"):
            # Stitch all physical monitors horizontally from left to right
            phys_monitors = sorted(sct.monitors[1:], key=lambda m: m["left"])
            imgs: list[Image.Image] = []
            total_w = 0
            max_h = 0
            for mon in phys_monitors:
                raw = sct.grab(mon)
                im = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
                imgs.append(im)
                total_w += im.width
                max_h = max(max_h, im.height)

            stitched = Image.new("RGB", (total_w, max_h), (20, 20, 20))
            cur_x = 0
            for im in imgs:
                stitched.paste(im, (cur_x, 0))
                cur_x += im.width

            # Scale proportionally if wider than 2560px for vision API constraints
            if total_w > 2560:
                scale = 2560.0 / total_w
                new_h = int(max_h * scale)
                img = stitched.resize((2560, new_h), Image.Resampling.LANCZOS)
            else:
                img = stitched
        elif target_monitor in ("laptop", "lap", "secondary", "testing", "2"):
            # Laptop screen: monitor with left < 0 or index 2
            laptop_mon = None
            for idx in range(1, len(sct.monitors)):
                if sct.monitors[idx]["left"] < 0 or idx == 2:
                    laptop_mon = sct.monitors[idx]
                    break
            if not laptop_mon:
                laptop_mon = sct.monitors[2] if len(sct.monitors) > 2 else sct.monitors[1]
            raw = sct.grab(laptop_mon)
            img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
        elif target_monitor in ("monitor", "external", "primary", "1"):
            # External monitor: monitor with left >= 0 or index 1
            ext_mon = None
            for idx in range(1, len(sct.monitors)):
                if sct.monitors[idx]["left"] >= 0 or idx == 1:
                    ext_mon = sct.monitors[idx]
                    break
            if not ext_mon:
                ext_mon = sct.monitors[1]
            raw = sct.grab(ext_mon)
            img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")
        else:
            # Default to laptop screen for dual setups, otherwise monitor 1
            target_mon = sct.monitors[2] if len(sct.monitors) > 2 else sct.monitors[1]
            raw = sct.grab(target_mon)
            img = Image.frombytes("RGB", raw.size, raw.bgra, "raw", "BGRX")

        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=quality, optimize=True)
        return base64.b64encode(buffer.getvalue()).decode("utf-8")


def is_process_running(pid: int) -> bool:
    """Check if process with given PID is still running on Windows."""
    try:
        cmd = f'tasklist /FI "PID eq {pid}"'
        output = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.DEVNULL)
        return str(pid) in output
    except Exception:
        return False


def run_agent_loop() -> None:
    """Background agent loop: polls server heartbeat and captures on demand only."""
    with open(PID_FILE, "w", encoding="utf-8") as f:
        f.write(str(os.getpid()))

    logging.info(f"WINSTON Desktop Agent started silently. PID: {os.getpid()}")
    config = load_config()
    server_url = config.get("server_url", "http://localhost:3000").rstrip("/")
    token = config.get("pairing_token", "winston-kongad-2027")
    heartbeat_interval = int(config.get("heartbeat_interval", 3))
    capture_quality = int(config.get("capture_quality", 70))
    default_monitor = config.get("default_monitor", "laptop")

    session = requests.Session()

    try:
        while True:
            # Check for STOP file signal
            if STOP_FILE.exists():
                logging.info("STOP file detected. Shutting down gracefully.")
                try:
                    STOP_FILE.unlink()
                except Exception:
                    pass
                break

            try:
                heartbeat_url = f"{server_url}/api/pc/heartbeat"
                monitors_summary = get_monitors_summary()
                payload = {
                    "token": token,
                    "monitors": monitors_summary,
                }
                response = session.post(heartbeat_url, json=payload, timeout=5)

                if response.status_code == 200:
                    data = response.json()
                    # Operational control is held by Winston mobile app:
                    # ONLY capture when explicit trigger arrives
                    if data.get("capture_requested", False):
                        target_mon = data.get("target_monitor") or default_monitor
                        logging.info(f"Explicit capture trigger received from Winston app. Capturing display '{target_mon}'...")
                        b64_image = capture_screen(target_monitor=target_mon, quality=capture_quality)
                        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

                        upload_url = f"{server_url}/api/pc/upload"
                        upload_payload = {
                            "token": token,
                            "image": b64_image,
                            "timestamp": now_iso,
                        }
                        session.post(upload_url, json=upload_payload, timeout=15)
                        logging.info(f"Screen buffer for '{target_mon}' uploaded successfully to Winston.")

            except Exception as err:
                logging.debug(f"Connection heartbeat error: {err}")

            time.sleep(heartbeat_interval)

    finally:
        if PID_FILE.exists():
            try:
                PID_FILE.unlink()
            except Exception:
                pass
        logging.info("WINSTON Desktop Agent terminated.")
        sys.exit(0)


def start_silent_agent() -> None:
    """Launch the agent silently in the background with zero visible UI."""
    if STOP_FILE.exists():
        try:
            STOP_FILE.unlink()
        except Exception:
            pass

    # Check if already running
    if PID_FILE.exists():
        try:
            with open(PID_FILE, "r", encoding="utf-8") as f:
                pid = int(f.read().strip())
            if is_process_running(pid):
                print(f"[WINSTON] Agent is already running silently (PID: {pid}).")
                check_status()
                return
        except Exception:
            pass

    py_dir = Path(sys.executable).parent
    pythonw = py_dir / "pythonw.exe"
    exe_to_use = str(pythonw) if pythonw.exists() else sys.executable

    agent_script = str(Path(__file__).resolve())
    flags = 0
    if sys.platform == "win32":
        flags = subprocess.CREATE_NO_WINDOW | getattr(subprocess, "DETACHED_PROCESS", 0x00000008)

    proc = subprocess.Popen(
        cmd,
        cwd=str(BASE_DIR),
        creationflags=flags,
    )

    with open(PID_FILE, "w", encoding="utf-8") as f:
        f.write(str(proc.pid))

    print("=====================================================")
    print("      WINSTON DESKTOP AGENT (SILENT RELAY)")
    print("=====================================================")
    print(f"[*] Agent started in background (PID: {proc.pid})")
    print("[*] Visual footprint: ZERO (No windows, no popups)")
    print("[*] Mode: Standby - Winston holds full operational control.")
    print("-----------------------------------------------------")

    # Wait 2 seconds for first heartbeat to register with server
    time.sleep(2.5)
    check_status()


def stop_agent() -> None:
    """Stop the background silent agent."""
    with open(STOP_FILE, "w", encoding="utf-8") as f:
        f.write("STOP")

    if PID_FILE.exists():
        try:
            with open(PID_FILE, "r", encoding="utf-8") as f:
                pid = int(f.read().strip())
            subprocess.run(
                f"taskkill /F /PID {pid}",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except Exception:
            pass

    subprocess.run(
        'taskkill /F /IM pythonw.exe /FI "WINDOWTITLE eq "',
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    if PID_FILE.exists():
        try:
            PID_FILE.unlink()
        except Exception:
            pass

    print("[WINSTON] Desktop agent stopped successfully.")


def check_status() -> None:
    """Check agent and server connection status."""
    cfg = load_config()
    server_url = cfg.get("server_url", "http://localhost:3000").rstrip("/")

    local_running = False
    pid_str = "Active"
    if PID_FILE.exists():
        try:
            with open(PID_FILE, "r", encoding="utf-8") as f:
                pid = int(f.read().strip())
                if is_process_running(pid):
                    local_running = True
                    pid_str = str(pid)
        except Exception:
            pass

    server_online = False
    try:
        r = requests.get(f"{server_url}/api/pc/heartbeat", timeout=3)
        if r.status_code == 200:
            server_online = r.json().get("online", False)
    except Exception:
        pass

    monitors = get_monitors_summary()
    mon_str = ", ".join([f"{m['name']} ({m['id']})" for m in monitors])

    if server_online:
        print(f"[STATUS] ONLINE & LINKED (PID: {pid_str})")
        print(f"[DISPLAYS] {mon_str}")
        print(f"[SERVER] Connected to {server_url}")
        print("[MOBILE] Winston app currently displays: Desktop Linked")
    elif local_running:
        print(f"[STATUS] RUNNING LOCALLY (PID: {pid_str}) - Connecting to {server_url}...")
        print(f"[DISPLAYS] {mon_str}")
    else:
        print("[STATUS] OFFLINE (Agent is not running)")
        print(f"[DISPLAYS] {mon_str}")
        print("[MOBILE] Winston app currently displays: Offline")


def main() -> None:
    parser = argparse.ArgumentParser(description="WINSTON Silent Desktop Screen Agent")
    parser.add_argument(
        "action",
        nargs="?",
        default="start",
        choices=["start", "stop", "status", "run", "config"],
        help="Action to perform",
    )
    parser.add_argument(
        "value",
        nargs="?",
        default="",
        help="Optional value (e.g. server URL for config)",
    )
    args = parser.parse_args()

    if args.action == "start":
        start_silent_agent()
    elif args.action == "stop":
        stop_agent()
    elif args.action == "status":
        check_status()
    elif args.action == "run":
        run_agent_loop()
    elif args.action == "config":
        if args.value:
            cfg = load_config()
            cfg["server_url"] = args.value.rstrip("/")
            save_config(cfg)
            print(f"[WINSTON] Server URL set to: {cfg['server_url']}")
        else:
            cfg = load_config()
            print(f"[WINSTON] Current Server URL: {cfg['server_url']}")


if __name__ == "__main__":
    main()
