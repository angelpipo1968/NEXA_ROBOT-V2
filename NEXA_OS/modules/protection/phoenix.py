import os
import hashlib
import time
import shutil

class PhoenixProtocol:
    def __init__(self):
        self.monitored_paths = ["src", "NEXA_OS"]
        self.vault_path = "NEXA_ECHO_VAULT"
        
    def get_hash(self, filepath):
        hasher = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hasher.update(chunk)
        return hasher.hexdigest()

    def start(self):
        print("[PHOENIX] Integrity Protocol Active.")
        while True:
            # Simulated integrity check
            time.sleep(60)
            # print("[PHOENIX] Scanning systems...")
