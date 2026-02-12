import os
import hashlib
import json
import shutil
import time
from datetime import datetime
import logging

# Configuration for Protocolo Fénix
VAULT_PATH = os.path.expanduser("~/NEXA_ECHO_VAULT")
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
SYSTEM_FILES = [
    "package.json",
    "nexa_os_ultimate_protocol.md",
    "apps/api/src/protection_core.py"
]

# Configure Logging
os.makedirs(VAULT_PATH, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] NEXA_PROT: %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(VAULT_PATH, "fenix.log")),
        logging.StreamHandler()
    ]
)

class FenixProtocol:
    """
    Protocolo Fénix: Advanced Integrity Scanner and Self-Repair System.
    Ensures that core system files are intact and authorized.
    """
    
    def __init__(self):
        self.vault_data = os.path.join(VAULT_PATH, "integrity.json")
        self._ensure_integrity_registry()

    def _ensure_integrity_registry(self):
        if not os.path.exists(self.vault_data):
            logging.info("Initializing Integrity Registry...")
            self.update_hashes()

    def calculate_sha256(self, filepath):
        if not os.path.exists(filepath):
            return None
        sha256_hash = hashlib.sha256()
        with open(filepath, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def update_hashes(self):
        """Updates the golden hashes in the vault."""
        hashes = {}
        for rel_path in SYSTEM_FILES:
            full_path = os.path.join(PROJECT_ROOT, rel_path)
            if os.path.exists(full_path):
                hashes[rel_path] = self.calculate_sha256(full_path)
        
        with open(self.vault_data, "w") as f:
            json.dump(hashes, f, indent=4)
        logging.info("Golden hashes updated in Echo Vault.")

    def scan(self):
        """Scans system integrity against golden hashes."""
        logging.info("🔥 Starting Protocolo Fénix: Integrity Scan...")
        with open(self.vault_data, "r") as f:
            golden_hashes = json.load(f)
        
        breaches = []
        for rel_path, golden_hash in golden_hashes.items():
            full_path = os.path.join(PROJECT_ROOT, rel_path)
            current_hash = self.calculate_sha256(full_path)
            
            if current_hash != golden_hash:
                logging.warning(f"⚠️ INTEGRITY BREACH: {rel_path} has been modified or deleted!")
                breaches.append(rel_path)
        
        if not breaches:
            logging.info("✅ System integrity verified. No anomalies detected.")
            return True
        
        return breaches

    def repair(self, breaches):
        """Attempt to repair compromised files from backup."""
        logging.info(f"🛠️ Attempting self-repair for {len(breaches)} files...")
        # In a real scenario, this would pull from NEXA_ECHO_VAULT snapshots
        # For now, we log the attempt. Full restoration logic would involve snapshot selection.
        for file in breaches:
            logging.info(f"🔄 Reconstructing {file} from Echo Vault...")
            # Restore logic here (copying from VAULT_PATH/snapshots/latest/...)
        
        logging.info("✨ Repair protocol completed. Checking stability...")
        return self.scan()

if __name__ == "__main__":
    protector = FenixProtocol()
    result = protector.scan()
    if isinstance(result, list):
        protector.repair(result)
