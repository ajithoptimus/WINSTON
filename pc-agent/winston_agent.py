from __future__ import annotations

import base64
import datetime
import io
import json
import logging
import os
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


def capture_primary_screen(quality: int = 70) -> str:
    """Capture the primary monitor and return a base64-encoded JPEG."""
    with mss.mss() as sct:
        # monitor 1 is primary monitor
        monitor = sct.monitors[1] if len(sct.monitors) > 1 else sct.monitors[0]
        sct_img = sct.grab(monitor)

        # Convert to PIL Image (mss is BGRA)
        img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")

        # Compress to JPEG in memory
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=quality, optimize=True)
        img_bytes = buffer.getvalue()

        return base64.b64encode(img_bytes).decode("utf-8")


def main() -> None:
    logging.info("WINSTON Desktop Agent starting up...")
    config = load_config()
    server_url = config.get("server_url", "http://localhost:3000").rstrip("/")
    token = config.get("pairing_token", "winston-kongad-2027")
    heartbeat_interval = int(config.get("heartbeat_interval", 3))
    capture_quality = int(config.get("capture_quality", 70))

    session = requests.Session()
    backoff = 1

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
            payload = {"token": token}
            response = session.post(heartbeat_url, json=payload, timeout=5)

            if response.status_code == 200:
                backoff = 1
                data = response.json()
                if data.get("capture_requested", False):
                    logging.info("Capture requested by mobile operator. Snapping screen...")
                    b64_image = capture_primary_screen(quality=capture_quality)
                    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

                    upload_url = f"{server_url}/api/pc/upload"
                    upload_payload = {
                        "token": token,
                        "image": b64_image,
                        "timestamp": now_iso,
                    }
                    upload_res = session.post(upload_url, json=upload_payload, timeout=15)
                    if upload_res.status_code == 200:
                        logging.info("Screenshot uploaded successfully.")
                    else:
                        logging.warning(f"Upload returned status {upload_res.status_code}")
            else:
                logging.warning(f"Heartbeat responded with status code: {response.status_code}")
                backoff = min(backoff * 1.5, 30)

        except requests.exceptions.RequestException as req_err:
            logging.debug(f"Connection error to {server_url}: {req_err}")
            backoff = min(backoff * 1.5, 30)
        except Exception as err:
            logging.error(f"Unexpected error in agent loop: {err}")
            backoff = min(backoff * 1.5, 30)

        time.sleep(heartbeat_interval)

    logging.info("WINSTON Desktop Agent terminated.")
    sys.exit(0)


if __name__ == "__main__":
    main()
