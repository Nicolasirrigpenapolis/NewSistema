import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
TIMEOUT = 30
AUTH = HTTPBasicAuth("programador", "conectairrig@")

def test_cnpj_external_consultation_integration():
    cnpj_to_test = "00000000000191"  # Example of a valid CNPJ (can be changed as needed)
    url = f"{BASE_URL}/api/consultacnpj/{cnpj_to_test}"

    headers = {
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, auth=AUTH, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to CNPJ external consultation API failed with exception: {e}"

    # Validate response status code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate that essential company fields exist in response
    expected_fields = [
        "cnpj",
        "nome",
        "fantasia",
        "logradouro",
        "numero",
        "bairro",
        "municipio",
        "uf",
        "cep",
        "telefone",
        "email",
        "ativo"
    ]

    missing_fields = [field for field in expected_fields if field not in data]
    assert not missing_fields, f"Response JSON missing fields: {missing_fields}"

    # Validate CNPJ in response matches requested CNPJ (formatted)
    response_cnpj = data.get("cnpj")
    assert response_cnpj is not None, "Response does not contain 'cnpj' field"
    # Remove non-digit chars to compare as pure numeric string
    response_cnpj_digits = "".join(filter(str.isdigit, response_cnpj))
    requested_cnpj_digits = "".join(filter(str.isdigit, cnpj_to_test))
    assert response_cnpj_digits == requested_cnpj_digits, f"CNPJ in response '{response_cnpj}' does not match requested '{cnpj_to_test}'"

    # Validate at least one name field is non-empty
    assert data.get("nome") or data.get("fantasia"), "Both 'nome' and 'fantasia' are empty in response"

    # Validate sample format of cep
    cep = data.get("cep")
    assert cep is not None and isinstance(cep, str) and len(cep) >= 8, f"CEP field invalid or missing: {cep}"

    # Validate uf (state) is 2 letters uppercase
    uf = data.get("uf")
    assert uf is not None and isinstance(uf, str) and len(uf) == 2 and uf.isalpha() and uf.isupper(), f"UF field invalid: {uf}"

    # Validate ativo field is boolean
    ativo = data.get("ativo")
    assert isinstance(ativo, bool), f"'ativo' field is not boolean: {ativo}"

    # If telephone and email present, validate simple formats
    telefone = data.get("telefone")
    if telefone:
        assert any(char.isdigit() for char in telefone), "Telefone field does not contain digits"

    email = data.get("email")
    if email:
        assert "@" in email and "." in email, f"Email field does not appear valid: {email}"

test_cnpj_external_consultation_integration()