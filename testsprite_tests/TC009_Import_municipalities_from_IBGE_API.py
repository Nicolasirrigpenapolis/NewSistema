import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
AUTH = HTTPBasicAuth("programador", "conectairrig@")
TIMEOUT = 30

def test_import_municipalities_from_ibge_api():
    # Trigger import from IBGE external API
    import_url = f"{BASE_URL}/api/municipios/import-ibge"
    headers = {"Accept": "application/json"}

    response = requests.post(import_url, auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert response.status_code == 200, f"Import failed with status code {response.status_code}"
    data = response.json()
    assert isinstance(data, dict), "Response is not a JSON object"
    assert data.get("imported_count") is not None, "imported_count field missing in response"
    assert data["imported_count"] > 0, "No municipalities were imported"

    # Verify that some municipalities are stored and searchable
    search_url = f"{BASE_URL}/api/municipios?search=São Paulo"
    list_response = requests.get(search_url, auth=AUTH, headers=headers, timeout=TIMEOUT)
    assert list_response.status_code == 200, f"Search failed with status code {list_response.status_code}"
    municipalities = list_response.json()
    assert isinstance(municipalities, list), "Search response is not a list"
    assert any("São Paulo" in m.get("nome", "") or "SP" in m.get("uf", "") for m in municipalities), \
        "Expected municipalities like 'São Paulo' not found in search results"

test_import_municipalities_from_ibge_api()