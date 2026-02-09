#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NEXA SEARCH CORE v1.0
Módulo de búsqueda multi-motor | Cyberpunk Edition
✅ DuckDuckGo | ✅ SearXNG | ✅ Brave | ✅ You.com | ✅ Google CSE | ✅ SerpAPI
"""

import requests
import time
import random
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from urllib.parse import urlparse, quote_plus

class NexaSearchCore:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'NEXA-AI/1.0 (Cyberpunk Edition)',
            'Accept': 'application/json',
            'Accept-Language': 'es-ES,es;q=0.9'
        })
        
        # Configuración de motores
        self.engines = {
            'duckduckgo': {
                'enabled': True,
                'type': 'official',
                'url': 'https://api.duckduckgo.com',
                'timeout': 3,
                'cooldown': 0
            },
            'searxng': {
                'enabled': True,
                'type': 'public',
                'instances': [
                    'https://searx.be',
                    'https://search.unlocked.link',
                    'https://searxng.site',
                    'https://searx.work',
                    'https://northboot.xyz'
                ],
                'timeout': 5,
                'cooldown': 1
            },
            'brave': {
                'enabled': False,
                'type': 'official',
                'key': None,  # ← AGREGA TU KEY AQUÍ
                'url': 'https://api.search.brave.com/res/v1/web/search',
                'timeout': 4,
                'quota': {'daily': 2000, 'used': 0, 'reset': None}
            },
            'you': {
                'enabled': False,
                'type': 'official',
                'key': None,  # ← AGREGA TU KEY AQUÍ
                'url': 'https://api.you.com/search/web',
                'timeout': 4,
                'quota': {'daily': 1000, 'used': 0, 'reset': None}
            },
            'google_cse': {
                'enabled': False,
                'type': 'official',
                'key': None,  # ← AGREGA TU KEY AQUÍ
                'cx': None,   # ← AGREGA TU CX ID AQUÍ
                'url': 'https://www.googleapis.com/customsearch/v1',
                'timeout': 4,
                'quota': {'daily': 100, 'used': 0, 'reset': None}
            },
            'serpapi': {
                'enabled': False,
                'type': 'official',
                'key': None,  # ← AGREGA TU KEY AQUÍ
                'url': 'https://serpapi.com/search',
                'timeout': 4,
                'quota': {'monthly': 100, 'used': 0, 'reset': None}
            }
        }
        
        # Prioridad de motores (del más rápido/alto rendimiento al más lento)
        self.priority_order = ['duckduckgo', 'searxng', 'brave', 'you', 'google_cse', 'serpapi']
        self.cache = {}
        self.last_request = {engine: 0 for engine in self.engines}
    
    # ────────────────────────────────────────────────────────────────────
    # 🔍 MÉTODOS DE BÚSQUEDA POR MOTOR
    # ────────────────────────────────────────────────────────────────────
    
    def _search_duckduckgo(self, query: str, limit: int) -> List[Dict]:
        params = {
            'q': query,
            'format': 'json',
            'no_html': 1,
            'skip_disambig': 1,
            't': 'NEXA'
        }
        r = self.session.get(self.engines['duckduckgo']['url'], params=params, timeout=3)
        r.raise_for_status()
        data = r.json()
        
        results = []
        # Resultados principales
        if data.get('AbstractURL'):
            results.append({
                'title': data.get('Heading', query),
                'url': data['AbstractURL'],
                'source': 'duckduckgo',
                'snippet': data.get('AbstractText', '')[:250]
            })
        
        # Related Topics
        for item in data.get('RelatedTopics', [])[:limit]:
            if isinstance(item, dict) and 'FirstURL' in item:
                results.append({
                    'title': item.get('Text', query),
                    'url': item['FirstURL'],
                    'source': 'duckduckgo',
                    'snippet': item.get('Text', '')[:250]
                })
            elif isinstance(item, dict) and 'Topics' in item:
                for sub in item.get('Topics', [])[:2]:
                    if 'FirstURL' in sub:
                        results.append({
                            'title': sub.get('Text', query),
                            'url': sub['FirstURL'],
                            'source': 'duckduckgo',
                            'snippet': sub.get('Text', '')[:250]
                        })
        
        return results[:limit]
    
    def _search_searxng(self, query: str, limit: int) -> List[Dict]:
        instances = self.engines['searxng']['instances'][:]
        random.shuffle(instances)  # Rotar instancias para balanceo
        
        for instance in instances[:3]:  # Probar hasta 3 instancias
            try:
                url = f"{instance.rstrip('/')}/search"
                params = {
                    'q': query,
                    'format': 'json',
                    'language': 'es',
                    'safesearch': 0,
                    'categories': 'general'
                }
                r = self.session.get(url, params=params, timeout=5)
                r.raise_for_status()
                data = r.json()
                
                results = []
                for item in data.get('results', [])[:limit]:
                    results.append({
                        'title': item.get('title', 'Sin título'),
                        'url': item.get('url', ''),
                        'source': 'searxng',
                        'snippet': item.get('content', '')[:250]
                    })
                if results:
                    return results
            except:
                continue
        return []
    
    def _search_brave(self, query: str, limit: int) -> List[Dict]:
        if not self.engines['brave']['key']:
            raise ValueError("Brave API key no configurada")
        
        headers = {
            'X-Subscription-Token': self.engines['brave']['key'],
            'Accept': 'application/json'
        }
        params = {
            'q': query,
            'count': limit,
            'search_lang': 'es',
            'country': 'es'
        }
        r = self.session.get(self.engines['brave']['url'], headers=headers, params=params, timeout=4)
        r.raise_for_status()
        data = r.json()
        
        results = []
        for item in data.get('web', {}).get('results', [])[:limit]:
            results.append({
                'title': item.get('title', 'Sin título'),
                'url': item.get('url', ''),
                'source': 'brave',
                'snippet': item.get('description', '')[:250]
            })
        return results
    
    def _search_you(self, query: str, limit: int) -> List[Dict]:
        if not self.engines['you']['key']:
            raise ValueError("You.com API key no configurada")
        
        headers = {'X-API-Key': self.engines['you']['key']}
        params = {'query': query, 'num_web_results': limit}
        r = self.session.get(self.engines['you']['url'], headers=headers, params=params, timeout=4)
        r.raise_for_status()
        data = r.json()
        
        results = []
        for item in data.get('web', {}).get('results', [])[:limit]:
            results.append({
                'title': item.get('title', 'Sin título'),
                'url': item.get('url', ''),
                'source': 'you',
                'snippet': item.get('snippet', '')[:250]
            })
        return results
    
    def _search_google_cse(self, query: str, limit: int) -> List[Dict]:
        if not self.engines['google_cse']['key'] or not self.engines['google_cse']['cx']:
            raise ValueError("Google CSE key o CX ID no configurados")
        
        params = {
            'key': self.engines['google_cse']['key'],
            'cx': self.engines['google_cse']['cx'],
            'q': query,
            'num': min(limit, 10),
            'lr': 'lang_es'
        }
        r = self.session.get(self.engines['google_cse']['url'], params=params, timeout=4)
        r.raise_for_status()
        data = r.json()
        
        results = []
        for item in data.get('items', [])[:limit]:
            results.append({
                'title': item.get('title', 'Sin título'),
                'url': item.get('link', ''),
                'source': 'google_cse',
                'snippet': item.get('snippet', '')[:250]
            })
        return results
    
    def _search_serpapi(self, query: str, limit: int) -> List[Dict]:
        if not self.engines['serpapi']['key']:
            raise ValueError("SerpAPI key no configurada")
        
        params = {
            'api_key': self.engines['serpapi']['key'],
            'q': query,
            'num': limit,
            'engine': 'google',
            'hl': 'es',
            'gl': 'es'
        }
        r = self.session.get(self.engines['serpapi']['url'], params=params, timeout=4)
        r.raise_for_status()
        data = r.json()
        
        results = []
        for item in data.get('organic_results', [])[:limit]:
            results.append({
                'title': item.get('title', 'Sin título'),
                'url': item.get('link', ''),
                'source': 'serpapi',
                'snippet': item.get('snippet', '')[:250]
            })
        return results
    
    # ────────────────────────────────────────────────────────────────────
    # ⚙️ MOTOR PRINCIPAL
    # ────────────────────────────────────────────────────────────────────
    
    def buscar(self, query: str, max_results: int = 10, fast_mode: bool = False) -> Dict:
        """
        Ejecuta búsqueda multi-motor con fallback inteligente
        
        Args:
            query: Término de búsqueda
            max_results: Máximo de resultados únicos (default: 10)
            fast_mode: True = solo motores sin key (más rápido)
        """
        start_time = time.time()
        cache_key = f"{query.lower().strip()}|{max_results}"
        
        # Cache hit (5 min TTL)
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            if time.time() - cached['timestamp'] < 300:
                return cached['data']
        
        resultados = {
            'query': query,
            'timestamp': datetime.now().isoformat(),
            'execution_time': 0.0,
            'total_results': 0,
            'sources_used': [],
            'results': []
        }
        
        # Modo rápido: solo motores sin key
        if fast_mode:
            self.priority_order = ['duckduckgo', 'searxng']
        
        # Ejecutar búsqueda por motor
        for engine in self.priority_order:
            if not self.engines[engine]['enabled']:
                continue
            
            # Respetar cooldown
            cooldown = self.engines[engine].get('cooldown', 0)
            if time.time() - self.last_request[engine] < cooldown:
                time.sleep(cooldown - (time.time() - self.last_request[engine]))
            
            try:
                self.last_request[engine] = time.time()
                
                if engine == 'duckduckgo':
                    results = self._search_duckduckgo(query, max_results)
                elif engine == 'searxng':
                    results = self._search_searxng(query, max_results)
                elif engine == 'brave':
                    results = self._search_brave(query, max_results)
                elif engine == 'you':
                    results = self._search_you(query, max_results)
                elif engine == 'google_cse':
                    results = self._search_google_cse(query, max_results)
                elif engine == 'serpapi':
                    results = self._search_serpapi(query, max_results)
                else:
                    continue
                
                if results:
                    resultados['sources_used'].append(engine)
                    resultados['results'].extend(results)
                    
                    # Early exit si ya tenemos suficientes resultados únicos
                    if len(self._remove_duplicates(resultados['results'])) >= max_results:
                        break
                        
            except Exception as e:
                # Silencioso en producción (solo loggearía en modo debug)
                continue
        
        # Post-procesamiento
        resultados['results'] = self._remove_duplicates(resultados['results'])[:max_results]
        resultados['total_results'] = len(resultados['results'])
        resultados['execution_time'] = round(time.time() - start_time, 3)
        
        # Guardar en cache
        self.cache[cache_key] = {
            'timestamp': time.time(),
            'data': resultados
        }
        
        return resultados
    
    # ────────────────────────────────────────────────────────────────────
    # 🧹 UTILIDADES
    # ────────────────────────────────────────────────────────────────────
    
    def _remove_duplicates(self, results: List[Dict]) -> List[Dict]:
        seen = set()
        unique = []
        for r in results:
            domain = urlparse(r.get('url', '')).netloc.replace('www.', '')
            if domain and domain not in seen:
                seen.add(domain)
                unique.append(r)
        return unique
    
    def enable(self, engine: str):
        if engine in self.engines:
            self.engines[engine]['enabled'] = True
    
    def disable(self, engine: str):
        if engine in self.engines:
            self.engines[engine]['enabled'] = False
    
    def set_key(self, engine: str, key: str, cx: Optional[str] = None):
        if engine in self.engines:
            self.engines[engine]['key'] = key
            if cx and 'cx' in self.engines[engine]:
                self.engines[engine]['cx'] = cx
            self.engines[engine]['enabled'] = True
    
    def get_stats(self) -> Dict:
        return {
            engine: {
                'enabled': cfg['enabled'],
                'type': cfg['type'],
                'quota': cfg.get('quota', 'N/A')
            }
            for engine, cfg in self.engines.items()
        }
    
    def clear_cache(self):
        self.cache.clear()
