#!/usr/bin/env python3
"""
NEXA ROBOT V2 Backend API Testing Suite
Tests all backend endpoints and functionality
"""

import requests
import sys
import json
import time
from datetime import datetime

class NexaAPITester:
    def __init__(self, base_url="https://smart-nexa-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        try:
            print(f"🔍 Testing {name}...")
            print(f"    URL: {url}")
            
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            
            try:
                response_json = response.json()
            except:
                response_json = {"raw_response": response.text}
            
            details = f"Status: {response.status_code} (expected {expected_status})"
            
            self.log_test(name, success, details, response_json)
            
            return success, response_json

        except Exception as e:
            error_details = f"Exception: {str(e)}"
            self.log_test(name, False, error_details)
            return False, {}

    def test_status_endpoint(self):
        """Test /api/status endpoint"""
        success, response = self.run_test(
            "Status Endpoint",
            "GET",
            "status",
            200
        )
        
        if success:
            # Verify response structure
            required_fields = ['status', 'version', 'features', 'llm_connected']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test(
                    "Status Response Structure",
                    False,
                    f"Missing fields: {missing_fields}",
                    response
                )
            else:
                # Check if features are correct
                expected_features = ['chat', 'voice_synthesis', 'voice_recognition', 'vision', 'memory']
                actual_features = response.get('features', [])
                missing_features = [f for f in expected_features if f not in actual_features]
                
                if missing_features:
                    self.log_test(
                        "Status Features Check",
                        False,
                        f"Missing features: {missing_features}",
                        response
                    )
                else:
                    self.log_test(
                        "Status Response Structure",
                        True,
                        f"All required fields present. LLM Connected: {response.get('llm_connected')}",
                        response
                    )
        
        return success

    def test_create_session(self):
        """Test creating a new session"""
        success, response = self.run_test(
            "Create Session",
            "POST",
            "sessions",
            200,
            data={"title": "Test Session"}
        )
        
        if success and 'session_id' in response:
            self.session_id = response['session_id']
            self.log_test(
                "Session ID Retrieved",
                True,
                f"Session ID: {self.session_id}",
                response
            )
        elif success:
            self.log_test(
                "Session ID Missing",
                False,
                "Response missing session_id field",
                response
            )
        
        return success

    def test_get_sessions(self):
        """Test getting all sessions"""
        success, response = self.run_test(
            "Get Sessions List",
            "GET",
            "sessions",
            200
        )
        
        if success:
            if 'sessions' in response:
                sessions_count = len(response['sessions'])
                self.log_test(
                    "Sessions List Structure",
                    True,
                    f"Found {sessions_count} sessions",
                    {"sessions_count": sessions_count}
                )
            else:
                self.log_test(
                    "Sessions List Structure",
                    False,
                    "Response missing 'sessions' field",
                    response
                )
        
        return success

    def test_get_specific_session(self):
        """Test getting a specific session"""
        if not self.session_id:
            self.log_test(
                "Get Specific Session",
                False,
                "No session_id available for testing"
            )
            return False
        
        success, response = self.run_test(
            "Get Specific Session",
            "GET",
            f"sessions/{self.session_id}",
            200
        )
        
        if success:
            required_fields = ['session_id', 'title', 'messages']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test(
                    "Session Details Structure",
                    False,
                    f"Missing fields: {missing_fields}",
                    response
                )
            else:
                self.log_test(
                    "Session Details Structure",
                    True,
                    f"Session has {len(response.get('messages', []))} messages",
                    {"message_count": len(response.get('messages', []))}
                )
        
        return success

    def test_chat_endpoint(self):
        """Test chat functionality"""
        if not self.session_id:
            self.log_test(
                "Chat Test",
                False,
                "No session_id available for testing"
            )
            return False
        
        test_message = "Hola NEXA, ¿cómo estás? Este es un mensaje de prueba."
        
        success, response = self.run_test(
            "Chat Message",
            "POST",
            "chat",
            200,
            data={
                "message": test_message,
                "session_id": self.session_id,
                "include_history": True
            }
        )
        
        if success:
            required_fields = ['response', 'session_id', 'message_id']
            missing_fields = [field for field in required_fields if field not in response]
            
            if missing_fields:
                self.log_test(
                    "Chat Response Structure",
                    False,
                    f"Missing fields: {missing_fields}",
                    response
                )
            else:
                response_text = response.get('response', '')
                response_length = len(response_text)
                
                # Check if we got a meaningful response
                if response_length > 10:
                    self.log_test(
                        "Chat Response Quality",
                        True,
                        f"Received {response_length} character response",
                        {"response_preview": response_text[:100] + "..." if response_length > 100 else response_text}
                    )
                else:
                    self.log_test(
                        "Chat Response Quality",
                        False,
                        f"Response too short ({response_length} chars): {response_text}",
                        response
                    )
        
        return success

    def test_chat_with_history(self):
        """Test chat with conversation history"""
        if not self.session_id:
            self.log_test(
                "Chat with History Test",
                False,
                "No session_id available for testing"
            )
            return False
        
        # Send a follow-up message that references previous conversation
        follow_up_message = "¿Puedes recordar lo que te dije en el mensaje anterior?"
        
        success, response = self.run_test(
            "Chat with History",
            "POST",
            "chat",
            200,
            data={
                "message": follow_up_message,
                "session_id": self.session_id,
                "include_history": True
            }
        )
        
        if success:
            response_text = response.get('response', '')
            # Check if the response seems to reference previous context
            context_indicators = ['anterior', 'dijiste', 'mensaje', 'prueba', 'hola']
            has_context = any(indicator in response_text.lower() for indicator in context_indicators)
            
            self.log_test(
                "History Context Check",
                has_context,
                f"Response {'includes' if has_context else 'lacks'} context indicators",
                {"response_preview": response_text[:150] + "..." if len(response_text) > 150 else response_text}
            )
        
        return success

    def test_delete_session(self):
        """Test deleting a session"""
        if not self.session_id:
            self.log_test(
                "Delete Session Test",
                False,
                "No session_id available for testing"
            )
            return False
        
        success, response = self.run_test(
            "Delete Session",
            "DELETE",
            f"sessions/{self.session_id}",
            200
        )
        
        if success:
            # Verify the session was actually deleted
            verify_success, verify_response = self.run_test(
                "Verify Session Deleted",
                "GET",
                f"sessions/{self.session_id}",
                404
            )
            
            if not verify_success:
                self.log_test(
                    "Session Deletion Verification",
                    False,
                    "Session still exists after deletion",
                    verify_response
                )
        
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting NEXA ROBOT V2 Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_status_endpoint,
            self.test_create_session,
            self.test_get_sessions,
            self.test_get_specific_session,
            self.test_chat_endpoint,
            self.test_chat_with_history,
            self.test_delete_session
        ]
        
        for test_func in tests:
            try:
                test_func()
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                print(f"❌ Test {test_func.__name__} failed with exception: {e}")
                self.log_test(test_func.__name__, False, f"Exception: {str(e)}")
        
        # Print summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        # Return results for further processing
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run*100) if self.tests_run > 0 else 0,
            "test_details": self.test_results
        }

def main():
    """Main test execution"""
    tester = NexaAPITester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if results["failed_tests"] > 0:
        print(f"\n❌ {results['failed_tests']} tests failed")
        return 1
    else:
        print(f"\n✅ All {results['passed_tests']} tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())