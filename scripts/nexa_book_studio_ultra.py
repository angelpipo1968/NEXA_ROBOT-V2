#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  NEXA BOOK STUDIO ULTRA v3.0 • ALL-IN-ONE • Cyberpunk Writing Engine       ║
║  ✦ Plantillas ✦ Portadas IA ✦ Búsqueda profunda ✦ Diálogo humano-IA        ║
║  ✦ Escritura automática/manual ✦ Corrección ✦ Exportación PDF/EPUB         ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import time
import random
import re
import base64
import textwrap
from datetime import datetime
from typing import List, Dict, Optional
from io import BytesIO

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ⚙️ DEPENDENCIAS AUTOMÁTICAS (instala si no existen)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
try:
    import requests
except ImportError:
    print("📦 Instalando dependencias básicas...")
    os.system(f"{sys.executable} -m pip install requests -q")
    import requests

try:
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.colors import Color
except ImportError:
    print("📦 Instalando ReportLab para PDF...")
    os.system(f"{sys.executable} -m pip install reportlab -q")
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.units import inch
    from reportlab.lib.colors import Color

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🌌 ESTILO CYBERPUNK (colores ANSI + ASCII art)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class Colors:
    RESET = "\033[0m"
    CYAN = "\033[38;5;51m"
    MAGENTA = "\033[38;5;201m"
    GREEN = "\033[38;5;46m"
    YELLOW = "\033[38;5;226m"
    RED = "\033[38;5;196m"
    PURPLE = "\033[38;5;129m"
    GRAY = "\033[38;5;240m"
    WHITE = "\033[38;5;255m"

def c(text: str, color: str) -> str:
    return f"{color}{text}{Colors.RESET}"

PORTADA_ASCII = r"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  ║
║  ▲                                                                ▲  ║
║  ▲   ██████╗ ██╗  ██╗███████╗██╗  ██╗███████╗██████╗ ███████╗    ▲  ║
║  ▲   ██╔══██╗██║  ██║██╔════╝██║ ██╔╝██╔════╝██╔══██╗██╔════╝    ▲  ║
║  ▲   ██████╔╝███████║█████╗  █████╔╝ █████╗  ██████╔╝█████╗      ▲  ║
║  ▲   ██╔══██╗██╔══██║██╔══╝  ██╔═██╗ ██╔══╝  ██╔══██╗██╔══╝      ▲  ║
║  ▲   ██████╔╝██║  ██║███████╗██║  ██╗███████╗██║  ██║███████╗    ▲  ║
║  ▲   ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝    ▲  ║
║  ▲                                                                ▲  ║
║  ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔍 NEXA SEARCH CORE (5 motores - 2 sin key, 3 con key opcional)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class NexaSearchCore:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': 'NEXA-BOOK/3.0 (Cyberpunk Edition)'})
        self.engines = {
            'duckduckgo': {'url': 'https://api.duckduckgo.com', 'enabled': True, 'key': None},
            'searxng': {
                'instances': [
                    'https://searx.be', 'https://search.unlocked.link',
                    'https://searxng.site', 'https://searx.work', 'https://northboot.xyz'
                ],
                'enabled': True
            },
            'brave': {'url': 'https://api.search.brave.com/res/v1/web/search', 'enabled': False, 'key': None},
            'you': {'url': 'https://api.you.com/search/web', 'enabled': False, 'key': None},
            'google_cse': {'url': 'https://www.googleapis.com/customsearch/v1', 'enabled': False, 'key': None, 'cx': None}
        }
        self.stats = {e: 0 for e in self.engines}
    
    def set_key(self, engine: str, key: str, cx: Optional[str] = None):
        if engine in self.engines:
            self.engines[engine]['key'] = key
            self.engines[engine]['enabled'] = True
            if cx and 'cx' in self.engines[engine]:
                self.engines[engine]['cx'] = cx
    
    def buscar(self, query: str, modo: str = "rapido", max_results: int = 10) -> List[Dict]:
        """modo: 'rapido' (DDG) | 'profundo' (DDG + SearXNG + Brave si disponible)"""
        resultados = []
        query_academica = f"{query} site:.edu OR site:.gov OR author: OR 'journal of'"
        
        # Motor 1: DuckDuckGo (siempre activo)
        try:
            params = {'q': query_academica if modo == "profundo" else query, 'format': 'json', 'no_html': 1}
            r = self.session.get(self.engines['duckduckgo']['url'], params=params, timeout=3)
            data = r.json()
            
            if data.get('AbstractURL'):
                resultados.append({
                    'title': data.get('Heading', query),
                    'url': data['AbstractURL'],
                    'source': 'duckduckgo',
                    'snippet': data.get('AbstractText', '')[:280]
                })
            
            for item in data.get('RelatedTopics', [])[:max_results]:
                if isinstance(item, dict) and 'FirstURL' in item:
                    resultados.append({
                        'title': item.get('Text', query),
                        'url': item['FirstURL'],
                        'source': 'duckduckgo',
                        'snippet': item.get('Text', '')[:280]
                    })
            self.stats['duckduckgo'] += 1
        except: pass
        
        # Motor 2: SearXNG (modo profundo)
        if modo == "profundo" and self.engines['searxng']['enabled']:
            for instance in random.sample(self.engines['searxng']['instances'], min(3, len(self.engines['searxng']['instances']))):
                try:
                    url = f"{instance.rstrip('/')}/search"
                    params = {
                        'q': query_academica,
                        'format': 'json',
                        'language': 'es',
                        'safesearch': 0
                    }
                    r = self.session.get(url, params=params, timeout=5)
                    data = r.json()
                    for item in data.get('results', [])[:3]:
                        resultados.append({
                            'title': item.get('title', 'Sin título'),
                            'url': item.get('url', ''),
                            'source': 'searxng',
                            'snippet': item.get('content', '')[:280]
                        })
                    self.stats['searxng'] += 1
                    break  # Salir al primer éxito
                except: continue
        
        # Motor 3: Brave (si tiene key)
        if modo == "profundo" and self.engines['brave']['enabled'] and self.engines['brave']['key']:
            try:
                headers = {'X-Subscription-Token': self.engines['brave']['key'], 'Accept': 'application/json'}
                params = {'q': query_academica, 'count': 5, 'search_lang': 'es'}
                r = self.session.get(self.engines['brave']['url'], headers=headers, params=params, timeout=4)
                data = r.json()
                for item in data.get('web', {}).get('results', [])[:3]:
                    resultados.append({
                        'title': item.get('title', 'Sin título'),
                        'url': item.get('url', ''),
                        'source': 'brave',
                        'snippet': item.get('description', '')[:280]
                    })
                self.stats['brave'] += 1
            except: pass
        
        # Eliminar duplicados por dominio
        seen_domains = set()
        unicos = []
        for r in resultados:
            try:
                domain = re.search(r'https?://([^/]+)', r['url']).group(1).replace('www.', '')
                if domain not in seen_domains:
                    seen_domains.add(domain)
                    unicos.append(r)
            except: continue
        
        return unicos[:max_results]
    
    def get_stats(self) -> Dict:
        return self.stats

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎨 GENERADOR DE PORTADAS (ASCII art + placeholder para APIs reales)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class CoverGenerator:
    THEMES = {
        "cyberpunk": [
            "neón violeta y cian sobre ciudad futurista",
            "hologramas flotando sobre arquitectura brutalista",
            "lluvia digital reflejando anuncios en kanji"
        ],
        "fantasia": [
            "bosque encantado con runas brillantes",
            "dragón dorado envuelto en nubes místicas",
            "castillo flotante bajo auroras boreales"
        ],
        "romance": [
            "rosas negras bajo luna llena",
            "siluetas abrazadas al atardecer",
            "carta antigua con tinta dorada"
        ],
        "misterio": [
            "callejón oscuro con una única farola",
            "reloj de arena con arena negra",
            "llave antigua sobre mapa desgastado"
        ],
        "ciencia": [
            "galaxia espiral con estación espacial",
            "ADN iluminado flotando en vacío",
            "robot antiguo con flores creciendo de sus grietas"
        ]
    }
    
    @staticmethod
    def generar_ascii(titulo: str, autor: str, tema: str = "cyberpunk") -> str:
        """Genera portada ASCII art estilo cyberpunk"""
        decoradores = ["▲", "✦", "⚡", "◉", "◈"]
        decor = random.choice(decoradores)
        
        # Seleccionar prompt según tema
        prompts = CoverGenerator.THEMES.get(tema.lower(), CoverGenerator.THEMES["cyberpunk"])
        prompt = random.choice(prompts)
        
        # Construir portada ASCII
        ancho = 78
        lines = []
        lines.append(f"╔{'═' * (ancho-2)}╗")
        lines.append(f"║{decor * (ancho-2)}║")
        lines.append(f"║{' ' * (ancho-2)}║")
        
        # Título centrado
        titulo_line = f"  {titulo.upper()}  "
        padding = (ancho - len(titulo_line) - 2) // 2
        lines.append(f"║{' ' * padding}{c(titulo_line, Colors.CYAN)}{' ' * (ancho - padding - len(titulo_line) - 2)}║")
        
        lines.append(f"║{' ' * (ancho-2)}║")
        lines.append(f"║{' ' * (ancho-2)}║")
        
        # Autor centrado
        autor_line = f"por {autor}"
        padding = (ancho - len(autor_line) - 2) // 2
        lines.append(f"║{' ' * padding}{c(autor_line, Colors.MAGENTA)}{' ' * (ancho - padding - len(autor_line) - 2)}║")
        
        lines.append(f"║{' ' * (ancho-2)}║")
        lines.append(f"║{' ' * (ancho-2)}║")
        
        # Prompt de IA centrado (máx 60 chars)
        prompt_short = prompt[:60]
        padding = (ancho - len(prompt_short) - 2) // 2
        lines.append(f"║{' ' * padding}{c(prompt_short, Colors.GRAY)}{' ' * (ancho - padding - len(prompt_short) - 2)}║")
        
        lines.append(f"║{' ' * (ancho-2)}║")
        lines.append(f"║{decor * (ancho-2)}║")
        lines.append(f"╚{'═' * (ancho-2)}╝")
        
        return "\n".join(lines)
    
    @staticmethod
    def generar_real(titulo: str, autor: str, tema: str = "cyberpunk", api_key: Optional[str] = None) -> Optional[str]:
        """
        Genera portada real con Ideogram AI (gratis: 25 imágenes/día)
        Requiere registro en: https://ideogram.ai
        """
        if not api_key:
            return None
        
        try:
            # Prompt optimizado para Ideogram
            prompts = CoverGenerator.THEMES.get(tema.lower(), CoverGenerator.THEMES["cyberpunk"])
            prompt = f"book cover, '{titulo}' by {autor}, {random.choice(prompts)}, editorial design, minimalist, high contrast, 4k"
            
            r = requests.post(
                "https://api.ideogram.ai/generate",
                headers={"Api-Key": api_key, "Content-Type": "application/json"},
                json={"prompt": prompt, "model": "turbo", "aspect_ratio": "portrait"},
                timeout=15
            )
            data = r.json()
            
            if data.get("data") and len(data["data"]) > 0:
                return data["data"][0].get("url")
        except:
            pass
        return None

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📚 PLANTILLAS DE LIBRO (5 tipos + personalización total)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class BookTemplate:
    TEMPLATES = {
        "novela": {
            "estructura": ["Portada", "Dedicatoria", "Prólogo", "Capítulo 1", "Capítulo 2", "Capítulo 3", "Epílogo", "Agradecimientos"],
            "estilo": "narrativa fluida con diálogos vivos, descripciones sensoriales y ritmo cinematográfico",
            "longitud_capitulo": 2500,
            "tema_predeterminado": "cyberpunk"
        },
        "cuento": {
            "estructura": ["Portada", "Cuento"],
            "estilo": "relato breve con giro final impactante, lenguaje poético y atmósfera densa",
            "longitud_capitulo": 1500,
            "tema_predeterminado": "misterio"
        },
        "ensayo": {
            "estructura": ["Portada", "Índice", "Introducción", "Capítulo 1", "Capítulo 2", "Conclusión", "Bibliografía"],
            "estilo": "análisis crítico con citas académicas, argumentación lógica y ejemplos concretos",
            "longitud_capitulo": 3000,
            "tema_predeterminado": "ciencia"
        },
        "poesía": {
            "estructura": ["Portada", "Prólogo", "Colección I", "Colección II", "Epílogo"],
            "estilo": "versos libres con metáforas visuales, ritmo musical y emociones crudas",
            "longitud_capitulo": 800,
            "tema_predeterminado": "romance"
        },
        "biografía": {
            "estructura": ["Portada", "Prólogo", "Infancia", "Juventud", "Madurez", "Legado", "Epílogo"],
            "estilo": "narrativa documental con anécdotas personales, contexto histórico y reflexión íntima",
            "longitud_capitulo": 2000,
            "tema_predeterminado": "ciencia"
        }
    }
    
    def __init__(self, tipo: str = "novela"):
        self.tipo = tipo.lower()
        self.config = self.TEMPLATES.get(self.tipo, self.TEMPLATES["novela"])
        self.metadatos = {
            "titulo": "SIN TÍTULO",
            "autor": "AUTOR DESCONOCIDO",
            "genero": tipo.capitalize(),
            "sinopsis": "Una historia que espera ser contada...",
            "tema_portada": self.config["tema_predeterminado"],
            "fecha_creacion": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "palabras": 0,
            "caracteres": 0
        }
        self.capitulos = {sec: "" for sec in self.config["estructura"]}
        self.historial_versiones = []
    
    def actualizar_metadatos(self, campo: str, valor: str):
        if campo in self.metadatos:
            self.metadatos[campo] = valor
            if campo == "titulo":
                self.metadatos["titulo"] = valor.upper()
    
    def guardar_version(self, capitulo: str):
        """Guarda versión anterior para deshacer"""
        if len(self.historial_versiones) > 10:
            self.historial_versiones.pop(0)
        self.historial_versiones.append({
            "capitulo": capitulo,
            "contenido": self.capitulos[capitulo],
            "timestamp": datetime.now().strftime("%H:%M:%S")
        })
    
    def deshacer(self):
        """Deshace última edición"""
        if self.historial_versiones:
            ultima = self.historial_versiones.pop()
            self.capitulos[ultima["capitulo"]] = ultima["contenido"]
            return f"↩️ Deshecho cambio en '{ultima['capitulo']}' ({ultima['timestamp']})"
        return "❌ No hay cambios para deshacer"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ✍️ ASISTENTE DE ESCRITURA (corrección + expansión + diálogo + ideas)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class WritingAssistant:
    def __init__(self, search_core: NexaSearchCore):
        self.search = search_core
        self.historial_dialogo = []
        self.ortografia = {
            " avar": " haber", " aber": " haber", " aora": " ahora", " egido": " elegido",
            " atraz": " atrás", " abajo": " abajo", " hasi": " así", " abeses": " a veces",
            "  ,": ",", "  .": ".", " .": ".", " ,": ",", "  ": " ", " de el": " del",
            " a el": " al", " mas": " más", " si": " sí", " tu": " tú", " el": " él",
            " se": " sé", " te": " té", " mi": " mí", " como": " cómo", " que": " qué",
            " cuando": " cuándo", " donde": " dónde"
        }
    
    def corregir(self, texto: str) -> str:
        """Corrección ortográfica y gramatical básica"""
        texto = texto.strip()
        for err, corr in self.ortografia.items():
            texto = texto.replace(err, corr)
        
        # Correcciones contextuales
        if texto and texto[-1] not in ".!?":
            texto += "."
        
        return texto
    
    def expandir(self, texto: str, contexto_libro: Dict, estilo: str = "") -> str:
        """Expande texto con detalles sensoriales y emocionales según género"""
        if len(texto.split()) < 10:
            genero = contexto_libro.get("genero", "novela").lower()
            emociones = ["nostalgia", "ira contenida", "esperanza frágil", "miedo ancestral", "éxtasis efímero"]
            sentidos = ["el aire olía a ozono", "el tacto del metal frío", "el sabor a ceniza", "el sonido de pasos lejanos", "la vista nublada por lágrimas"]
            
            if "poesía" in genero:
                expansiones = [
                    f"{texto}. {random.choice(sentidos)}, mientras {random.choice(emociones)} se deslizaba como {random.choice(['seda rota', 'vidrio templado', 'agua en llamas'])}.",
                    f"{texto} — {random.choice(emociones).capitalize()} {random.choice(['tejiendo', 'desgarrando', 'bordando'])} el silencio con hilos de {random.choice(['memoria', 'olvido', 'sueños rotos'])}."
                ]
            elif "ensayo" in genero:
                expansiones = [
                    f"{texto}. Este fenómeno, documentado por {random.choice(['investigadores recientes', 'estudios pioneros', 'análisis contemporáneos'])}, revela implicaciones profundas para {random.choice(['la sociedad', 'la tecnología', 'la ética'])}.",
                    f"{texto}. Como argumenta {random.choice(['Smith (2025)', 'García (2024)', 'la literatura especializada'])}, este patrón sugiere una transformación estructural en {random.choice(['los paradigmas actuales', 'los marcos teóricos', 'las prácticas establecidas'])}."
                ]
            else:
                expansiones = [
                    f"{texto}. {random.choice(['Nadie lo vio venir', 'Todo cambió en un instante', 'El silencio lo dijo todo'])}. {random.choice(sentidos)} y {random.choice(emociones)} se apoderó del momento.",
                    f"{texto}. El tiempo se detuvo. {random.choice(['Las luces parpadearon', 'El viento cesó', 'El mundo contuvo el aliento'])} mientras {random.choice(['el destino', 'el azar', 'la verdad'])} se revelaba sin piedad."
                ]
            return random.choice(expansiones)
        return texto
    
    def sugerir_idea(self, tema: str, tipo: str, contexto_libro: Dict) -> Dict:
        """Genera sugerencias creativas con apoyo de búsqueda"""
        resultados = self.search.buscar(f"{tema} {tipo} escritura creativa inspiración", modo="profundo", max_results=3)
        
        genero = contexto_libro.get("genero", "novela").lower()
        if "poesía" in genero:
            ideas = [
                f"Explora {tema} a través de metáforas inesperadas: ¿qué objeto cotidiano representa {tema}?",
                f"Escribe un poema donde {tema} sea un personaje que habla en segunda persona",
                f"Combina {tema} con un elemento sensorial olvidado: el tacto de la lluvia en metal oxidado, el sabor del silencio"
            ]
        elif "ensayo" in genero:
            ideas = [
                f"Analiza {tema} desde una perspectiva no convencional: ¿qué diría un filósofo del siglo XXIII?",
                f"Conecta {tema} con un evento histórico reciente y extrae lecciones para el futuro",
                f"Desmonta un mito común sobre {tema} usando datos recientes y lógica implacable"
            ]
        else:
            ideas = [
                f"¿Qué pasaría si {tema} tuviera un secreto que nadie conoce? ¿Quién lo descubriría y por qué?",
                f"Explora {tema} desde la perspectiva de alguien que lo odia, lo ama y lo teme simultáneamente",
                f"Combina {tema} con un elemento inesperado: tecnología antigua, emociones sintéticas, memorias prestadas"
            ]
        
        return {
            "tema": tema,
            "sugerencias": ideas,
            "fuentes_inspiracion": [r['title'] for r in resultados[:2]] if resultados else ["Fuentes literarias clásicas", "Experiencia humana universal"]
        }
    
    def dialogar(self, mensaje: str, contexto_libro: Dict) -> str:
        """Diálogo conversacional humano-IA para desarrollar ideas"""
        self.historial_dialogo.append(("humano", mensaje))
        genero = contexto_libro.get("genero", "novela").lower()
        
        # Respuestas contextuales
        if any(pal in mensaje.lower() for pal in ["personaje", "protagonista", "antagonista"]):
            respuestas = [
                f"🎨 Profundiza en contradicciones: un asesino que cuida gatos callejeros, un héroe que odia salvar vidas. La humanidad está en las grietas.",
                f"🎨 ¿Qué trauma define a tu personaje? No el evento, sino cómo lo lleva escondido en gestos pequeños: cómo toma una taza, cómo mira el reloj.",
                f"🎨 Dale un deseo secreto que contradiga su rol: el villano quiere paz, el héroe anhela caos controlado."
            ]
            resp = random.choice(respuestas)
        
        elif any(pal in mensaje.lower() for pal in ["trama", "historia", "argumento", "desarrollo"]):
            respuestas = [
                f"🌀 Cada escena debe cambiar algo: una creencia, una relación, un poder. Si nada cambia, es relleno.",
                f"🌀 Usa el ritmo ternario: calma → tensión → clímax → consecuencia → nueva calma (más frágil).",
                f"🌀 El conflicto no es externo: es el choque entre lo que el personaje quiere y lo que necesita."
            ]
            resp = random.choice(respuestas)
        
        elif any(pal in mensaje.lower() for pal in ["bloqueo", "inspiración", "creatividad", "no sé"]):
            tema = contexto_libro.get('genero', 'creatividad')
            sugerencia = self.sugerir_idea(tema, "escritura", contexto_libro)
            resp = f"⚡ {random.choice(sugerencia['sugerencias'])}\n💡 Inspiración: {', '.join(sugerencia['fuentes_inspiracion'][:2])}"
        
        elif any(pal in mensaje.lower() for pal in ["estilo", "lenguaje", "voz", "tono"]):
            resp = f"✍️ Tu voz es única. No imites. Escribe una frase que solo tú podrías escribir. Ahora expande desde ahí."
        
        else:
            respuestas_genericas = [
                "💭 Escribe 3 versiones de esa frase. Elige la más cruda, la que duela un poco.",
                "💭 Detente. ¿Este párrafo avanza la trama o solo rellena? Si es relleno, ¿qué emoción transmite? Si ninguna, córtalo.",
                "💭 ¿Qué siente tu personaje físicamente en este momento? No emociones: sudor frío, nudo en garganta, pulso en sienes."
            ]
            resp = random.choice(respuestas_genericas)
        
        self.historial_dialogo.append(("ia", resp))
        return resp
    
    def evaluar_calidad(self, texto: str) -> Dict:
        """Evalúa calidad del texto (simulado)"""
        palabras = len(texto.split())
        oraciones = len([s for s in texto.split('.') if len(s.strip()) > 10])
        diversidad = len(set(texto.split())) / max(palabras, 1)
        
        return {
            "palabras": palabras,
            "oraciones": oraciones,
            "diversidad_lexica": round(diversidad * 100, 1),
            "calidad_estimada": "ALTA" if diversidad > 0.6 and oraciones > 3 else "MEDIA" if diversidad > 0.4 else "BAJA",
            "sugerencia": "✅ Bien estructurado" if oraciones > 3 else "💡 Añade más variedad de estructuras" if diversidad < 0.5 else "✅ Buen ritmo"
        }

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📥📤 EXPORTADOR (PDF + EPUB + TXT)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class Exporter:
    @staticmethod
    def exportar_pdf(libro: BookTemplate, portada_url: Optional[str] = None) -> str:
        """Exporta libro a PDF con diseño editorial"""
        filename = f"{libro.metadatos['titulo'].replace(' ', '_')[:30]}.pdf"
        doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        
        # Estilos personalizados cyberpunk
        styles.add(ParagraphStyle(
            name='PortadaTitulo',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=Color(0.2, 0.8, 1.0),  # Cian
            alignment=1,
            spaceAfter=12
        ))
        styles.add(ParagraphStyle(
            name='PortadaAutor',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=Color(0.8, 0.2, 0.8),  # Magenta
            alignment=1,
            spaceAfter=24
        ))
        styles.add(ParagraphStyle(
            name='Capitulo',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=Color(0.2, 0.8, 0.2),  # Verde
            spaceBefore=12,
            spaceAfter=6
        ))
        styles.add(ParagraphStyle(
            name='Cuerpo',
            parent=styles['BodyText'],
            fontSize=11,
            leading=16,
            firstLineIndent=20
        ))
        
        story = []
        
        # Portada
        story.append(Paragraph(libro.metadatos['titulo'], styles['PortadaTitulo']))
        story.append(Spacer(1, 24))
        story.append(Paragraph(f"por {libro.metadatos['autor']}", styles['PortadaAutor']))
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"Género: {libro.metadatos['genero']}", styles['BodyText']))
        story.append(Spacer(1, 36))
        story.append(Paragraph(f"Creado: {libro.metadatos['fecha_creacion']}", styles['BodyText']))
        story.append(Spacer(1, 48))
        story.append(Paragraph("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", styles['BodyText']))
        story.append(Spacer(1, 24))
        
        # Contenido
        for capitulo, contenido in libro.capitulos.items():
            if not contenido.strip():
                continue
            
            story.append(Paragraph(capitulo.upper(), styles['Capitulo']))
            story.append(Spacer(1, 12))
            
            # Procesar párrafos
            parrafos = contenido.split('\n\n')
            for parrafo in parrafos:
                if parrafo.strip():
                    story.append(Paragraph(parrafo.strip(), styles['Cuerpo']))
                    story.append(Spacer(1, 6))
            
            story.append(Spacer(1, 24))
        
        doc.build(story)
        return filename
    
    @staticmethod
    def exportar_txt(libro: BookTemplate) -> str:
        """Exporta a TXT plano con formato editorial"""
        filename = f"{libro.metadatos['titulo'].replace(' ', '_')[:30]}.txt"
        with open(filename, 'w', encoding='utf-8') as f:
            # Portada
            f.write("="*80 + "\n")
            f.write(f"{'TÍTULO: ' + libro.metadatos['titulo'].upper():^80}\n")
            f.write(f"{'por ' + libro.metadatos['autor']:^80}\n")
            f.write(f"{'Género: ' + libro.metadatos['genero']:^80}\n")
            f.write(f"{'Creado: ' + libro.metadatos['fecha_creacion']:^80}\n")
            f.write("="*80 + "\n\n")
            f.write(f"Sinopsis:\n{libro.metadatos['sinopsis']}\n\n")
            f.write("="*80 + "\n\n")
            
            # Contenido
            for capitulo, contenido in libro.capitulos.items():
                if contenido.strip():
                    f.write(f"\n{capitulo.upper()}\n{'─'*80}\n\n")
                    f.write(contenido + "\n")
        
        return filename

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📘 NEXA BOOK STUDIO ULTRA (interfaz principal - TODO EN UNO)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class NexaBookStudioUltra:
    def __init__(self):
        self.search = NexaSearchCore()
        self.assistant = WritingAssistant(self.search)
        self.exporter = Exporter()
        self.cover_gen = CoverGenerator()
        self.libro = None
        self.modo_automatico = False
        self.api_keys = {
            "brave": None,
            "ideogram": None  # Para portadas reales
        }
        self.historial_busquedas = []
    
    def banner(self):
        print(c(PORTADA_ASCII, Colors.CYAN))
        print(c("  ✦ [1] Nuevo libro  [2] Escribir  [3] Investigar  [4] Diálogo IA  [5] Exportar", Colors.GREEN))
        print(c("  ✦ [C] Portada  [M] Modo auto/manual  [U] Configurar APIs  [H] Historial", Colors.YELLOW))
        print(c("  ✦ [Ctrl+C] Salir  [ENTER] Refrescar", Colors.GRAY))
        print(c("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", Colors.PURPLE))
    
    def crear_libro(self):
        print(c("\n🎨 SELECCIONA PLANTILLA:", Colors.YELLOW))
        for i, (tipo, cfg) in enumerate(BookTemplate.TEMPLATES.items(), 1):
            print(f"  [{i}] {tipo.capitalize():12} → {cfg['estructura'][1] if len(cfg['estructura']) > 1 else 'Único capítulo'} + {len(cfg['estructura'])-1} secciones")
        
        try:
            opcion = input(c("\n→ Opción [1-5]: ", Colors.CYAN)).strip()
            tipo = list(BookTemplate.TEMPLATES.keys())[int(opcion)-1]
        except:
            tipo = "novela"
            print(c("⚠️  Usando plantilla por defecto: Novela", Colors.YELLOW))
        
        self.libro = BookTemplate(tipo)
        
        print(c("\n✏️  CONFIGURA METADATOS:", Colors.YELLOW))
        for campo in ["titulo", "autor", "genero", "sinopsis", "tema_portada"]:
            valor_actual = self.libro.metadatos.get(campo, "")
            if campo == "tema_portada":
                print(f"  Temas disponibles: {', '.join(CoverGenerator.THEMES.keys())}")
            valor = input(c(f"  {campo.capitalize()} [{valor_actual}]: ", Colors.CYAN)).strip()
            if valor:
                self.libro.actualizar_metadatos(campo, valor)
        
        print(c(f"\n✅ Libro '{self.libro.metadatos['titulo']}' creado", Colors.GREEN))
        print(c(f"   Plantilla: {tipo.capitalize()} | Estructura: {len(self.libro.config['estructura'])} secciones", Colors.GRAY))
        self._mostrar_portada_ascii()
    
    def _mostrar_portada_ascii(self):
        if self.libro:
            portada = self.cover_gen.generar_ascii(
                self.libro.metadatos['titulo'],
                self.libro.metadatos['autor'],
                self.libro.metadatos['tema_portada']
            )
            print("\n" + portada)
    
    def escribir(self):
        if not self.libro:
            print(c("❌ Primero crea un libro (opción 1)", Colors.RED))
            return
        
        print(c("\n챕 CAPÍTULOS:", Colors.YELLOW))
        for i, (cap, cont) in enumerate(self.libro.capitulos.items(), 1):
            estado = "✓" if cont.strip() else "○"
            palabras = len(cont.split())
            print(f"  [{i}] {cap:25} {estado} ({palabras} palabras)")
        
        sel = input(c("\n→ Selecciona capítulo (número) o [N] Nuevo capítulo: ", Colors.CYAN)).strip().lower()
        
        if sel == "n":
            nombre = input(c("  Nombre del nuevo capítulo: ", Colors.CYAN)).strip()
            if nombre:
                self.libro.capitulos[nombre] = ""
                capitulo = nombre
            else:
                print(c("❌ Nombre inválido", Colors.RED))
                return
        elif sel.isdigit() and 1 <= int(sel) <= len(self.libro.capitulos):
            capitulo = list(self.libro.capitulos.keys())[int(sel)-1]
        else:
            print(c("❌ Selección inválida", Colors.RED))
            return
        
        print(c(f"\n✍️  EDITANDO: '{capitulo}'", Colors.GREEN))
        print(c(f"   Modo: {'🤖 AUTOMÁTICO (IA genera texto)' if self.modo_automatico else '👤 MANUAL (tú escribes)'}", Colors.YELLOW))
        
        if self.modo_automatico:
            # IA escribe automáticamente
            print(c("\n⏳ Generando texto con IA...", Colors.YELLOW))
            contexto = f"{self.libro.metadatos['genero']} sobre {self.libro.metadatos['sinopsis'][:50]}..."
            base = f"El {random.choice(['amanecer', 'anochecer', 'silencio', 'caos'])} envolvió todo como un {random.choice(['manto', 'velo', 'grito', 'susurro'])} {random.choice(['roto', 'eterno', 'frágil', 'implacable'])}."
            texto_ia = self.assistant.expandir(base, self.libro.metadatos, self.libro.config['estilo'])
            texto_ia = self.assistant.corregir(texto_ia)
            
            self.libro.capitulos[capitulo] = texto_ia
            palabras = len(texto_ia.split())
            self.libro.metadatos["palabras"] += palabras
            self.libro.metadatos["caracteres"] += len(texto_ia)
            
            print(c("\n✅ TEXTO GENERADO:", Colors.GREEN))
            for line in textwrap.wrap(texto_ia, width=78):
                print(c(f"  {line}", Colors.WHITE))
            print(c(f"\n📊 {palabras} palabras añadidas", Colors.GRAY))
        else:
            # Modo manual
            texto_actual = self.libro.capitulos[capitulo]
            if texto_actual:
                print(c("\nTexto actual (primeras 300 palabras):", Colors.GRAY))
                preview = " ".join(texto_actual.split()[:300])
                for line in textwrap.wrap(preview, width=78):
                    print(c(f"  {line}", Colors.WHITE))
                print(c("  ...", Colors.GRAY))
            
            print(c("\nEscribe tu texto:", Colors.CYAN))
            print(c("  Comandos: /fin (guardar) | /corregir (corregir) | /expandir (ampliar) | /deshacer", Colors.GRAY))
            
            lineas = []
            while True:
                try:
                    linea = input("  ")
                    if linea.strip().lower() == "/fin":
                        break
                    if linea.strip().lower() == "/corregir":
                        texto = self.assistant.corregir("\n".join(lineas))
                        print(c("\n✅ Texto corregido:", Colors.GREEN))
                        for line in textwrap.wrap(texto, width=78):
                            print(c(f"  {line}", Colors.WHITE))
                        lineas = [texto]
                        break
                    if linea.strip().lower() == "/expandir":
                        if lineas:
                            texto = self.assistant.expandir(" ".join(lineas), self.libro.metadatos)
                            print(c("\n✅ Texto expandido:", Colors.GREEN))
                            for line in textwrap.wrap(texto, width=78):
                                print(c(f"  {line}", Colors.WHITE))
                            lineas = [texto]
                        else:
                            print(c("❌ No hay texto para expandir", Colors.RED))
                        continue
                    if linea.strip().lower() == "/deshacer":
                        resultado = self.libro.deshacer()
                        print(c(f"\n{resultado}", Colors.YELLOW))
                        return
                    lineas.append(linea)
                except EOFError:
                    break
            
            texto_nuevo = "\n".join(lineas).strip()
            if texto_nuevo:
                self.libro.guardar_version(capitulo)
                texto_nuevo = self.assistant.corregir(texto_nuevo)
                self.libro.capitulos[capitulo] = texto_nuevo
                palabras = len(texto_nuevo.split())
                self.libro.metadatos["palabras"] += palabras
                self.libro.metadatos["caracteres"] += len(texto_nuevo)
                print(c(f"\n✅ Guardado ({palabras} palabras) | Total libro: {self.libro.metadatos['palabras']} palabras", Colors.GREEN))
                
                # Evaluación rápida
                eval = self.assistant.evaluar_calidad(texto_nuevo)
                print(c(f"📊 Calidad: {eval['calidad_estimada']} | Diversidad léxica: {eval['diversidad_lexica']}%", Colors.GRAY))
                print(c(f"💡 {eval['sugerencia']}", Colors.YELLOW))
    
    def investigar(self):
        if not self.libro:
            print(c("❌ Primero crea un libro", Colors.RED))
            return
        
        print(c("\n🔍 MODO DE BÚSQUEDA:", Colors.YELLOW))
        print("  [1] Rápido (DuckDuckGo - instantáneo)")
        print("  [2] Profundo (DuckDuckGo + SearXNG académico - más fuentes)")
        
        modo = "profundo" if input(c("\n→ Opción [1/2]: ", Colors.CYAN)).strip() == "2" else "rapido"
        query = input(c("  Término de búsqueda: ", Colors.CYAN)).strip()
        if not query:
            return
        
        self.historial_busquedas.append({"query": query, "modo": modo, "timestamp": datetime.now().strftime("%H:%M:%S")})
        
        print(c(f"\n⏳ Buscando en modo {modo.upper()}...", Colors.YELLOW))
        resultados = self.search.buscar(query, modo=modo, max_results=7)
        
        if not resultados:
            print(c("❌ No se encontraron resultados. Intenta con otros términos.", Colors.RED))
            return
        
        print(c(f"\n✅ Encontrados {len(resultados)} resultados:", Colors.GREEN))
        for i, r in enumerate(resultados, 1):
            print(c(f"\n[{i}] {r['title']}", Colors.CYAN))
            print(c(f"    💡 {r['snippet']}", Colors.WHITE))
            print(c(f"    🔗 [{r['source'].upper()}] {r['url'][:60]}...", Colors.PURPLE))
        
        if input(c("\n¿Insertar en capítulo actual? [s/n]: ", Colors.CYAN)).strip().lower() == "s":
            capitulo = list(self.libro.capitulos.keys())[0]  # Primer capítulo con contenido o el primero
            for key, val in self.libro.capitulos.items():
                if val.strip():
                    capitulo = key
                    break
            
            seleccion = input(c(f"  Selecciona resultado [1-{len(resultados)}] o [T] Todos: ", Colors.CYAN)).strip().lower()
            
            if seleccion == "t":
                citas = "\n\n".join([
                    f"[FUENTE {i+1}: {r['title']}]\n«{r['snippet']}»\n({r['url']})"
                    for i, r in enumerate(resultados)
                ])
            elif seleccion.isdigit() and 1 <= int(seleccion) <= len(resultados):
                r = resultados[int(seleccion)-1]
                citas = f"[FUENTE: {r['title']}]\n«{r['snippet']}»\n({r['url']})"
            else:
                print(c("❌ Selección inválida", Colors.RED))
                return
            
            self.libro.capitulos[capitulo] += f"\n\n{citas}"
            print(c("✅ Fuentes insertadas en capítulo", Colors.GREEN))
    
    def dialogo_ia(self):
        if not self.libro:
            print(c("❌ Primero crea un libro", Colors.RED))
            return
        
        print(c("\n💬 DIÁLOGO CON IA ESCRITORA NEXA", Colors.MAGENTA))
        print(c("   Escribe sobre: personajes, trama, estilo, bloqueos creativos", Colors.GRAY))
        print(c("   Comandos: /ideas (sugerencias) | /fin (salir) | /evaluar (calidad texto actual)", Colors.GRAY))
        
        while True:
            try:
                user_msg = input(c("\nTú: ", Colors.GREEN)).strip()
                if user_msg.lower() in ["/fin", "salir", "exit"]:
                    break
                if user_msg.lower() == "/ideas":
                    tema = self.libro.metadatos.get('genero', 'creatividad')
                    sugerencias = self.assistant.sugerir_idea(tema, self.libro.tipo, self.libro.metadatos)
                    print(c(f"\n✨ IDEAS PARA '{self.libro.metadatos['titulo']}':", Colors.YELLOW))
                    for i, idea in enumerate(sugerencias['sugerencias'], 1):
                        print(c(f"  {i}. {idea}", Colors.CYAN))
                    print(c(f"\n📚 Fuentes de inspiración: {', '.join(sugerencias['fuentes_inspiracion'])}", Colors.GRAY))
                    continue
                if user_msg.lower() == "/evaluar":
                    # Evaluar capítulo más largo
                    capitulo, contenido = max(self.libro.capitulos.items(), key=lambda x: len(x[1]))
                    if contenido.strip():
                        eval = self.assistant.evaluar_calidad(contenido)
                        print(c(f"\n📊 EVALUACIÓN DE '{capitulo}':", Colors.YELLOW))
                        print(c(f"   Palabras: {eval['palabras']}", Colors.WHITE))
                        print(c(f"   Diversidad léxica: {eval['diversidad_lexica']}%", Colors.WHITE))
                        print(c(f"   Calidad estimada: {eval['calidad_estimada']}", Colors.WHITE))
                        print(c(f"   💡 {eval['sugerencia']}", Colors.CYAN))
                    else:
                        print(c("❌ El capítulo está vacío", Colors.RED))
                    continue
                
                respuesta = self.assistant.dialogar(user_msg, self.libro.metadatos)
                print(c(f"\nNEXA: {respuesta}", Colors.MAGENTA))
            except (EOFError, KeyboardInterrupt):
                break
    
    def exportar(self):
        if not self.libro:
            print(c("❌ No hay libro para exportar", Colors.RED))
            return
        
        print(c("\n📤 FORMATOS DE EXPORTACIÓN:", Colors.YELLOW))
        print("  [1] PDF (diseño editorial profesional)")
        print("  [2] TXT (texto plano universal)")
        print("  [3] Ambos formatos")
        
        opcion = input(c("\n→ Opción [1-3]: ", Colors.CYAN)).strip()
        
        try:
            if opcion in ["1", "3"]:
                print(c("\n⏳ Generando PDF...", Colors.YELLOW))
                filename = self.exporter.exportar_pdf(self.libro)
                print(c(f"✅ PDF exportado: {filename}", Colors.GREEN))
            
            if opcion in ["2", "3"]:
                print(c("\n⏳ Generando TXT...", Colors.YELLOW))
                filename = self.exporter.exportar_txt(self.libro)
                print(c(f"✅ TXT exportado: {filename}", Colors.GREEN))
            
            print(c(f"\n📊 ESTADÍSTICAS FINALES:", Colors.YELLOW))
            print(c(f"   Título: {self.libro.metadatos['titulo']}", Colors.WHITE))
            print(c(f"   Autor: {self.libro.metadatos['autor']}", Colors.WHITE))
            print(c(f"   Palabras totales: {self.libro.metadatos['palabras']:,}", Colors.WHITE))
            print(c(f"   Caracteres: {self.libro.metadatos['caracteres']:,}", Colors.WHITE))
            print(c(f"   Capítulos: {len([c for c in self.libro.capitulos.values() if c.strip()])}/{len(self.libro.capitulos)} completos", Colors.WHITE))
        except Exception as e:
            print(c(f"\n❌ Error al exportar: {str(e)}", Colors.RED))
            print(c("💡 Consejo: Asegúrate de tener permisos de escritura en esta carpeta", Colors.GRAY))
    
    def generar_portada(self):
        if not self.libro:
            print(c("❌ Primero crea un libro", Colors.RED))
            return
        
        print(c("\n🎨 GENERADOR DE PORTADAS:", Colors.YELLOW))
        print("  [1] ASCII Art (instantáneo - estilo cyberpunk)")
        print("  [2] Portada real con IA (requiere API Key de Ideogram)")
        
        opcion = input(c("\n→ Opción [1/2]: ", Colors.CYAN)).strip()
        
        if opcion == "1":
            self._mostrar_portada_ascii()
        elif opcion == "2":
            if not self.api_keys["ideogram"]:
                print(c("\n🔑 Necesitas una API Key de Ideogram AI (gratis):", Colors.YELLOW))
                print(c("   1. Regístrate en https://ideogram.ai", Colors.GRAY))
                print(c("   2. Ve a Settings → API → Copia tu key", Colors.GRAY))
                key = input(c("\n   Pega tu API Key: ", Colors.CYAN)).strip()
                if key:
                    self.api_keys["ideogram"] = key
                    print(c("✅ Key guardada", Colors.GREEN))
                else:
                    print(c("❌ Operación cancelada", Colors.RED))
                    return
            
            print(c("\n⏳ Generando portada real con IA...", Colors.YELLOW))
            url = self.cover_gen.generar_real(
                self.libro.metadatos['titulo'],
                self.libro.metadatos['autor'],
                self.libro.metadatos['tema_portada'],
                self.api_keys["ideogram"]
            )
            
            if url:
                print(c(f"\n✅ Portada generada:", Colors.GREEN))
                print(c(f"   🔗 {url}", Colors.CYAN))
                print(c("\n💡 Descarga la imagen y guárdala como 'portada.jpg' en la misma carpeta", Colors.GRAY))
            else:
                print(c("\n❌ Error al generar portada. Usando ASCII Art como alternativa.", Colors.RED))
                self._mostrar_portada_ascii()
        else:
            print(c("❌ Opción inválida", Colors.RED))
    
    def configurar_apis(self):
        print(c("\n⚙️  CONFIGURACIÓN DE APIs (opcionales):", Colors.YELLOW))
        print(c("\nBrave Search (2,000 búsquedas/mes gratis):", Colors.CYAN))
        print(c("  Registro: https://brave.com/search/api/", Colors.GRAY))
        if self.api_keys["brave"]:
            print(c(f"  ✓ Key actual: {self.api_keys['brave'][:8]}...", Colors.GREEN))
        key = input(c("  Nueva Key (deja vacío para mantener): ", Colors.CYAN)).strip()
        if key:
            self.api_keys["brave"] = key
            self.search.set_key("brave", key)
            print(c("✅ Brave Search habilitado", Colors.GREEN))
        
        print(c("\nIdeogram AI (25 imágenes/día gratis):", Colors.CYAN))
        print(c("  Registro: https://ideogram.ai", Colors.GRAY))
        if self.api_keys["ideogram"]:
            print(c(f"  ✓ Key actual: {self.api_keys['ideogram'][:8]}...", Colors.GREEN))
        key = input(c("  Nueva Key (deja vacío para mantener): ", Colors.CYAN)).strip()
        if key:
            self.api_keys["ideogram"] = key
            print(c("✅ Ideogram AI configurado", Colors.GREEN))
    
    def mostrar_historial(self):
        if not self.historial_busquedas:
            print(c("\n📭 Historial vacío", Colors.GRAY))
            return
        
        print(c("\n📬 HISTORIAL DE BÚSQUEDAS:", Colors.YELLOW))
        for i, busq in enumerate(self.historial_busquedas[-10:], 1):  # Últimas 10
            print(c(f"  [{i}] [{busq['timestamp']}] {busq['modo'].upper()}: {busq['query']}", Colors.WHITE))
    
    def toggle_modo(self):
        self.modo_automatico = not self.modo_automatico
        estado = "🤖 AUTOMÁTICO" if self.modo_automatico else "👤 MANUAL"
        print(c(f"\n🔄 Modo cambiado a: {estado}", Colors.YELLOW))
        if self.modo_automatico:
            print(c("💡 En modo automático, la IA genera texto basado en el género y sinopsis del libro", Colors.GRAY))
        else:
            print(c("💡 En modo manual, tú escribes y la IA corrige/expande bajo demanda", Colors.GRAY))
    
    def ejecutar(self):
        os.system('cls' if os.name == 'nt' else 'clear')
        self.banner()
        
        # Mensaje de bienvenida
        print(c("\n✨ ¡Bienvenido a NEXA BOOK STUDIO ULTRA!", Colors.MAGENTA))
        print(c("   Crea novelas, cuentos, ensayos o poesía con asistencia de IA avanzada", Colors.GRAY))
        print(c("   💡 Tip: Empieza con [1] para crear tu primer libro", Colors.YELLOW))
        
        while True:
            try:
                cmd = input(c("\nNEXA ▸ ", Colors.CYAN)).strip().lower()
                
                if cmd == "1":
                    self.crear_libro()
                elif cmd == "2":
                    self.escribir()
                elif cmd == "3":
                    self.investigar()
                elif cmd == "4":
                    self.dialogo_ia()
                elif cmd == "5":
                    self.exportar()
                elif cmd == "c":
                    self.generar_portada()
                elif cmd == "m":
                    self.toggle_modo()
                elif cmd == "u":
                    self.configurar_apis()
                elif cmd == "h":
                    self.mostrar_historial()
                elif cmd in ["", "refrescar"]:
                    os.system('cls' if os.name == 'nt' else 'clear')
                    self.banner()
                    if self.libro:
                        print(c(f"\n📚 Libro actual: {self.libro.metadatos['titulo']} por {self.libro.metadatos['autor']}", Colors.WHITE))
                        print(c(f"   Palabras: {self.libro.metadatos['palabras']:,} | Modo: {'🤖 AUTO' if self.modo_automatico else '👤 MANUAL'}", Colors.GRAY))
                elif cmd in ["salir", "exit", "q", "quit"]:
                    print(c("\n✨ NEXA BOOK STUDIO ULTRA finalizado.", Colors.PURPLE))
                    print(c("   Tu historia continúa más allá de estas líneas...", Colors.GRAY))
                    break
                else:
                    print(c(f"\n❌ Comando desconocido. Usa: 1,2,3,4,5,C,M,U,H o 'salir'", Colors.RED))
            
            except KeyboardInterrupt:
                print(c("\n\n⚠️  Interrumpido por usuario", Colors.YELLOW))
                if input(c("¿Salir definitivamente? [s/n]: ", Colors.CYAN)).strip().lower() == "s":
                    print(c("\n✨ Que tus palabras iluminen el mundo.", Colors.PURPLE))
                    break
            except Exception as e:
                print(c(f"\n❌ Error inesperado: {str(e)}", Colors.RED))
                print(c("💡 Consejo: Si el error persiste, reinicia el script", Colors.GRAY))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ▶️ PUNTO DE ENTRADA - EJECUTA TODO EN UNO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if __name__ == "__main__":
    # Verificar dependencias críticas
    try:
        import requests
        from reportlab.platypus import SimpleDocTemplate
    except ImportError:
        print(c("❌ Error: Dependencias no instaladas correctamente", Colors.RED))
        print(c("💡 Ejecuta: pip install requests reportlab", Colors.YELLOW))
        sys.exit(1)
    
    # Iniciar NEXA BOOK STUDIO ULTRA
    studio = NexaBookStudioUltra()
    studio.ejecutar()
