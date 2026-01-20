from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import base64
import aiofiles
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / 'uploads'
UPLOADS_DIR.mkdir(exist_ok=True)
(UPLOADS_DIR / 'images').mkdir(exist_ok=True)
(UPLOADS_DIR / 'videos').mkdir(exist_ok=True)
(UPLOADS_DIR / 'websites').mkdir(exist_ok=True)
(UPLOADS_DIR / 'generated').mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'nexa_robot_db')]

# Get API Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Create the main app
app = FastAPI(title="NEXA ROBOT V2 PRO API", version="3.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    message_type: str = "text"
    metadata: Dict[str, Any] = {}

class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    title: str = "Nueva Conversacion"
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Memory(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default"
    key: str
    value: str
    category: str = "general"
    importance: int = 5
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: str
    include_history: bool = True
    creative_mode: bool = False
    search_mode: bool = False
    custom_instructions: str = ""
    user_name: str = ""
    assistant_name: str = "NEXA"

class ChatResponse(BaseModel):
    response: str
    session_id: str
    message_id: str

class GenerateWebsiteRequest(BaseModel):
    prompt: str
    style: str = "modern"

class GenerateImageRequest(BaseModel):
    prompt: str
    style: str = "realistic"

class GenerateVideoScriptRequest(BaseModel):
    prompt: str
    duration: str = "30 seconds"

class WebsiteCreate(BaseModel):
    name: str
    html: str
    css: str = ""
    js: str = ""

class NexaStatus(BaseModel):
    status: str
    version: str
    features: List[str]
    llm_connected: bool

# ==================== NEXA BRAIN ====================

NEXA_SYSTEM_PROMPT = """Eres NEXA, un asistente de IA avanzado, creativo e inteligente.
Hablas en espanol principalmente. Eres experto en programacion, diseno y creatividad.
Respondes de forma clara y util."""

async def get_user_memories(user_id: str = "default") -> str:
    memories = await db.memories.find({"user_id": user_id}).sort("importance", -1).limit(10).to_list(10)
    if not memories:
        return ""
    memory_text = "\nRecuerdos del usuario:\n"
    for mem in memories:
        memory_text += f"- {mem['key']}: {mem['value']}\n"
    return memory_text

async def get_nexa_response(message: str, session_id: str, conversation_history: List[dict] = None, creative_mode: bool = False) -> str:
    try:
        system_prompt = NEXA_SYSTEM_PROMPT
        memories = await get_user_memories()
        if memories:
            system_prompt += memories
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_prompt
        ).with_model("openai", "gpt-4.1")
        
        context = ""
        if conversation_history and len(conversation_history) > 0:
            recent_history = conversation_history[-10:]
            context = "Historial:\n"
            for msg in recent_history:
                role = "Usuario" if msg.get('role') == 'user' else "NEXA"
                context += f"{role}: {msg.get('content', '')}\n"
            context += "\n---\nMensaje: "
        
        full_message = context + message if context else message
        user_message = UserMessage(text=full_message)
        response = await chat.send_message(user_message)
        return response
    except Exception as e:
        logger.error(f"Error getting NEXA response: {e}")
        return f"Error: {str(e)}"

# ==================== AI GENERATION FUNCTIONS ====================

async def generate_website_with_ai(prompt: str, style: str) -> dict:
    """Generate website code using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"web-gen-{uuid.uuid4()}",
            system_message="""Eres un experto desarrollador web. Genera codigo HTML, CSS y JavaScript completo y funcional.
            IMPORTANTE: Responde SOLO con el codigo en el siguiente formato exacto:
            ---HTML---
            (codigo html aqui)
            ---CSS---
            (codigo css aqui)
            ---JS---
            (codigo javascript aqui)
            ---END---
            No agregues explicaciones, solo el codigo."""
        ).with_model("openai", "gpt-4.1")
        
        user_message = UserMessage(text=f"Crea una pagina web {style} sobre: {prompt}. Hazla atractiva, responsiva y moderna.")
        response = await chat.send_message(user_message)
        
        # Parse response
        html = ""
        css = ""
        js = ""
        
        if "---HTML---" in response:
            parts = response.split("---HTML---")
            if len(parts) > 1:
                html_part = parts[1].split("---CSS---")[0] if "---CSS---" in parts[1] else parts[1].split("---END---")[0]
                html = html_part.strip()
        
        if "---CSS---" in response:
            parts = response.split("---CSS---")
            if len(parts) > 1:
                css_part = parts[1].split("---JS---")[0] if "---JS---" in parts[1] else parts[1].split("---END---")[0]
                css = css_part.strip()
        
        if "---JS---" in response:
            parts = response.split("---JS---")
            if len(parts) > 1:
                js_part = parts[1].split("---END---")[0]
                js = js_part.strip()
        
        # If parsing failed, use simple extraction
        if not html:
            html = f"<div class='ai-generated'><h1>{prompt}</h1><p>Pagina generada por NEXA AI</p></div>"
            css = "body { font-family: Arial; padding: 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; min-height: 100vh; }"
            js = "console.log('NEXA AI Generated');"
        
        return {"html": html, "css": css, "js": js}
    except Exception as e:
        logger.error(f"Error generating website: {e}")
        return {
            "html": f"<h1>{prompt}</h1><p>Pagina generada</p>",
            "css": "body { font-family: Arial; padding: 20px; }",
            "js": ""
        }

async def generate_image_with_ai(prompt: str, style: str) -> str:
    """Generate image using AI and return base64"""
    try:
        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)
        
        full_prompt = f"{prompt}, {style} style, high quality, detailed"
        
        images = await image_gen.generate_images(
            prompt=full_prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            # Save image to file
            image_id = str(uuid.uuid4())
            filename = f"{image_id}.png"
            filepath = UPLOADS_DIR / 'generated' / filename
            
            with open(filepath, "wb") as f:
                f.write(images[0])
            
            # Convert to base64
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            
            # Save to database
            await db.generated_images.insert_one({
                "id": image_id,
                "prompt": prompt,
                "style": style,
                "filename": filename,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            return image_base64
        else:
            raise Exception("No image generated")
    except Exception as e:
        logger.error(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def generate_video_script_with_ai(prompt: str, duration: str) -> dict:
    """Generate video script/storyboard using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"video-gen-{uuid.uuid4()}",
            system_message="""Eres un director de video profesional. Creas guiones y storyboards detallados.
            Responde en formato estructurado con escenas numeradas."""
        ).with_model("openai", "gpt-4.1")
        
        user_message = UserMessage(text=f"""Crea un guion de video completo para: {prompt}
        Duracion aproximada: {duration}
        
        Incluye:
        1. Titulo del video
        2. Descripcion general
        3. Escenas detalladas (con descripcion visual, dialogo/narracion, duracion)
        4. Sugerencias de musica/efectos
        5. Notas de produccion""")
        
        response = await chat.send_message(user_message)
        
        return {
            "script": response,
            "prompt": prompt,
            "duration": duration
        }
    except Exception as e:
        logger.error(f"Error generating video script: {e}")
        return {"script": f"Error generando guion: {str(e)}", "prompt": prompt, "duration": duration}

# ==================== API ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "NEXA ROBOT V2 PRO API", "version": "3.0.0"}

@api_router.get("/status", response_model=NexaStatus)
async def get_status():
    return NexaStatus(
        status="online",
        version="3.0.0",
        features=[
            "chat", "voice_synthesis", "voice_recognition", "vision",
            "smart_memory", "creative_mode", "ai_website_generator",
            "ai_image_generator", "ai_video_script", "photo_editor", "video_editor"
        ],
        llm_connected=bool(EMERGENT_LLM_KEY)
    )

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_nexa(request: ChatRequest):
    try:
        conversation_history = []
        if request.include_history:
            conv = await db.conversations.find_one({"session_id": request.session_id})
            if conv and "messages" in conv:
                conversation_history = conv["messages"]
        
        response = await get_nexa_response(
            request.message, request.session_id, conversation_history, request.creative_mode
        )
        
        user_msg = Message(role="user", content=request.message)
        assistant_msg = Message(role="assistant", content=response)
        
        existing_conv = await db.conversations.find_one({"session_id": request.session_id})
        
        if existing_conv:
            await db.conversations.update_one(
                {"session_id": request.session_id},
                {
                    "$push": {"messages": {"$each": [
                        {**user_msg.model_dump(), "timestamp": user_msg.timestamp.isoformat()},
                        {**assistant_msg.model_dump(), "timestamp": assistant_msg.timestamp.isoformat()}
                    ]}},
                    "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
                }
            )
        else:
            new_conv = Conversation(
                session_id=request.session_id,
                title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
                messages=[user_msg, assistant_msg]
            )
            conv_dict = new_conv.model_dump()
            conv_dict['created_at'] = conv_dict['created_at'].isoformat()
            conv_dict['updated_at'] = conv_dict['updated_at'].isoformat()
            for msg in conv_dict['messages']:
                msg['timestamp'] = msg['timestamp'].isoformat()
            await db.conversations.insert_one(conv_dict)
        
        return ChatResponse(response=response, session_id=request.session_id, message_id=assistant_msg.id)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== AI GENERATION ROUTES ====================

@api_router.post("/generate/website")
async def generate_website(request: GenerateWebsiteRequest):
    """Generate a website using AI from a prompt"""
    try:
        result = await generate_website_with_ai(request.prompt, request.style)
        return {
            "success": True,
            "html": result["html"],
            "css": result["css"],
            "js": result["js"],
            "prompt": request.prompt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate/image")
async def generate_image(request: GenerateImageRequest):
    """Generate an image using AI from a prompt"""
    try:
        image_base64 = await generate_image_with_ai(request.prompt, request.style)
        return {
            "success": True,
            "image_base64": image_base64,
            "prompt": request.prompt
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/generate/video-script")
async def generate_video_script(request: GenerateVideoScriptRequest):
    """Generate a video script using AI from a prompt"""
    try:
        result = await generate_video_script_with_ai(request.prompt, request.duration)
        return {
            "success": True,
            "script": result["script"],
            "prompt": request.prompt,
            "duration": request.duration
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/generated/images")
async def get_generated_images():
    """Get list of AI generated images"""
    images = await db.generated_images.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return {"images": images}

# ==================== MEMORY ROUTES ====================

@api_router.get("/memories")
async def get_memories(user_id: str = "default"):
    memories = await db.memories.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    return {"memories": memories}

@api_router.post("/memories")
async def create_memory(key: str, value: str, user_id: str = "default"):
    mem = Memory(user_id=user_id, key=key, value=value)
    mem_dict = mem.model_dump()
    mem_dict['created_at'] = mem_dict['created_at'].isoformat()
    await db.memories.insert_one(mem_dict)
    return {"message": "Memory saved", "id": mem.id}

@api_router.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str):
    result = await db.memories.delete_one({"id": memory_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"message": "Memory deleted"}

# ==================== SESSION ROUTES ====================

@api_router.post("/sessions")
async def create_session(title: str = "Nueva Conversacion"):
    session_id = str(uuid.uuid4())
    new_conv = Conversation(session_id=session_id, title=title)
    conv_dict = new_conv.model_dump()
    conv_dict['created_at'] = conv_dict['created_at'].isoformat()
    conv_dict['updated_at'] = conv_dict['updated_at'].isoformat()
    await db.conversations.insert_one(conv_dict)
    return {"session_id": session_id, "title": title}

@api_router.get("/sessions")
async def get_sessions():
    sessions = await db.conversations.find(
        {}, {"_id": 0, "session_id": 1, "title": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).to_list(100)
    return {"sessions": sessions}

@api_router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    conv = await db.conversations.find_one({"session_id": session_id}, {"_id": 0})
    if not conv:
        raise HTTPException(status_code=404, detail="Session not found")
    return conv

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    result = await db.conversations.delete_one({"session_id": session_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}

# ==================== FILE ROUTES ====================

@api_router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'png'
        filename = f"{file_id}.{ext}"
        filepath = UPLOADS_DIR / 'images' / filename
        
        async with aiofiles.open(filepath, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        await db.files.insert_one({
            "id": file_id, "filename": filename, "original_name": file.filename,
            "type": "image", "path": str(filepath), "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"id": file_id, "filename": filename, "url": f"/api/files/images/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/files/images/{filename}")
async def get_image(filename: str):
    filepath = UPLOADS_DIR / 'images' / filename
    if not filepath.exists():
        # Try generated folder
        filepath = UPLOADS_DIR / 'generated' / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

# ==================== WEBSITE ROUTES ====================

@api_router.post("/websites")
async def create_website(website: WebsiteCreate):
    try:
        website_id = str(uuid.uuid4())
        full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{website.name}</title>
    <style>{website.css}</style>
</head>
<body>
{website.html}
    <script>{website.js}</script>
</body>
</html>"""
        
        filename = f"{website_id}.html"
        filepath = UPLOADS_DIR / 'websites' / filename
        
        async with aiofiles.open(filepath, 'w') as f:
            await f.write(full_html)
        
        await db.websites.insert_one({
            "id": website_id, "name": website.name, "filename": filename,
            "path": str(filepath), "html": website.html, "css": website.css, "js": website.js,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"id": website_id, "name": website.name, "url": f"/api/websites/{website_id}/preview"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/websites")
async def list_websites():
    websites = await db.websites.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"websites": websites}

@api_router.get("/websites/{website_id}")
async def get_website(website_id: str):
    website = await db.websites.find_one({"id": website_id}, {"_id": 0})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    return website

@api_router.get("/websites/{website_id}/preview")
async def preview_website(website_id: str):
    website = await db.websites.find_one({"id": website_id})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    filepath = Path(website['path'])
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath, media_type="text/html")

@api_router.put("/websites/{website_id}")
async def update_website(website_id: str, website: WebsiteCreate):
    existing = await db.websites.find_one({"id": website_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Website not found")
    
    full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{website.name}</title>
    <style>{website.css}</style>
</head>
<body>
{website.html}
    <script>{website.js}</script>
</body>
</html>"""
    
    filepath = Path(existing['path'])
    async with aiofiles.open(filepath, 'w') as f:
        await f.write(full_html)
    
    await db.websites.update_one(
        {"id": website_id},
        {"$set": {"name": website.name, "html": website.html, "css": website.css, "js": website.js}}
    )
    
    return {"message": "Website updated", "id": website_id}

@api_router.delete("/websites/{website_id}")
async def delete_website(website_id: str):
    website = await db.websites.find_one({"id": website_id})
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    filepath = Path(website['path'])
    if filepath.exists():
        filepath.unlink()
    await db.websites.delete_one({"id": website_id})
    return {"message": "Website deleted"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
