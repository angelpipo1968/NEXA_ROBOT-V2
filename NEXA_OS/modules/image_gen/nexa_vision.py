#!/usr/bin/env python3
# NEXA_VISION v1.0 - Generador de imágenes integrado (cyberpunk UI)
# ✅ Sin API key | ✅ Muestra en-app | ✅ Guarda en Bóveda de Ecos | ✅ Un solo archivo

import os, sys, time, threading, base64, json, random
from pathlib import Path
from urllib.parse import quote

# === DEPENDENCIAS LIGERAS (instalar solo requests si no existe) ===
try:
    import requests
except ImportError:
    print("⚠️  Instalando requests...")
    os.system(f"{sys.executable} -m pip install requests -q")
    import requests

# === TKINTER (viene con Python - interfaz nativa sin navegador) ===
try:
    import tkinter as tk
    from tkinter import ttk
    from PIL import Image, ImageTk, ImageEnhance
except ImportError:
    print("⚠️  Instalando Pillow...")
    os.system(f"{sys.executable} -m pip install pillow -q")
    from PIL import Image, ImageTk, ImageEnhance
    import tkinter as tk
    from tkinter import ttk

class NEXAVision:
    """Generador de imágenes integrado - estilo cyberpunk"""
    
    def __init__(self, vault_path="./vault/NEXA_ECHO_VAULT"):
        # Fix path for absolute or relative use
        if vault_path.startswith("./"):
            # If relative to app, we might want to make it absolute based on where main.py runs
            self.vault = Path(os.getcwd()) / vault_path[2:] / "images"
        else:
            self.vault = Path(vault_path) / "images"
            
        self.vault.mkdir(parents=True, exist_ok=True)
        self.log_path = self.vault / "vision_log.json"
        self._init_log()
        self.generating = False
        self.last_image = None
    
    def _init_log(self):
        if not self.log_path.exists():
            with open(self.log_path, "w") as f:
                json.dump([], f)
    
    def _log(self, data):
        log = json.load(open(self.log_path)) if self.log_path.exists() else []
        log.append(data)
        with open(self.log_path, "w") as f:
            json.dump(log, f, indent=2)
    
    def generate(self, prompt: str, width=1024, height=576, seed=None, negative="ugly, blurry") -> dict:
        """Genera imagen vía Pollinations.ai (100% gratis, sin API key)"""
        if self.generating:
            return {"success": False, "error": "Generación en curso"}
        
        self.generating = True
        seed = seed or int(time.time())
        url = (
            f"https://image.pollinations.ai/prompt/{quote(prompt)}?"
            f"width={width}&height={height}&seed={seed}&"
            f"negativePrompt={quote(negative)}&nologo=true"
        )
        
        try:
            print(f"🚀 NEXA_VISION: Generando '{prompt[:40]}...' ({width}x{height})")
            r = requests.get(url, timeout=20)
            r.raise_for_status()
            
            path = self.vault / f"nexa_vision_{int(time.time())}.jpg"
            with open(path, "wb") as f:
                f.write(r.content)
            
            meta = {
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "prompt": prompt,
                "path": str(path),
                "width": width,
                "height": height,
                "seed": seed,
                "size_kb": round(len(r.content) / 1024, 1)
            }
            self._log(meta)
            self.last_image = path
            self.generating = False
            print(f"✅ Imagen guardada: {path.name} ({meta['size_kb']} KB)")
            return {"success": True, "path": str(path), "metadata": meta}
        
        except Exception as e:
            self.generating = False
            print(f"❌ Error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def generate_async(self, prompt: str, callback=None, **kwargs):
        """Generación en background sin bloquear la UI"""
        def worker():
            result = self.generate(prompt, **kwargs)
            if callback:
                callback(result)
        threading.Thread(target=worker, daemon=True).start()
    
    def show_in_app(self, image_path: str, title="NEXA VISION"):
        """Muestra imagen DIRECTAMENTE en ventana tkinter (sin navegador)"""
        try:
            root = tk.Tk()
            root.title(title)
            root.geometry("1050x700")
            root.configure(bg="#0a0a12")
            
            # Estilo cyberpunk
            style = ttk.Style()
            style.theme_use("clam")
            style.configure("TFrame", background="#0a0a12")
            style.configure("TLabel", background="#0a0a12", foreground="#00f3ff", font=("Consolas", 10))
            style.configure("Header.TLabel", foreground="#ff00f7", font=("Consolas", 14, "bold"))
            style.configure("Status.TLabel", foreground="#00ff6a", font=("Consolas", 9))
            
            # Frame principal
            main = ttk.Frame(root, padding=10)
            main.pack(fill=tk.BOTH, expand=True)
            
            # Título cyberpunk
            ttk.Label(main, text="👁 NEXA VISION", style="Header.TLabel").pack(pady=(0, 10))
            
            # Canvas para imagen con efecto glow
            canvas = tk.Canvas(main, bg="#0f0f1a", highlightthickness=0, relief="ridge", bd=2, width=1024, height=576)
            canvas.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
            
            # Wait for canvas to be ready to center image correctly
            root.update()
            
            # Cargar y mostrar imagen
            img = Image.open(image_path)
            # Center and fit
            cw, ch = 1024, 576
            img.thumbnail((cw, ch), Image.LANCZOS)
            
            # Efecto cyberpunk: brillo cyan
            enhancer = ImageEnhance.Brightness(img)
            img_glow = enhancer.enhance(1.1)
            photo = ImageTk.PhotoImage(img_glow)
            
            canvas.create_image(cw//2, ch//2, 
                              image=photo, anchor=tk.CENTER, tags="img")
            canvas.img = photo  # mantener referencia
            
            # Metadatos
            meta_frame = ttk.Frame(main)
            meta_frame.pack(fill=tk.X)
            ttk.Label(meta_frame, text=f"📁 {Path(image_path).name}", style="TLabel").pack(anchor=tk.W)
            ttk.Label(meta_frame, text=f"💾 {os.path.getsize(image_path)//1024} KB", style="Status.TLabel").pack(anchor=tk.W)
            
            # Botones de acción
            btn_frame = ttk.Frame(main)
            btn_frame.pack(fill=tk.X, pady=(10, 0))
            
            ttk.Button(btn_frame, text="GUARDAR COPIA", 
                      command=lambda: self._save_copy(image_path),
                      style="TButton").pack(side=tk.LEFT, padx=5)
            ttk.Button(btn_frame, text="CERRAR", 
                      command=root.destroy,
                      style="TButton").pack(side=tk.RIGHT, padx=5)
            
            # Efecto partículas sutiles (cyberpunk)
            self._add_particles(canvas)
            
            root.mainloop()
            
        except Exception as e:
            print(f"❌ Error mostrando imagen: {e}")
    
    def _add_particles(self, canvas):
        """Partículas flotantes estilo cyberpunk (opcional)"""
        particles = []
        for _ in range(15):
            x, y = random.randint(0, 1024), random.randint(0, 576)
            size = random.randint(1, 3)
            speed = random.uniform(0.2, 0.8)
            color = random.choice(["#00f3ff", "#ff00f7", "#00ff6a"])
            p = canvas.create_oval(x, y, x+size, y+size, fill=color, outline="")
            particles.append((p, x, y, speed))
        
        def animate():
            for i, (pid, x, y, spd) in enumerate(particles):
                y -= spd
                if y < 0: y = 576
                canvas.coords(pid, x, y, x+2, y+2)
                # Update list logic
                particles[i] = (pid, x, y, spd)
            canvas.after(30, animate)
        
        animate()
    
    def _save_copy(self, src):
        dest = self.vault / f"saved_{Path(src).name}"
        # Use shutil if moving across devices, but rename is fine locally
        import shutil
        shutil.copy2(src, dest)
        print(f"✅ Copia guardada en Vision Vault: {dest.name}")

    def quick_generate(self, prompt: str):
        """Flujo completo: generar + mostrar en app"""
        print(f"\n⚡ NEXA_VISION iniciando...\nPrompt: {prompt}\n")
        result = self.generate(prompt)
        if result["success"]:
            self.show_in_app(result["path"], title=f"NEXA VISION | {prompt[:30]}...")
            return result
        return result

# === EJECUCIÓN STANDALONE (prueba directa) ===
if __name__ == "__main__":
    # Modo CLI interactivo
    print("="*60)
    print("  👁  NEXA_VISION v1.0 - Generador Integrado")
    print("  ✅ Sin API key | ✅ En-app display | ✅ Bóveda de Ecos")
    print("="*60)
    
    # Use standard vault path
    vision = NEXAVision(vault_path="./NEXA_ECHO_VAULT")
    
    if len(sys.argv) > 1:
        # Modo: python nexa_vision.py "prompt aquí"
        prompt = " ".join(sys.argv[1:])
    else:
        # Prompt predeterminado cyberpunk
        prompt = "cinematic futuristic Mars city sunset, bio-domes, crimson sky, neon lights, photorealistic 8K"
        print(f"\n💡 Prompt predeterminado:\n   {prompt}\n")
        use_custom = input("¿Usar prompt personalizado? (s/n): ").strip().lower()
        if use_custom == "s":
            prompt = input("✏️  Prompt: ").strip()
    
    # Generar y mostrar
    vision.quick_generate(prompt)
