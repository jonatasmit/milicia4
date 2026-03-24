import requests
import sys
import json
import base64
from datetime import datetime

class MiliciaDigitalAPITester:
    def __init__(self, base_url="https://general-command-ops.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_user = "admin"
        self.admin_pass = "0972044108A!bc"
        self.session_id = f"test_session_{datetime.now().strftime('%H%M%S')}"

    def get_auth_headers(self):
        """Get Basic Auth headers for admin endpoints"""
        credentials = base64.b64encode(f"{self.admin_user}:{self.admin_pass}".encode()).decode()
        return {
            'Content-Type': 'application/json',
            'Authorization': f'Basic {credentials}'
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, use_auth=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = self.get_auth_headers() if use_auth else {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'message' in response_data:
                        print(f"   Response: {response_data['message']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_health(self):
        """Test API health check"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success and response.get('status') == 'online'

    def test_track_page_view(self):
        """Test tracking page view event"""
        event_data = {
            "event_type": "page_view",
            "session_id": self.session_id,
            "user_agent": "Test Browser",
            "referrer": "https://test.com",
            "xp": 0,
            "creditos": 0
        }
        success, response = self.run_test(
            "Track Page View Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        return success and response.get('status') == 'tracked'

    def test_track_play_click(self):
        """Test tracking play button click"""
        event_data = {
            "event_type": "click_play",
            "session_id": self.session_id,
            "xp": 0,
            "creditos": 0
        }
        success, response = self.run_test(
            "Track Play Click Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        return success and response.get('status') == 'tracked'

    def test_track_mission_start(self):
        """Test tracking mission start"""
        event_data = {
            "event_type": "mission_start",
            "session_id": self.session_id,
            "mission_id": 1
        }
        success, response = self.run_test(
            "Track Mission Start Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        return success and response.get('status') == 'tracked'

    def test_track_step_complete(self):
        """Test tracking step completion"""
        event_data = {
            "event_type": "step_complete",
            "session_id": self.session_id,
            "mission_id": 1,
            "extra_data": {"step": 1}
        }
        success, response = self.run_test(
            "Track Step Complete Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        return success and response.get('status') == 'tracked'

    def test_track_mission_complete(self):
        """Test tracking mission completion"""
        event_data = {
            "event_type": "mission_complete",
            "session_id": self.session_id,
            "mission_id": 1,
            "creditos": 1
        }
        success, response = self.run_test(
            "Track Mission Complete Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        return success and response.get('status') == 'tracked'

    def test_track_whatsapp_click(self):
        """Test tracking WhatsApp click"""
        event_data = {
            "event_type": "whatsapp_click",
            "session_id": self.session_id,
            "extra_data": {"from": "float", "xp": 125, "creditos": 1}
        }
        success, response = self.run_test(
            "Track WhatsApp Click Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        return success and response.get('status') == 'tracked'

    def test_admin_auth_invalid(self):
        """Test admin authentication with invalid credentials"""
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + base64.b64encode(b"wrong:credentials").decode()
        }
        
        self.tests_run += 1
        print(f"\n🔍 Testing Admin Auth (Invalid Credentials)...")
        
        try:
            response = requests.get(f"{self.base_url}/admin/analytics", headers=headers, timeout=10)
            success = response.status_code == 401
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code} (Correctly rejected)")
                return True
            else:
                print(f"❌ Failed - Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def test_admin_analytics(self):
        """Test admin analytics endpoint"""
        success, response = self.run_test(
            "Admin Analytics",
            "GET",
            "admin/analytics",
            200,
            use_auth=True
        )
        if success:
            required_fields = ['total_visits', 'unique_sessions', 'play_clicks', 'missions_started', 
                             'missions_completed', 'whatsapp_clicks', 'conversion_rate', 'avg_xp']
            has_all_fields = all(field in response for field in required_fields)
            print(f"   Analytics data: visits={response.get('total_visits')}, conversions={response.get('whatsapp_clicks')}")
            return has_all_fields
        return False

    def test_admin_events(self):
        """Test admin events endpoint"""
        success, response = self.run_test(
            "Admin Events List",
            "GET",
            "admin/events?limit=10",
            200,
            use_auth=True
        )
        if success:
            print(f"   Found {len(response)} events")
            return isinstance(response, list)
        return False

    def test_admin_funnel(self):
        """Test admin funnel endpoint"""
        success, response = self.run_test(
            "Admin Conversion Funnel",
            "GET",
            "admin/funnel",
            200,
            use_auth=True
        )
        if success:
            has_funnel = 'funnel' in response and isinstance(response['funnel'], list)
            if has_funnel:
                print(f"   Funnel has {len(response['funnel'])} steps")
            return has_funnel
        return False

    def test_admin_insights(self):
        """Test admin insights endpoint"""
        success, response = self.run_test(
            "Admin AI Insights",
            "GET",
            "admin/insights",
            200,
            use_auth=True
        )
        if success:
            has_insights = 'insights' in response and isinstance(response['insights'], list)
            if has_insights:
                print(f"   Generated {len(response['insights'])} insights")
            return has_insights
        return False

def main():
    print("🚀 Starting Milícia Digital API Tests")
    print("=" * 50)
    
    tester = MiliciaDigitalAPITester()
    
    # Test sequence
    tests = [
        tester.test_api_health,
        tester.test_track_page_view,
        tester.test_track_play_click,
        tester.test_track_mission_start,
        tester.test_track_step_complete,
        tester.test_track_mission_complete,
        tester.test_track_whatsapp_click,
        tester.test_admin_auth_invalid,
        tester.test_admin_analytics,
        tester.test_admin_events,
        tester.test_admin_funnel,
        tester.test_admin_insights,
    ]
    
    failed_tests = []
    
    for test in tests:
        try:
            if not test():
                failed_tests.append(test.__name__)
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {str(e)}")
            failed_tests.append(test.__name__)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run}")
    
    if failed_tests:
        print(f"❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())