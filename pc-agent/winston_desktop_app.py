"""
WINSTON Desktop Agent Application
A standalone Windows desktop app for WINSTON AI screen inspection and live telemetry.
"""
from __future__ import annotations

import base64
import datetime
import io
import json
import os
import sys
import threading
import time
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox

import mss
from PIL import Image, ImageTk
import requests

BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "config.json"
STOP_FILE = BASE_DIR / "STOP"
LOG_FILE = BASE_DIR / "winston_agent.log"


def load_config() -> dict:
    defaults = {
        "server_url": "http://localhost:3000",
        "pairing_token": "winston-kongad-2027",
        "heartbeat_interval": 3,
        "capture_quality": 70,
    }
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                defaults.update(data)
        except Exception:
            pass
    return defaults


def save_config(cfg: dict) -> None:
    try:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
    except Exception:
        pass


def capture_primary_screen(quality: int = 70) -> str:
    with mss.mss() as sct:
        monitor = sct.monitors[1] if len(sct.monitors) > 1 else sct.monitors[0]
        sct_img = sct.grab(monitor)
        img = Image.frombytes("RGB", sct_img.size, sct_img.bgra, "raw", "BGRX")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        return base64.b64encode(buf.getvalue()).decode("utf-8")


class WinstonDesktopApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("WINSTON Desktop Agent • Edmond Kirsch Protocol")
        self.root.geometry("560x640")
        self.root.minsize(500, 560)
        self.root.configure(bg="#0c0d12")

        self.config = load_config()
        self.is_running = False
        self.agent_thread: threading.Thread | None = None
        self.heartbeat_count = 0
        self.capture_count = 0
        self.last_status = "offline"

        self._build_ui()
        self._start_agent()

    def _build_ui(self):
        # Header frame
        hdr = tk.Frame(self.root, bg="#11131c", padx=16, pady=14)
        hdr.pack(fill="x", side="top")

        w_badge = tk.Label(
            hdr,
            text="W",
            font=("Consolas", 18, "bold"),
            fg="#e38b6c",
            bg="#181a26",
            width=2,
            height=1,
            relief="solid",
            bd=1,
        )
        w_badge.pack(side="left", padx=(0, 12))

        title_frame = tk.Frame(hdr, bg="#11131c")
        title_frame.pack(side="left")

        title_lbl = tk.Label(
            title_frame,
            text="WINSTON DESKTOP AGENT",
            font=("Consolas", 12, "bold"),
            fg="#ffffff",
            bg="#11131c",
        )
        title_lbl.pack(anchor="w")

        sub_lbl = tk.Label(
            title_frame,
            text="Silent Screen Inspection & Telemetry Relay",
            font=("Arial", 9),
            fg="#9ca3af",
            bg="#11131c",
        )
        sub_lbl.pack(anchor="w")

        # Status Banner
        self.status_frame = tk.Frame(self.root, bg="#181a24", padx=16, pady=12)
        self.status_frame.pack(fill="x", padx=16, pady=(12, 6))

        self.status_dot = tk.Label(
            self.status_frame,
            text="●",
            font=("Arial", 16, "bold"),
            fg="#f43f5e",
            bg="#181a24",
        )
        self.status_dot.pack(side="left", padx=(0, 8))

        self.status_text = tk.Label(
            self.status_frame,
            text="AGENT OFFLINE",
            font=("Consolas", 11, "bold"),
            fg="#f43f5e",
            bg="#181a24",
        )
        self.status_text.pack(side="left")

        self.telemetry_lbl = tk.Label(
            self.status_frame,
            text="Heartbeats: 0 | Captures: 0",
            font=("Consolas", 9),
            fg="#6b7280",
            bg="#181a24",
        )
        self.telemetry_lbl.pack(side="right")

        # Config Card
        cfg_frame = tk.LabelFrame(
            self.root,
            text=" Connection Settings ",
            font=("Consolas", 9, "bold"),
            fg="#e38b6c",
            bg="#11131c",
            padx=12,
            pady=10,
        )
        cfg_frame.pack(fill="x", padx=16, pady=6)

        # Server URL row
        tk.Label(
            cfg_frame, text="Server URL:", font=("Consolas", 9), fg="#9ca3af", bg="#11131c"
        ).grid(row=0, column=0, sticky="w", pady=4)
        self.server_entry = tk.Entry(
            cfg_frame,
            font=("Consolas", 9),
            bg="#080808",
            fg="#ffffff",
            insertbackground="#e38b6c",
            relief="solid",
            bd=1,
        )
        self.server_entry.insert(0, self.config.get("server_url", "http://localhost:3000"))
        self.server_entry.grid(row=0, column=1, sticky="ew", padx=(8, 8), pady=4)

        # Pairing Token row
        tk.Label(
            cfg_frame, text="Pairing Token:", font=("Consolas", 9), fg="#9ca3af", bg="#11131c"
        ).grid(row=1, column=0, sticky="w", pady=4)
        self.token_entry = tk.Entry(
            cfg_frame,
            font=("Consolas", 9),
            bg="#080808",
            fg="#ffffff",
            insertbackground="#e38b6c",
            relief="solid",
            bd=1,
        )
        self.token_entry.insert(0, self.config.get("pairing_token", "winston-kongad-2027"))
        self.token_entry.grid(row=1, column=1, sticky="ew", padx=(8, 8), pady=4)

        cfg_frame.columnconfigure(1, weight=1)

        save_btn = tk.Button(
            cfg_frame,
            text="Save Settings",
            command=self._save_settings,
            font=("Consolas", 9, "bold"),
            bg="#1f2438",
            fg="#e38b6c",
            activebackground="#2b324d",
            activeforeground="#ffffff",
            relief="flat",
            padx=8,
            pady=2,
            cursor="hand2",
        )
        save_btn.grid(row=2, column=1, sticky="e", pady=(4, 0))

        # Controls Buttons
        btn_frame = tk.Frame(self.root, bg="#0c0d12")
        btn_frame.pack(fill="x", padx=16, pady=8)

        self.start_btn = tk.Button(
            btn_frame,
            text="▶ Start Agent",
            command=self._start_agent,
            font=("Consolas", 10, "bold"),
            bg="#10b981",
            fg="#ffffff",
            activebackground="#059669",
            activeforeground="#ffffff",
            relief="flat",
            padx=12,
            pady=6,
            cursor="hand2",
        )
        self.start_btn.pack(side="left", padx=(0, 6), expand=True, fill="x")

        self.stop_btn = tk.Button(
            btn_frame,
            text="⏹ Stop Agent",
            command=self._stop_agent,
            font=("Consolas", 10, "bold"),
            bg="#374151",
            fg="#9ca3af",
            activebackground="#4b5563",
            activeforeground="#ffffff",
            relief="flat",
            padx=12,
            pady=6,
            cursor="hand2",
        )
        self.stop_btn.pack(side="left", padx=6, expand=True, fill="x")

        test_btn = tk.Button(
            btn_frame,
            text="📸 Test Capture",
            command=self._test_capture,
            font=("Consolas", 10, "bold"),
            bg="#3b82f6",
            fg="#ffffff",
            activebackground="#2563eb",
            activeforeground="#ffffff",
            relief="flat",
            padx=12,
            pady=6,
            cursor="hand2",
        )
        test_btn.pack(side="left", padx=6, expand=True, fill="x")

        # Live Activity Console
        log_frame = tk.LabelFrame(
            self.root,
            text=" Live Activity Stream ",
            font=("Consolas", 9, "bold"),
            fg="#9ca3af",
            bg="#11131c",
            padx=8,
            pady=8,
        )
        log_frame.pack(fill="both", expand=True, padx=16, pady=(4, 12))

        self.log_text = tk.Text(
            log_frame,
            font=("Consolas", 8),
            bg="#07080c",
            fg="#10b981",
            insertbackground="#ffffff",
            wrap="word",
            relief="flat",
        )
        self.log_text.pack(fill="both", expand=True)

        self._log("WINSTON Desktop Agent Initialized.")

    def _log(self, msg: str):
        now_str = datetime.datetime.now().strftime("%H:%M:%S")
        entry = f"[{now_str}] {msg}\n"
        self.log_text.insert("end", entry)
        self.log_text.see("end")

    def _save_settings(self):
        new_url = self.server_entry.get().strip().rstrip("/")
        new_token = self.token_entry.get().strip()
        self.config["server_url"] = new_url
        self.config["pairing_token"] = new_token
        save_config(self.config)
        self._log(f"Configuration saved: URL={new_url}")
        messagebox.showinfo("Saved", "Settings saved successfully.")

    def _start_agent(self):
        if self.is_running:
            return
        if STOP_FILE.exists():
            try:
                STOP_FILE.unlink()
            except Exception:
                pass

        self.is_running = True
        self.start_btn.configure(bg="#374151", fg="#9ca3af", state="disabled")
        self.stop_btn.configure(bg="#f43f5e", fg="#ffffff", state="normal")

        self.agent_thread = threading.Thread(target=self._agent_loop, daemon=True)
        self.agent_thread.start()
        self._log("Agent background polling thread started.")

    def _stop_agent(self):
        self.is_running = False
        self.start_btn.configure(bg="#10b981", fg="#ffffff", state="normal")
        self.stop_btn.configure(bg="#374151", fg="#9ca3af", state="disabled")
        self.status_dot.configure(fg="#f43f5e")
        self.status_text.configure(text="AGENT STOPPED", fg="#f43f5e")
        self._log("Agent stopped.")

    def _test_capture(self):
        try:
            self._log("Testing screen capture buffer...")
            b64_img = capture_primary_screen(quality=50)
            self._log(f"Screen captured successfully ({len(b64_img)} bytes base64).")
            messagebox.showinfo(
                "Capture Test Success",
                f"Screen buffer captured successfully!\nResolution grabbed: Primary Monitor\nBuffer size: {len(b64_img)} bytes",
            )
        except Exception as e:
            self._log(f"Capture test failed: {e}")
            messagebox.showerror("Capture Error", f"Failed to capture screen: {e}")

    def _agent_loop(self):
        session = requests.Session()
        while self.is_running:
            if STOP_FILE.exists():
                break

            url = self.config.get("server_url", "http://localhost:3000").rstrip("/")
            token = self.config.get("pairing_token", "winston-kongad-2027")
            interval = int(self.config.get("heartbeat_interval", 3))

            try:
                hb_res = session.post(
                    f"{url}/api/pc/heartbeat",
                    json={"token": token},
                    timeout=5,
                )
                if hb_res.status_code == 200:
                    self.heartbeat_count += 1
                    data = hb_res.json()

                    self.root.after(0, self._update_status_ui, True)

                    if data.get("capture_requested", False):
                        self.root.after(
                            0, self._log, "⚡ MOBILE TRIGGER DETECTED: Capturing screen buffer..."
                        )
                        b64_img = capture_primary_screen(
                            quality=int(self.config.get("capture_quality", 70))
                        )
                        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
                        up_res = session.post(
                            f"{url}/api/pc/upload",
                            json={"token": token, "image": b64_img, "timestamp": now_iso},
                            timeout=15,
                        )
                        if up_res.status_code == 200:
                            self.capture_count += 1
                            self.root.after(
                                0, self._log, "✔ Screen buffer uploaded to Winston Mobile!"
                            )
                        else:
                            self.root.after(
                                0, self._log, f"Upload error code: {up_res.status_code}"
                            )
                else:
                    self.root.after(0, self._update_status_ui, False)
            except Exception as e:
                self.root.after(0, self._update_status_ui, False)

            time.sleep(interval)

    def _update_status_ui(self, is_online: bool):
        if is_online:
            self.status_dot.configure(fg="#10b981")
            self.status_text.configure(text="DESKTOP LINKED & ACTIVE", fg="#10b981")
        else:
            self.status_dot.configure(fg="#f59e0b")
            self.status_text.configure(text="CONNECTING / STANDBY", fg="#f59e0b")

        self.telemetry_lbl.configure(
            text=f"Heartbeats: {self.heartbeat_count} | Captures: {self.capture_count}"
        )


def main():
    root = tk.Tk()
    app = WinstonDesktopApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
