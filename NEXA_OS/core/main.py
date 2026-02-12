import threading
import time
import sys
import os

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from modules.protection.phoenix import PhoenixProtocol
from modules.voice.speech_es import NexaVoice
from modules.avatar.renderer import AvatarRenderer
from modules.image_gen.nexa_vision import NEXAVision

class NexaOS:
    def __init__(self):
        print("--- NEXA OS CYBERPUNK CORE INITIALIZING ---")
        self.protection = PhoenixProtocol()
        self.voice = NexaVoice()
        self.avatar = AvatarRenderer()
        self.vision = NEXAVision(vault_path="./NEXA_ECHO_VAULT")

    def _process_command(self, cmd):
        """
        Processes system commands for NEXA OS.
        """
        # Cleanup: removes "nexa," "nexa:" prefixes and common filler words
        cmd_clean = cmd.lower().replace("nexa", "").replace(",", "").replace(":", "").strip()
        if not cmd_clean:
            return

        # Keywords for vision
        vision_keywords = ["vision", "imagen", "generar", "crear", "dibuja", "muestra"]
        
        target_keyword = next((k for k in vision_keywords if k in cmd_clean), None)
        
        if target_keyword:
            prompt = cmd_clean.replace(target_keyword, "").strip()
            if not prompt:
                prompt = "cyberpunk avatar neon"
            print(f"[Core] 👁  Nexa Vision Engaged: {prompt}")
            self.vision.quick_generate(prompt)
        elif any(k in cmd_clean for k in ["exit", "salir", "shutdown", "apagar"]):
            print("\n--- SHUTTING DOWN ---")
            sys.exit(0)
        else:
            print(f"[Core] Listening... command not recognized: {cmd_clean}")

    def boot(self):
        # Start modules in threads
        threads = [
            threading.Thread(target=self.protection.start, daemon=True),
            threading.Thread(target=self.voice.init_engine, daemon=True),
            threading.Thread(target=self.avatar.animate, daemon=True)
        ]

        for t in threads:
            t.start()
            
        print("--- SYSTEMS ONLINE ---")
        
        # Initial Demo Call
        self.avatar.display_mars_city()
        self.voice.speak("Sistemas cargados. Visión marciana activada.")
        
        print("\n👁  NEXA OS INTERACTIVE SHELL")
        print("💡 Comandos: 'vision [prompt]', 'imagen [prompt]', 'salir'")
        
        try:
            while True:
                cmd = input("\nNEXA> ")
                self._process_command(cmd)
        except KeyboardInterrupt:
            print("\n--- SHUTTING DOWN ---")

def main():
    os_inst = NexaOS()
    os_inst.boot()

if __name__ == "__main__":
    main()
