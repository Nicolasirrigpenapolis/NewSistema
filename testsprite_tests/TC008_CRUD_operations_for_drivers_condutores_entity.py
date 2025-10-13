import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
AUTH = HTTPBasicAuth("programador", "conectairrig@")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_crud_operations_drivers():
    driver_endpoint = f"{BASE_URL}/api/condutores"

    # Sample driver payload for creation
    driver_data = {
        "nome": "João da Silva",
        "cpf": "12345678901",
        "cnh": "H123456789012",
        "categoriaCnh": "B",
        "validadeCnh": "2030-12-31",
        "telefone": "(11)98765-4321",
        "email": "joao.silva@example.com",
        "endereco": "Rua das Flores, 123",
        "ativo": True
    }

    created_driver_id = None

    try:
        # Create (POST)
        response = requests.post(driver_endpoint, json=driver_data, headers=HEADERS, auth=AUTH, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}"
        created_driver = response.json()
        created_driver_id = created_driver.get("id") or created_driver.get("Id")
        assert created_driver_id is not None, "Created driver ID missing in response"

        # Validate returned data matches sent data (except generated fields)
        for key in driver_data:
            assert key in created_driver, f"Response missing field '{key}'"
        assert created_driver["nome"] == driver_data["nome"]
        assert created_driver["cpf"] == driver_data["cpf"]

        # Read (GET)
        get_response = requests.get(f"{driver_endpoint}/{created_driver_id}", headers=HEADERS, auth=AUTH, timeout=TIMEOUT)
        assert get_response.status_code == 200, f"Expected 200 OK on GET, got {get_response.status_code}"
        driver_fetched = get_response.json()
        assert driver_fetched["id"] == created_driver_id or driver_fetched["Id"] == created_driver_id
        assert driver_fetched["nome"] == driver_data["nome"]

        # Update (PUT)
        updated_data = driver_data.copy()
        updated_data["nome"] = "João da Silva Atualizado"
        updated_data["telefone"] = "(11)99999-8888"
        put_response = requests.put(f"{driver_endpoint}/{created_driver_id}", json=updated_data, headers=HEADERS, auth=AUTH, timeout=TIMEOUT)
        assert put_response.status_code == 200, f"Expected 200 OK on PUT, got {put_response.status_code}"
        updated_driver = put_response.json()
        assert updated_driver["nome"] == updated_data["nome"]
        assert updated_driver["telefone"] == updated_data["telefone"]

        # Validate update via GET
        get_after_update = requests.get(f"{driver_endpoint}/{created_driver_id}", headers=HEADERS, auth=AUTH, timeout=TIMEOUT)
        assert get_after_update.status_code == 200
        driver_after_update = get_after_update.json()
        assert driver_after_update["nome"] == updated_data["nome"]
        assert driver_after_update["telefone"] == updated_data["telefone"]

        # Validation checks: try to create with invalid CPF (should fail)
        invalid_driver = driver_data.copy()
        invalid_driver["cpf"] = "00000000000"  # Invalid CPF
        invalid_response = requests.post(driver_endpoint, json=invalid_driver, headers=HEADERS, auth=AUTH, timeout=TIMEOUT)
        assert invalid_response.status_code >= 400, "Expected error status code for invalid driver data"

    finally:
        # Cleanup - delete created driver if exists
        if created_driver_id:
            delete_response = requests.delete(f"{driver_endpoint}/{created_driver_id}", headers=HEADERS, auth=AUTH, timeout=TIMEOUT)
            assert delete_response.status_code in (200, 204), f"Expected 200 OK or 204 No Content on DELETE, got {delete_response.status_code}"

test_crud_operations_drivers()