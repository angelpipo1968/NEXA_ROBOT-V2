import os
import requests
import webbrowser
import base64
from pathlib import Path

class VisionModule:
    def __init__(self):
        self.api_key = os.getenv("STABILITY_API_KEY", "TU_API_KEY") # Placeholder or env
        self.output_dir = Path("NEXA_OS/data/vision_cache")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_and_view(self, prompt, use_stability=False):
        """
        Generates an image and opens it in the system viewer.
        """
        if use_stability and self.api_key != "TU_API_KEY":
            return self._generate_stability(prompt)
        else:
            return self._view_pollinations(prompt)

    def _view_pollinations(self, prompt):
        encoded_prompt = prompt.replace(" ", "%20")
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&model=flux"
        print(f"[Vision] Launching Pollinations Feed: {url}")
        webbrowser.open(url)
        return url

    def _generate_stability(self, prompt):
        print(f"[Vision] Engaging Stability AI Engine...")
        url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        body = {
            "text_prompts": [{"text": prompt}],
            "cfg_scale": 7,
            "height": 1024,
            "width": 1024,
            "samples": 1,
            "steps": 30
        }

        response = requests.post(url, headers=headers, json=body)
        
        if response.status_code != 200:
            print(f"[Vision] ❌ Stability API Error: {response.text}")
            return None

        data = response.json()
        for i, image in enumerate(data["artifacts"]):
            file_path = self.output_dir / f"v_gen_{i}.png"
            with open(file_path, "wb") as f:
                f.write(base64.b64decode(image["base64"]))
            
            print(f"[Vision] Image saved to: {file_path}")
            webbrowser.open(f"file://{file_path.absolute()}")
            return str(file_path)

if __name__ == "__main__":
    vision = VisionModule()
    vision.generate_and_view("Cyberpunk city in neo-tokyo, raining, neon lights")
