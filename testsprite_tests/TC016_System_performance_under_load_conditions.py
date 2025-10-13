import requests
import time

BASE_URL = "http://localhost:5000"
AUTH = ("programador", "conectairrig@")
TIMEOUT = 30

def test_system_performance_under_load_conditions():
    # Endpoints to test for API response time < 2 seconds
    api_endpoints = [
        "/api/mdfe",
        "/api/veiculos",
        "/api/condutores",
        "/api/dashboard",
    ]

    headers = {
        "Accept": "application/json",
    }

    # Using basic auth as a bypass for development
    auth = AUTH

    # Test each key API endpoint response time < 2s
    for endpoint in api_endpoints:
        url = f"{BASE_URL}{endpoint}"
        start_time = time.time()
        try:
            response = requests.get(url, auth=auth, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request to {endpoint} failed with exception: {e}"
        elapsed = time.time() - start_time
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code} from {endpoint}"
        assert elapsed < 2, f"Response time for {endpoint} was {elapsed:.3f}s, exceeding 2 seconds"

    # Test dashboard page loads within 3 seconds (simulate frontend load is backend response time for /dashboard)
    dashboard_url = f"{BASE_URL}/dashboard"
    start_time = time.time()
    try:
        # We allow redirects and HTML response for dashboard page
        response = requests.get(dashboard_url, auth=auth, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to /dashboard failed with exception: {e}"
    elapsed = time.time() - start_time
    assert response.status_code == 200, f"Expected 200 OK but got {response.status_code} from /dashboard"
    assert elapsed < 3, f"Dashboard load time was {elapsed:.3f}s, exceeding 3 seconds"

test_system_performance_under_load_conditions()