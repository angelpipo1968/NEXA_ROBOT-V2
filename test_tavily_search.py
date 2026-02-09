import os
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime
import sys

class WebSearchAssistant:
    def __init__(self, api_key: str, search_engine: str = "tavily"):
        """
        Inicializa el asistente de búsqueda web
        
        Args:
            api_key: Tu API key de Tavily
            search_engine: Motor de búsqueda a usar ('tavily' o 'brave')
        """
        self.api_key = api_key
        self.search_engine = search_engine
        
        # Configuración de endpoints
        if search_engine == "tavily":
            self.endpoint = "https://api.tavily.com/search"
        else:
            # Brave Search API (necesitarías registrarte en brave.com/api)
            self.endpoint = "https://api.search.brave.com/res/v1/web/search"
    
    def search_with_tavily(self, query: str, max_results: int = 5, include_answer: bool = True) -> Dict:
        """
        Realiza una búsqueda usando Tavily API
        
        Args:
            query: Tu pregunta o término de búsqueda
            max_results: Número máximo de resultados
            include_answer: Si incluye una respuesta resumida
            
        Returns:
            Dict con resultados estructurados
        """
        headers = {"Content-Type": "application/json"}
        
        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": include_answer,
            "include_images": False,
            "max_results": max_results
        }
        
        try:
            print(f"🔍 Buscando: '{query}'...")
            response = requests.post(
                self.endpoint,
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            return self._format_tavily_response(data, query)
            
        except requests.exceptions.RequestException as e:
            return {
                "error": True,
                "message": f"Error de conexión: {str(e)}",
                "query": query
            }
        except Exception as e:
            return {
                "error": True,
                "message": f"Error inesperado: {str(e)}",
                "query": query
            }
    
    def _format_tavily_response(self, data: Dict, query: str) -> Dict:
        """Formatea la respuesta de Tavily para mejor legibilidad"""
        
        result = {
            "query": query,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "search_engine": "Tavily",
            "error": False
        }
        
        # Respuesta resumida (si Tavily la proporciona)
        if "answer" in data and data["answer"]:
            result["summary"] = data["answer"]
        
        # Resultados detallados
        if "results" in data:
            results_list = []
            for i, item in enumerate(data["results"][:5], 1):
                result_item = {
                    "title": item.get("title", "Sin título"),
                    "url": item.get("url", ""),
                    "content": item.get("content", "")[:300] + "..." if len(item.get("content", "")) > 300 else item.get("content", ""),
                    "relevance_score": item.get("score", 0)
                }
                results_list.append(result_item)
            result["results"] = results_list
        
        # Información de fuentes
        if "response_time" in data:
            result["response_time"] = data["response_time"]
        
        return result
    
    def display_results(self, search_results: Dict):
        """Muestra los resultados de forma organizada"""
        
        print("\n" + "="*60)
        print("📊 RESULTADOS DE BÚSQUEDA")
        print("="*60)
        
        if search_results.get("error"):
            print(f"❌ Error: {search_results['message']}")
            return
        
        print(f"🔎 Consulta: {search_results['query']}")
        print(f"⏰ Fecha: {search_results['timestamp']}")
        print(f"🔧 Motor: {search_results['search_engine']}")
        
        if "response_time" in search_results:
            print(f"⚡ Tiempo de respuesta: {search_results['response_time']}s")
        
        print("\n" + "-"*60)
        
        # Mostrar resumen si existe
        if "summary" in search_results:
            print("📝 RESUMEN:")
            print(search_results["summary"])
            print("-"*60)
        
        # Mostrar resultados detallados
        if "results" in search_results:
            print(f"🔗 RESULTADOS DETALLADOS ({len(search_results['results'])} encontrados):\n")
            
            for i, item in enumerate(search_results["results"], 1):
                print(f"{i}. {item['title']}")
                print(f"   📍 URL: {item['url']}")
                print(f"   📄 Contenido: {item['content']}")
                if item['relevance_score'] > 0:
                    print(f"   ⭐ Relevancia: {item['relevance_score']:.2f}")
                print()
        
        print("="*60)
    
    def save_to_file(self, search_results: Dict, filename: str = "busquedas.json"):
        """Guarda los resultados en un archivo JSON"""
        try:
            # Cargar búsquedas existentes
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8') as f:
                    all_searches = json.load(f)
            else:
                all_searches = []
            
            # Agregar nueva búsqueda
            all_searches.append(search_results)
            
            # Guardar
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(all_searches, f, ensure_ascii=False, indent=2)
            
            print(f"💾 Resultados guardados en '{filename}'")
            
        except Exception as e:
            print(f"⚠️  Error al guardar: {e}")

# Función principal para interactuar
def main():
    """Función principal para ejecutar el asistente de búsqueda"""
    
    print("🤖 ASISTENTE DE BÚSQUEDA WEB - TAVILY API")
    print("-" * 40)
    
    # Cargar API key (puedes ponerla directamente o usar variable de entorno)
    api_key = input("🔑 Ingresa tu API Key de Tavily (o presiona Enter para usar TAVILY_API_KEY de variables de entorno): ").strip()
    
    if not api_key:
        api_key = os.getenv("TAVILY_API_KEY")
    
    if not api_key:
        print("❌ Error: Necesitas una API Key de Tavily.")
        print("👉 Obtén una en: https://app.tavily.com")
        return
    
    # Inicializar asistente
    assistant = WebSearchAssistant(api_key=api_key, search_engine="tavily")
    
    while True:
        print("\n" + "="*60)
        print("¿Qué te gustaría buscar?")
        print("  • Ejemplo: 'precio actual de Ethereum'")
        print("  • Escribe 'salir' para terminar")
        print("  • Escribe 'historial' para ver búsquedas guardadas")
        print("="*60)
        
        query = input("\n🔍 Tu pregunta: ").strip()
        
        if query.lower() == 'salir':
            print("👋 ¡Hasta luego!")
            break
        
        if query.lower() == 'historial':
            if os.path.exists("busquedas.json"):
                with open("busquedas.json", 'r', encoding='utf-8') as f:
                    historial = json.load(f)
                print(f"\n📚 Historial de búsquedas ({len(historial)}):")
                for i, busq in enumerate(historial, 1):
                    print(f"{i}. {busq.get('query', 'Sin título')} - {busq.get('timestamp', '')}")
            else:
                print("📭 No hay historial de búsquedas")
            continue
        
        if not query:
            print("⚠️  Por favor, ingresa una pregunta válida")
            continue
        
        # Realizar búsqueda
        resultados = assistant.search_with_tavily(query, max_results=5, include_answer=True)
        
        # Mostrar resultados
        assistant.display_results(resultados)
        
        # Preguntar si guardar
        guardar = input("\n💾 ¿Guardar estos resultados? (s/n): ").strip().lower()
        if guardar == 's':
            assistant.save_to_file(resultados)
        
        # Preguntar por otra búsqueda
        continuar = input("\n🔄 ¿Hacer otra búsqueda? (s/n): ").strip().lower()
        if continuar != 's':
            print("👋 ¡Hasta luego!")
            break

# Versión simplificada para uso rápido
def busqueda_rapida(pregunta: str, api_key: str = None):
    """
    Función rápida para una sola búsqueda
    
    Uso:
        resultado = busqueda_rapida("¿Cuál es el precio de Bitcoin?", "tu_api_key")
    """
    if not api_key:
        api_key = os.getenv("TAVILY_API_KEY")
    
    if not api_key:
        return {"error": True, "message": "API Key no proporcionada"}
    
    assistant = WebSearchAssistant(api_key=api_key)
    return assistant.search_with_tavily(pregunta)

if __name__ == "__main__":
    main()
