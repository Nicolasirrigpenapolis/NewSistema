import requests

BASE_URL = "http://localhost:5000"
AUTH = ("programador", "conectairrig@")  # Basic token auth to bypass in development


def test_user_login_with_invalid_credentials():
    url = f"{BASE_URL}/api/auth"
    headers = {
        "Content-Type": "application/json"
    }
    invalid_payloads = [
        {"username": "invaliduser", "password": "wrongpassword"},
        {"username": "programador", "password": "wrongpassword"},
        {"username": "invaliduser", "password": "conectairrig@"},
        {"username": "", "password": ""},
        {"username": "programador", "password": ""},
    ]

    for payload in invalid_payloads:
        try:
            response = requests.post(
                url,
                json=payload,
                headers=headers,
                auth=AUTH,
                timeout=30
            )
        except requests.RequestException as e:
            assert False, f"Request failed: {e}"

        # Accept status code 400, 401 or 200 (if error message present)
        assert response.status_code in (200, 400, 401), (
            f"Expected 401 Unauthorized or 400 Bad Request or 200 OK but got {response.status_code} for payload {payload}"
        )

        json_response = {}
        try:
            json_response = response.json()
        except ValueError:
            assert False, "Response is not valid JSON"

        # Validate presence of error message when status is 200 or error status
        error_msgs_keys = ["error", "message", "detail", "msg"]
        error_present = any(k in json_response and isinstance(json_response[k], str) and len(json_response[k]) > 0 for k in error_msgs_keys)
        assert error_present, f"Expected error message in response body for payload {payload}, got: {json_response}"


test_user_login_with_invalid_credentials()