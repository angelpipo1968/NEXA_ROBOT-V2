# 🐍 Test de Búsqueda con Tavily API (Python)

Este script **independiente** te permite probar la API de Tavily de forma rápida, fuera de tu aplicación web Nexa.

## 📦 Instalación

```bash
# 1. Instalar dependencias de Python
pip install requests python-dotenv

# O usando el archivo requirements.txt
pip install -r requirements.txt
```

## ⚙️ Configuración (Archivo .env - RECOMENDADO)

### Paso 1: Crear archivo `.env`

Crea un archivo llamado `.env` en la carpeta `c:\nexa\`:

```env
# Configuración de API Keys
TAVILY_API_KEY=tu_api_key_aqui
```

**Tip:** Puedes copiar `.env.python.example` y renombrarlo a `.env`

### Paso 2: Obtener tu API Key

1. Ve a: **https://app.tavily.com**
2. Regístrate gratis (plan gratuito disponible)
3. Copia tu API key desde el dashboard
4. Pégala en tu archivo `.env`

---

## 🚀 Modo de Uso

### 🔴 Opción 1: Modo Interactivo (Recomendado para principiantes)

```bash
python test_tavily_search.py
```

El script te pedirá la API key o la leerá automáticamente del archivo `.env`.

**Ejemplo de sesión:**
```
🤖 ASISTENTE DE BÚSQUEDA WEB - TAVILY API
🔑 Ingresa tu API Key (o presiona Enter): [Enter]

¿Qué te gustaría buscar?
🔍 Tu pregunta: precio actual de Ethereum

🔍 Buscando: 'precio actual de Ethereum'...
📊 RESULTADOS DE BÚSQUEDA
...
```

### 🔵 Opción 2: Búsqueda Rápida desde Python

```python
from test_tavily_search import busqueda_rapida

# Ejemplo 1: Con API key directa
resultado = busqueda_rapida(
    "¿Cuál es el precio actual de Ethereum en USD?",
    api_key="tvly-abc123..."
)

# Ejemplo 2: Usando .env (automático)
import os
from dotenv import load_dotenv
load_dotenv()

resultado = busqueda_rapida("Noticias recientes sobre inteligencia artificial 2024")

# Imprimir solo el resumen
if "summary" in resultado:
    print("📝 Resumen:", resultado["summary"])

# Imprimir todos los resultados
for i, res in enumerate(resultado.get("results", []), 1):
    print(f"{i}. {res['title']}")
    print(f"   {res['url']}")
```

### 🟢 Opción 3: Variables de Entorno (Sin archivo .env)

```bash
# Windows PowerShell
$env:TAVILY_API_KEY="tvly-abc123..."
python test_tavily_search.py

# Linux/Mac
export TAVILY_API_KEY="tvly-abc123..."
python test_tavily_search.py
```

---

## 💡 Ejemplos de Búsquedas Efectivas

| Query | Descripción |
|-------|-------------|
| `precio actual de Ethereum` | Precios de criptomonedas |
| `últimas noticias sobre IA 2024` | Noticias recientes |
| `clima en Madrid hoy` | Información meteorológica |
| `precio de Bitcoin en USD` | Conversiones de moneda |
| `resultados del partido Barcelona` | Deportes en tiempo real |

---

## 📝 Funcionalidades del Script

| Característica | Descripción |
|----------------|-------------|
| ✅ **Búsqueda en tiempo real** | Usa la API de Tavily para búsquedas actualizadas |
| ✅ **Resumen automático** | IA genera un resumen conciso de los resultados |
| ✅ **Historial persistente** | Guarda búsquedas en `busquedas.json` |
| ✅ **Scores de relevancia** | Muestra qué tan relevante es cada resultado |
| ✅ **Manejo de errores** | Gestión robusta de timeouts y errores de red |
| ✅ **Interfaz interactiva** | CLI amigable con emojis y formato limpio |

---

## 🔧 Integración con tu Proyecto Nexa

### ✅ Este script Python es **independiente** - solo para testing

Tu proyecto **Nexa web** ya tiene integración completa:

| Archivo | Propósito |
|---------|-----------|
| `src/lib/tavily.ts` | Cliente TypeScript para Tavily |
| `src/lib/autoToolDetector.ts` | Detecta queries y ejecuta búsquedas automáticamente |
| `src/lib/toolService.ts` | Servicio central de herramientas (search_web, create_artifact) |
| `src/store/useChatStore.ts` | Store de Zustand con lógica de chat + tools |

### 🌐 Probar en tu App Web (Recomendado)

1. Abre `http://localhost:3000` en tu navegador
2. Escribe en el chat:
   ```
   Busca cuál es el precio de Ethereum
   ```
3. El sistema detectará keywords y ejecutará la búsqueda automáticamente
4. Revisa la consola del navegador (F12) para logs `[AUTO-TOOL]`

---

## 🚀 Crear API Web con Flask (Opcional)

Si quieres crear un endpoint HTTP para usar desde otras apps:

### Paso 1: Instalar Flask

```bash
pip install flask flask-cors
```

### Paso 2: Crear `api_server.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from test_tavily_search import busqueda_rapida
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/search', methods=['POST'])
def search():
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    api_key = os.getenv('TAVILY_API_KEY')
    resultado = busqueda_rapida(query, api_key)
    
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
```

### Paso 3: Ejecutar el servidor

```bash
python api_server.py
```

### Paso 4: Hacer requests desde cualquier cliente

```bash
# cURL
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "precio de Ethereum"}'

# JavaScript (fetch)
fetch('http://localhost:5000/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'precio de Ethereum' })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🎯 Recomendaciones

1. **Para desarrollo rápido**: Usa el modo interactivo del script Python
2. **Para producción web**: Usa la integración TypeScript ya incluida en Nexa
3. **Para microservicios**: Crea la API Flask si necesitas un servicio independiente

**¿Dudas?** Revisa los logs de la consola cuando hagas búsquedas en `http://localhost:3000`
