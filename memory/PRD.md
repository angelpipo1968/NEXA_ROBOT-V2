# NEXA ROBOT V2 - Product Requirements Document

## Project Overview
**Name:** NEXA ROBOT V2  
**Version:** 3.0.0  
**Type:** AI Chat Application with Advanced Features  
**Language:** Spanish (Primary)  
**Last Updated:** January 2025

## Original Problem Statement
The user initially had a local Python application named NEXA_ROBOT_V2 with errors. The request evolved to abandoning the local application and creating a new, professional, all-in-one web version from scratch with:
1. Core AI chat functionality
2. Voice synthesis (female voice, clean output)
3. Advanced features: Memory, intelligence, creativity, microphone, website builder, photo/video editors
4. AI generation: Web pages, photos, and videos using prompts
5. UI/UX: qwen.ai style with collapsible sidebar and settings page
6. Input bar with feature buttons (Thinking, Search, Upload)

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React (JavaScript)
- **Database:** MongoDB
- **AI:** Emergent LLM Key (OpenAI GPT-4.1, GPT Image 1)
- **Voice:** Web Speech API

## Architecture
```
/app/
├── backend/
│   ├── server.py       # FastAPI with all endpoints
│   ├── uploads/        # Generated files storage
│   └── .env            # MONGO_URL, EMERGENT_LLM_KEY
└── frontend/
    └── src/
        ├── App.js      # Main React component
        └── App.css     # All styles (qwen.ai theme)
```

## Implemented Features (P0 - Core)

### 1. Chat System
- [x] Real-time AI chat with GPT-4.1
- [x] Session management (create, switch, delete)
- [x] Conversation history
- [x] Context-aware responses with memory

### 2. Input Bar Features (qwen.ai style)
- [x] **+ Button (Feature Menu):**
  - Adjuntar archivo (File upload)
  - Generar imagen
  - Crear página web
  - Crear guion de video
- [x] **Thinking Mode Button (Sparkles):** Deep reasoning mode
- [x] **Search Mode Button (Globe):** Factual search mode
- [x] **Microphone Button:** Speech-to-text input
- [x] **Send Button:** Submit message

### 3. Voice Synthesis
- [x] Auto-speak toggle ("Voz ON/OFF")
- [x] Clean text output (no emojis, markdown)
- [x] Configurable speech rate
- [x] Multiple voice selection
- [x] Browser's Web Speech API integration

### 4. Settings Page (Functional)
- [x] **General:**
  - Theme switching (System/Light/Dark) - Real-time
  - Language selection (ES/EN/PT/FR)
  - Voice selection from browser voices
  - Auto-speak toggle
  - Speech rate slider
- [x] **Interface:**
  - Font size (Small/Medium/Large)
  - Show avatars toggle
  - Animations toggle
- [x] **Models:**
  - Chat model selection
  - Image model selection
  - Temperature/Creativity slider
- [x] **Chats:**
  - Save history toggle
  - Context messages count
  - Clear all chats button
- [x] **Personalization:**
  - Assistant name
  - User name
  - Custom instructions
- [x] **Account:** User info display
- [x] **About:** App version and info

### 5. AI Generation
- [x] **Image Generation:** GPT Image 1, returns base64
- [x] **Website Generation:** Full HTML/CSS/JS code
- [x] **Video Script Generation:** Complete storyboards

### 6. UI/UX (qwen.ai inspired)
- [x] Dark theme (default)
- [x] Light theme support
- [x] Collapsible sidebar
- [x] Welcome screen with feature cards
- [x] Typing indicator
- [x] Message actions (speak, copy)
- [x] Code block rendering
- [x] Generated image display

## API Endpoints

### Core
- `GET /api/status` - App status and features
- `POST /api/chat` - Send message with modes

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/{id}` - Get session
- `DELETE /api/sessions/{id}` - Delete session

### Generation
- `POST /api/generate/image` - Generate AI image
- `POST /api/generate/website` - Generate website code
- `POST /api/generate/video-script` - Generate video script

### Memory
- `GET /api/memories` - List memories
- `POST /api/memories` - Create memory
- `DELETE /api/memories/{id}` - Delete memory

### Files & Websites
- `POST /api/upload/image` - Upload image
- `GET /api/files/images/{filename}` - Get image
- `CRUD /api/websites` - Website management

## Testing Status
- **Backend:** 100% (15/15 tests passed)
- **Frontend:** 100% (all UI tests passed)
- **Test File:** `/app/tests/test_nexa_api.py`

## Known Issues
- None currently

## Backlog (Future Tasks - P2/P3)

### P2 - Enhancements
- [ ] Real web search integration (external API)
- [ ] File analysis (PDF, DOC processing)
- [ ] Image editing tools
- [ ] Video editing interface
- [ ] Export chat history

### P3 - Advanced Features
- [ ] User authentication
- [ ] Multiple language support for AI
- [ ] Voice-to-voice conversation
- [ ] Collaborative sessions
- [ ] Plugin system

## Environment Variables
```
# Backend (.env)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="nexa_robot_db"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY="sk-emergent-..."

# Frontend (.env)
REACT_APP_BACKEND_URL=https://smart-nexa-app.preview.emergentagent.com
```

## Deployment Notes
- Backend runs on port 8001 (supervisor-managed)
- Frontend runs on port 3000 (hot reload enabled)
- All API routes prefixed with /api
- MongoDB for data persistence
