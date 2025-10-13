import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
AUTH = HTTPBasicAuth("programador", "conectairrig@")
TIMEOUT = 30

def test_theme_switching_light_dark_modes():
    session = requests.Session()
    session.auth = AUTH
    session.headers.update({"Content-Type": "application/json"})

    try:
        # Step 1: Get current theme preference (assumed GET /api/config/theme)
        resp_get = session.get(f"{BASE_URL}/api/config/theme", timeout=TIMEOUT)
        assert resp_get.status_code == 200, f"Failed to get current theme: {resp_get.text}"
        initial_theme = resp_get.json().get("theme")
        assert initial_theme in ["light", "dark"], "Initial theme should be 'light' or 'dark'"

        # Step 2: Switch theme to the opposite mode via PUT /api/config/theme
        new_theme = "dark" if initial_theme == "light" else "light"
        payload = {"theme": new_theme}
        resp_put = session.put(f"{BASE_URL}/api/config/theme", json=payload, timeout=TIMEOUT)
        assert resp_put.status_code == 200, f"Failed to update theme: {resp_put.text}"
        updated_theme = resp_put.json().get("theme")
        assert updated_theme == new_theme, "Theme update response does not match requested theme"

        # Step 3: Simulate new session by creating a new session object with same auth
        new_session = requests.Session()
        new_session.auth = AUTH
        new_session.headers.update({"Content-Type": "application/json"})

        # Verify that theme preference is persisted across sessions (GET /api/config/theme)
        resp_get_new = new_session.get(f"{BASE_URL}/api/config/theme", timeout=TIMEOUT)
        assert resp_get_new.status_code == 200, f"Failed to get theme in new session: {resp_get_new.text}"
        persisted_theme = resp_get_new.json().get("theme")
        assert persisted_theme == new_theme, "Theme preference not persisted across sessions"

        # Cleanup: revert to original theme to leave state unchanged
        resp_cleanup = session.put(f"{BASE_URL}/api/config/theme", json={"theme": initial_theme}, timeout=TIMEOUT)
        assert resp_cleanup.status_code == 200, f"Failed to revert theme: {resp_cleanup.text}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_theme_switching_light_dark_modes()
