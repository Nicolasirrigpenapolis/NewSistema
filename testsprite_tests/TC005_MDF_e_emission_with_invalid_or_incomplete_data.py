import requests

BASE_URL = "http://localhost:5000"
AUTH_USERNAME = "programador"
AUTH_PASSWORD = "conectairrig@"
TIMEOUT = 30

def test_mdfe_emission_with_invalid_or_incomplete_data():
    url = f"{BASE_URL}/api/mdfe"
    headers = {
        "Content-Type": "application/json"
    }
    # Basic auth tuple for requests
    auth = (AUTH_USERNAME, AUTH_PASSWORD)

    # Prepare a list of invalid or incomplete payloads to test failure cases
    invalid_payloads = [
        {},  # Completely empty payload
        {"emitente": None},  # Missing required nested object fields
        {"emitente": {"cnpj": ""}},  # Required CNPJ empty string
        {"veiculos": []},  # Missing required non-empty lists or nested structures
        {"dataEmissao": "invalid-date-format"},  # Invalid date format
        {"numeroManifesto": -1},  # Invalid negative number if this field is numeric positive
        {"destinatario": {"cpf": "123"}},  # Invalid CPF format or incomplete
        {"itens": [{}]},  # Empty item inside list if expected structure is complex
        {"modalidade": "UNKNOWN"},  # Invalid enum or option string
    ]

    for payload in invalid_payloads:
        try:
            response = requests.post(url, json=payload, headers=headers, auth=auth, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request failed unexpectedly: {e}"

        # Expecting HTTP 400 Bad Request or other 4xx error for invalid data
        assert response.status_code >= 400 and response.status_code < 500, \
            f"Expected 4xx status code for invalid payload but got {response.status_code}. Payload: {payload}"

        try:
            response_data = response.json()
        except ValueError:
            assert False, "Response is not JSON formatted"

        # Check for error message in response - assume error structure contains 'errors' or 'message'
        assert ("errors" in response_data or "message" in response_data), \
            f"Error message expected in response for payload {payload}, got: {response_data}"

test_mdfe_emission_with_invalid_or_incomplete_data()