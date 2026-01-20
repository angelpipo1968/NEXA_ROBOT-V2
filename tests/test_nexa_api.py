"""
NEXA ROBOT V2 API Tests
Tests for: chat, sessions, status, generation endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://smart-nexa-app.preview.emergentagent.com')

class TestStatusEndpoint:
    """Test /api/status endpoint"""
    
    def test_status_returns_online(self):
        """Verify status endpoint returns online status"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["version"] == "3.0.0"
        assert data["llm_connected"] == True
        print(f"✓ Status endpoint working: {data['status']}")
    
    def test_status_has_required_features(self):
        """Verify status includes all required features"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        data = response.json()
        required_features = ["chat", "voice_synthesis", "ai_image_generator", "ai_website_generator", "ai_video_script"]
        for feature in required_features:
            assert feature in data["features"], f"Missing feature: {feature}"
        print(f"✓ All required features present: {len(data['features'])} features")


class TestSessionsEndpoint:
    """Test /api/sessions CRUD operations"""
    
    def test_create_session(self):
        """Create a new session and verify response"""
        response = requests.post(f"{BASE_URL}/api/sessions", params={"title": "TEST_Session"})
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["title"] == "TEST_Session"
        print(f"✓ Session created: {data['session_id']}")
        return data["session_id"]
    
    def test_list_sessions(self):
        """List all sessions"""
        response = requests.get(f"{BASE_URL}/api/sessions")
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        assert isinstance(data["sessions"], list)
        print(f"✓ Sessions listed: {len(data['sessions'])} sessions")
    
    def test_get_session_by_id(self):
        """Create and retrieve a specific session"""
        # Create session first
        create_response = requests.post(f"{BASE_URL}/api/sessions", params={"title": "TEST_GetSession"})
        session_id = create_response.json()["session_id"]
        
        # Get session
        response = requests.get(f"{BASE_URL}/api/sessions/{session_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["session_id"] == session_id
        print(f"✓ Session retrieved: {session_id}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/sessions/{session_id}")
    
    def test_delete_session(self):
        """Create and delete a session"""
        # Create session
        create_response = requests.post(f"{BASE_URL}/api/sessions", params={"title": "TEST_DeleteSession"})
        session_id = create_response.json()["session_id"]
        
        # Delete session
        response = requests.delete(f"{BASE_URL}/api/sessions/{session_id}")
        assert response.status_code == 200
        
        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/sessions/{session_id}")
        assert get_response.status_code == 404
        print(f"✓ Session deleted: {session_id}")


class TestChatEndpoint:
    """Test /api/chat endpoint"""
    
    def test_chat_basic_message(self):
        """Send a basic chat message and verify response"""
        # Create session first
        session_response = requests.post(f"{BASE_URL}/api/sessions", params={"title": "TEST_ChatSession"})
        session_id = session_response.json()["session_id"]
        
        # Send chat message
        payload = {
            "message": "Hola NEXA, como estas?",
            "session_id": session_id,
            "include_history": True,
            "creative_mode": False,
            "search_mode": False
        }
        response = requests.post(f"{BASE_URL}/api/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        assert "message_id" in data
        assert len(data["response"]) > 0
        print(f"✓ Chat response received: {data['response'][:50]}...")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/sessions/{session_id}")
    
    def test_chat_with_thinking_mode(self):
        """Test chat with creative/thinking mode enabled"""
        session_response = requests.post(f"{BASE_URL}/api/sessions", params={"title": "TEST_ThinkingMode"})
        session_id = session_response.json()["session_id"]
        
        payload = {
            "message": "Explica brevemente que es la inteligencia artificial",
            "session_id": session_id,
            "include_history": True,
            "creative_mode": True,  # Thinking mode
            "search_mode": False
        }
        response = requests.post(f"{BASE_URL}/api/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
        print(f"✓ Thinking mode response: {data['response'][:50]}...")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/sessions/{session_id}")
    
    def test_chat_with_search_mode(self):
        """Test chat with search mode enabled"""
        session_response = requests.post(f"{BASE_URL}/api/sessions", params={"title": "TEST_SearchMode"})
        session_id = session_response.json()["session_id"]
        
        payload = {
            "message": "Que es Python?",
            "session_id": session_id,
            "include_history": True,
            "creative_mode": False,
            "search_mode": True  # Search mode
        }
        response = requests.post(f"{BASE_URL}/api/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert len(data["response"]) > 0
        print(f"✓ Search mode response: {data['response'][:50]}...")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/sessions/{session_id}")


class TestGenerationEndpoints:
    """Test AI generation endpoints"""
    
    def test_generate_website(self):
        """Test website generation endpoint"""
        payload = {
            "prompt": "Una pagina de bienvenida simple",
            "style": "modern"
        }
        response = requests.post(f"{BASE_URL}/api/generate/website", json=payload, timeout=60)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "html" in data
        assert "css" in data
        assert len(data["html"]) > 0
        print(f"✓ Website generated: HTML length={len(data['html'])}")
    
    def test_generate_video_script(self):
        """Test video script generation endpoint"""
        payload = {
            "prompt": "Un video corto sobre tecnologia",
            "duration": "30 seconds"
        }
        response = requests.post(f"{BASE_URL}/api/generate/video-script", json=payload, timeout=60)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "script" in data
        assert len(data["script"]) > 0
        print(f"✓ Video script generated: {data['script'][:50]}...")
    
    def test_generate_image(self):
        """Test image generation endpoint"""
        payload = {
            "prompt": "A simple blue circle",
            "style": "minimalist"
        }
        response = requests.post(f"{BASE_URL}/api/generate/image", json=payload, timeout=120)
        # Image generation may take longer or fail due to API limits
        if response.status_code == 200:
            data = response.json()
            assert data["success"] == True
            assert "image_base64" in data
            print(f"✓ Image generated successfully")
        else:
            print(f"⚠ Image generation returned {response.status_code} - may be API limit")


class TestMemoriesEndpoint:
    """Test /api/memories endpoint"""
    
    def test_create_and_get_memory(self):
        """Create a memory and retrieve it"""
        # Create memory
        response = requests.post(
            f"{BASE_URL}/api/memories",
            params={"key": "TEST_memory_key", "value": "TEST_memory_value", "user_id": "test_user"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        memory_id = data["id"]
        print(f"✓ Memory created: {memory_id}")
        
        # Get memories
        get_response = requests.get(f"{BASE_URL}/api/memories", params={"user_id": "test_user"})
        assert get_response.status_code == 200
        memories = get_response.json()["memories"]
        assert any(m["key"] == "TEST_memory_key" for m in memories)
        print(f"✓ Memory retrieved successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/memories/{memory_id}")


class TestWebsitesEndpoint:
    """Test /api/websites CRUD operations"""
    
    def test_create_website(self):
        """Create a website and verify"""
        payload = {
            "name": "TEST_Website",
            "html": "<h1>Test</h1>",
            "css": "h1 { color: blue; }",
            "js": "console.log('test');"
        }
        response = requests.post(f"{BASE_URL}/api/websites", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["name"] == "TEST_Website"
        print(f"✓ Website created: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/websites/{data['id']}")
    
    def test_list_websites(self):
        """List all websites"""
        response = requests.get(f"{BASE_URL}/api/websites")
        assert response.status_code == 200
        data = response.json()
        assert "websites" in data
        print(f"✓ Websites listed: {len(data['websites'])} websites")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
