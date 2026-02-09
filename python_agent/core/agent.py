from .search_core import NexaSearchCore

class NexaAgent:
    def __init__(self):
        self.search = NexaSearchCore()
        # Configura tus keys aquí (solo si quieres activar motores premium)
        # self.search.set_key('brave', 'TU_BRAVE_KEY')
        
    def process_query(self, query: str):
        """Procesa consultas que requieren información externa"""
        # Trigger de búsqueda
        if "busca" in query.lower() or "encuentra" in query.lower():
            return self._handle_search(query)
        return self._generate_response(query)
    
    def _handle_search(self, query: str):
        """Ejecuta búsqueda y formatea resultados para la UI"""
        # Detectar modo rápido
        use_fast_mode = "rápido" in query.lower() or "rapido" in query.lower()
        
        results = self.search.buscar(query, max_results=5, fast_mode=use_fast_mode)
        
        # Formato para la UI (compatible con tu interfaz actual)
        response = {
            "type": "search_results",
            "query": results["query"],
            "results": [
                {
                    "title": r["title"],
                    "url": r["url"],
                    "source": r["source"].upper(),
                    "snippet": r["snippet"]
                } for r in results["results"]
            ]
        }
        return response

    def _generate_response(self, query: str):
        # Fallback/Placeholder for non-search queries
        return {
            "type": "text",
            "content": f"Echo: {query}"
        }
