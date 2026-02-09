# Main entry point for the Python Agent
from core.agent import NexaAgent

def main():
    agent = NexaAgent()
    print("🤖 NEXA Agent Online (Cyberpunk Edition)")
    print("   Comandos: 'busca <termino>' o 'busca rápido <termino>'")
    
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ['exit', 'quit']:
                break
            
            response = agent.process_query(user_input)
            
            # Si es resultado de búsqueda, muestra en formato especial
            if response.get("type") == "search_results":
                print("\n[NEXA] 🔍 Resultados encontrados:")
                for i, r in enumerate(response["results"], 1):
                    print(f"\n{i}. {r['title']}")
                    print(f"   → {r['url']}")
                    print(f"   💡 {r['snippet']}")
                    print(f"   [FUENTE: {r['source']}]")
            else:
                print(f"\nNexa: {response.get('content', response)}")
                
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    main()
