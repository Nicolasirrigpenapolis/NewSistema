import requests
import time

BASE_URL = "http://localhost:5000"
AUTH_ENDPOINT = "/api/auth"
USERNAME = "programador"
PASSWORD = "conectairrig@"
TIMEOUT = 30

def test_automatic_token_renewal_before_expiration():
    session = requests.Session()
    try:
        # Step 1: Login and get initial token and expiration info
        login_resp = session.post(
            BASE_URL + AUTH_ENDPOINT,
            json={"username": USERNAME, "password": PASSWORD},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        assert "token" in login_data, "Token not in login response"
        token = login_data["token"]
        assert token, "Empty token received"
        session.headers.update({"Authorization": f"Bearer {token}"})

        # Step 2: Wait some time shorter than token expiration (simulate near expiration)
        wait_time = 50
        time.sleep(wait_time)

        # Step 3: Make a request to an authenticated endpoint
        AUTH_CHECK_ENDPOINT = "/api/usuarios"
        renew_resp = session.get(BASE_URL + AUTH_CHECK_ENDPOINT, timeout=TIMEOUT)
        assert renew_resp.status_code == 200, f"Authenticated endpoint failed: {renew_resp.text}"

        # Step 4: Check session still valid with another authenticated request
        second_check_resp = session.get(BASE_URL + AUTH_CHECK_ENDPOINT, timeout=TIMEOUT)
        assert second_check_resp.status_code == 200, f"Second authenticated request failed: {second_check_resp.text}"
    finally:
        session.close()

test_automatic_token_renewal_before_expiration()