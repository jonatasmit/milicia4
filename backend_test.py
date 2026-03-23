import requests
import sys
import json
from datetime import datetime

class MilitarySimulatorAPITester:
    def __init__(self, base_url="https://general-command-ops.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_pins = []
        self.created_routes = []
        self.created_zones = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
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

    def test_operational_status(self):
        """Test API operational status"""
        success, response = self.run_test(
            "API Operational Status",
            "GET",
            "",
            200
        )
        return success and response.get('status') == 'operational'

    def test_map_state_empty(self):
        """Test map state endpoint returns arrays"""
        success, response = self.run_test(
            "Map State (Empty)",
            "GET",
            "map-state",
            200
        )
        if success:
            has_pins = 'pins' in response and isinstance(response['pins'], list)
            has_routes = 'routes' in response and isinstance(response['routes'], list)
            has_zones = 'zones' in response and isinstance(response['zones'], list)
            print(f"   Pins: {len(response.get('pins', []))}, Routes: {len(response.get('routes', []))}, Zones: {len(response.get('zones', []))}")
            return has_pins and has_routes and has_zones
        return False

    def test_create_hq_pin(self):
        """Test creating HQ pin"""
        pin_data = {
            "lat": -22.9435,
            "lng": -43.3580,
            "pin_type": "hq",
            "label": "Quartel General"
        }
        success, response = self.run_test(
            "Create HQ Pin",
            "POST",
            "pins",
            200,
            data=pin_data
        )
        if success and 'id' in response:
            self.created_pins.append(response['id'])
            print(f"   Created pin ID: {response['id']}")
            return True
        return False

    def test_create_ally_pin(self):
        """Test creating Ally pin"""
        pin_data = {
            "lat": -22.9440,
            "lng": -43.3590,
            "pin_type": "ally"
        }
        success, response = self.run_test(
            "Create Ally Pin",
            "POST",
            "pins",
            200,
            data=pin_data
        )
        if success and 'id' in response:
            self.created_pins.append(response['id'])
            print(f"   Created pin ID: {response['id']}")
            return True
        return False

    def test_create_enemy_pin(self):
        """Test creating Enemy pin"""
        pin_data = {
            "lat": -22.9450,
            "lng": -43.3570,
            "pin_type": "enemy"
        }
        success, response = self.run_test(
            "Create Enemy Pin",
            "POST",
            "pins",
            200,
            data=pin_data
        )
        if success and 'id' in response:
            self.created_pins.append(response['id'])
            print(f"   Created pin ID: {response['id']}")
            return True
        return False

    def test_get_pins(self):
        """Test getting all pins"""
        success, response = self.run_test(
            "Get All Pins",
            "GET",
            "pins",
            200
        )
        if success:
            print(f"   Found {len(response)} pins")
            return len(response) >= len(self.created_pins)
        return False

    def test_update_pin(self):
        """Test updating pin position (drag functionality)"""
        if not self.created_pins:
            print("❌ No pins to update")
            return False
            
        pin_id = self.created_pins[0]
        update_data = {
            "lat": -22.9445,
            "lng": -43.3585
        }
        success, response = self.run_test(
            "Update Pin Position",
            "PUT",
            f"pins/{pin_id}",
            200,
            data=update_data
        )
        return success

    def test_create_attack_route(self):
        """Test creating attack route"""
        route_data = {
            "points": [
                {"lat": -22.9435, "lng": -43.3580},
                {"lat": -22.9440, "lng": -43.3590},
                {"lat": -22.9450, "lng": -43.3570}
            ],
            "route_type": "attack"
        }
        success, response = self.run_test(
            "Create Attack Route",
            "POST",
            "routes",
            200,
            data=route_data
        )
        if success and 'id' in response:
            self.created_routes.append(response['id'])
            print(f"   Created route ID: {response['id']}")
            return True
        return False

    def test_create_defense_route(self):
        """Test creating defense route"""
        route_data = {
            "points": [
                {"lat": -22.9430, "lng": -43.3575},
                {"lat": -22.9435, "lng": -43.3585}
            ],
            "route_type": "defense"
        }
        success, response = self.run_test(
            "Create Defense Route",
            "POST",
            "routes",
            200,
            data=route_data
        )
        if success and 'id' in response:
            self.created_routes.append(response['id'])
            print(f"   Created route ID: {response['id']}")
            return True
        return False

    def test_get_routes(self):
        """Test getting all routes"""
        success, response = self.run_test(
            "Get All Routes",
            "GET",
            "routes",
            200
        )
        if success:
            print(f"   Found {len(response)} routes")
            return len(response) >= len(self.created_routes)
        return False

    def test_create_danger_zone(self):
        """Test creating danger zone"""
        zone_data = {
            "lat": -22.9445,
            "lng": -43.3575,
            "radius": 200,
            "zone_type": "danger"
        }
        success, response = self.run_test(
            "Create Danger Zone",
            "POST",
            "zones",
            200,
            data=zone_data
        )
        if success and 'id' in response:
            self.created_zones.append(response['id'])
            print(f"   Created zone ID: {response['id']}")
            return True
        return False

    def test_create_protection_zone(self):
        """Test creating protection zone"""
        zone_data = {
            "lat": -22.9440,
            "lng": -43.3580,
            "radius": 150,
            "zone_type": "protection"
        }
        success, response = self.run_test(
            "Create Protection Zone",
            "POST",
            "zones",
            200,
            data=zone_data
        )
        if success and 'id' in response:
            self.created_zones.append(response['id'])
            print(f"   Created zone ID: {response['id']}")
            return True
        return False

    def test_get_zones(self):
        """Test getting all zones"""
        success, response = self.run_test(
            "Get All Zones",
            "GET",
            "zones",
            200
        )
        if success:
            print(f"   Found {len(response)} zones")
            return len(response) >= len(self.created_zones)
        return False

    def test_map_state_with_data(self):
        """Test map state endpoint with created data"""
        success, response = self.run_test(
            "Map State (With Data)",
            "GET",
            "map-state",
            200
        )
        if success:
            pins_count = len(response.get('pins', []))
            routes_count = len(response.get('routes', []))
            zones_count = len(response.get('zones', []))
            print(f"   Pins: {pins_count}, Routes: {routes_count}, Zones: {zones_count}")
            return pins_count > 0 and routes_count > 0 and zones_count > 0
        return False

    def test_clear_all(self):
        """Test clearing all map data"""
        success, response = self.run_test(
            "Clear All Map Data",
            "DELETE",
            "clear-all",
            200
        )
        if success:
            # Verify data is cleared
            success_verify, verify_response = self.run_test(
                "Verify Clear All",
                "GET",
                "map-state",
                200
            )
            if success_verify:
                pins_count = len(verify_response.get('pins', []))
                routes_count = len(verify_response.get('routes', []))
                zones_count = len(verify_response.get('zones', []))
                print(f"   After clear - Pins: {pins_count}, Routes: {routes_count}, Zones: {zones_count}")
                return pins_count == 0 and routes_count == 0 and zones_count == 0
        return False

def main():
    print("🚀 Starting Military Simulator API Tests")
    print("=" * 50)
    
    tester = MilitarySimulatorAPITester()
    
    # Test sequence
    tests = [
        tester.test_operational_status,
        tester.test_map_state_empty,
        tester.test_create_hq_pin,
        tester.test_create_ally_pin,
        tester.test_create_enemy_pin,
        tester.test_get_pins,
        tester.test_update_pin,
        tester.test_create_attack_route,
        tester.test_create_defense_route,
        tester.test_get_routes,
        tester.test_create_danger_zone,
        tester.test_create_protection_zone,
        tester.test_get_zones,
        tester.test_map_state_with_data,
        tester.test_clear_all,
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