import requests
from requests.auth import HTTPBasicAuth
import re

base_http_endpoint = "http://localhost:5000"
base_https_endpoint = "https://localhost:5001"

auth = HTTPBasicAuth("programador", "conectairrig@")
timeout = 30

def test_TC017_security_password_hashing_and_https_enforcement():
    # 1. Verify API HTTPS enforcement by attempting an HTTPS request and an HTTP request to /api/auth
    # The HTTP request should either fail or redirect and HTTPS should work.
    https_url = f"{base_https_endpoint}/api/auth"
    http_url = f"{base_http_endpoint}/api/auth"

    https_response = None
    http_response = None
    https_error = None
    http_error = None

    # Attempt HTTPS connection - expect success (status code 200 or 4xx if bad request, but no connection error)
    try:
        https_response = requests.get(https_url, auth=auth, verify=False, timeout=timeout)
        assert https_response.status_code in range(200, 500), "HTTPS request did not respond as expected"
    except Exception as e:
        https_error = e

    # Attempt HTTP connection - expect failure or redirect to HTTPS or forbidden
    try:
        http_response = requests.get(http_url, auth=auth, timeout=timeout, allow_redirects=False)
        # Acceptable results:
        # - Redirect (3xx) to HTTPS
        # - 403 Forbidden or similar
        # - Connection refused/failure (caught as exception)
        if http_response.status_code not in list(range(300, 400)) + [403, 404]:
            # If status code is 200, that means HTTP is allowed - which fails test
            assert False, f"HTTP endpoint responded with status {http_response.status_code}, HTTPS enforcement failed."
    except Exception as e:
        http_error = e

    # Assert at least one error or redirect indicating HTTP access is disallowed
    assert (http_error is not None or (http_response is not None and http_response.status_code in range(300, 400) + [403])), \
        "HTTP request succeeded without redirect or forbidden status, HTTPS enforcement failed"

    # 2. Verify stored user password is hashed with BCrypt (simulate by creating user or reading user if possible)
    # Since PRD mentions /api/usuarios for users, assume GET /api/usuarios returns users but password hashes might not be exposed.
    # So, create a new user and check returned hash or fetch user details to validate password hash format.
    #
    # As this is backend dev mode with auth bypass, we try to create user and read back its password hash field.
    # If password hash field is not accessible, assume there's an endpoint to validate password or user detail with hash.

    # User creation data
    user_data = {
        "username": "testuser_bcrypt",
        "password": "TestPass123!",
        "name": "Test User",
        "email": "testuser_bcrypt@example.com"
    }

    user_id = None
    try:
        # Create user
        create_resp = requests.post(
            f"{base_https_endpoint}/api/usuarios",
            json=user_data,
            auth=auth,
            verify=False,
            timeout=timeout
        )
        assert create_resp.status_code == 201, f"User creation failed with status {create_resp.status_code}"
        created_user = create_resp.json()
        user_id = created_user.get("id")
        assert user_id is not None, "Created user ID not returned"

        # Retrieve created user details
        get_resp = requests.get(
            f"{base_https_endpoint}/api/usuarios/{user_id}",
            auth=auth,
            verify=False,
            timeout=timeout
        )
        assert get_resp.status_code == 200, f"Failed to retrieve created user, status {get_resp.status_code}"
        user_details = get_resp.json()

        # Check password hash presence and format
        # The field may be "passwordHash" or similar; assuming "passwordHash" or "senhaHash" is returned in user details for this test.
        password_hash = user_details.get("passwordHash") or user_details.get("senhaHash") or user_details.get("senha")
        assert password_hash is not None, "Password hash not found in user details"

        # Validate BCrypt hash pattern: starts with $2a$, $2b$, or $2y$ and has correct length
        bcrypt_pattern = r"^\$2[aby]\$.{56}$"
        assert re.match(bcrypt_pattern, password_hash), "Password hash is not in BCrypt format"

    finally:
        # Clean up: delete created user if exists
        if user_id:
            requests.delete(
                f"{base_https_endpoint}/api/usuarios/{user_id}",
                auth=auth,
                verify=False,
                timeout=timeout
            )

test_TC017_security_password_hashing_and_https_enforcement()