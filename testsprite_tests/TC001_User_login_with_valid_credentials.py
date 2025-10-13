import requests

def test_user_login_with_valid_credentials():
    base_url = "http://localhost:5000"
    login_url = f"{base_url}/api/auth"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "username": "programador",
        "password": "conectairrig@"
    }
    
    try:
        response = requests.post(login_url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    json_response = response.json()

    # Assert the response has a JWT token
    assert "token" in json_response or "access_token" in json_response, "JWT token not found in response"
    token = json_response.get("token") or json_response.get("access_token")
    assert isinstance(token, str) and len(token) > 0, "JWT token is empty or invalid"

    # Optionally, check token structure (JWT format: header.payload.signature)
    parts = token.split(".")
    assert len(parts) == 3, "Token is not a valid JWT format"

    # If permissions or roles are part of response, validate presence and type
    permissions = json_response.get("permissions") or json_response.get("roles") or json_response.get("user_permissions")
    if permissions is not None:
        assert isinstance(permissions, (list, dict)), "Permissions field is not a list or dict"

test_user_login_with_valid_credentials()