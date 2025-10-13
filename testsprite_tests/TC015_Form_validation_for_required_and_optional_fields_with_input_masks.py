import requests

BASE_URL = "http://localhost:5000"
AUTH = ("programador", "conectairrig@")
TIMEOUT = 30

def test_form_validation_required_and_optional_fields_with_input_masks():
    headers = {"Content-Type": "application/json"}

    # Entities with forms needing validation (based on PRD core entities and CRUD endpoints)
    entities = {
        "emitentes": {
            "endpoint": "/api/emitentes",
            "valid_payload": {
                "nome": "Empresa Teste Ltda",
                "cnpj": "12.345.678/0001-95",  # valid CNPJ format
                "inscricaoEstadual": "123456789",
                "telefone": "(11) 98765-4321",
                "email": "contato@empresateste.com.br",
                # Optional fields can be omitted
            },
            "invalid_payloads": [
                # Missing required field: nome
                {
                    "cnpj": "12.345.678/0001-95"
                },
                # Invalid CNPJ format
                {
                    "nome": "Empresa Teste Ltda",
                    "cnpj": "12345678000195"
                },
                # Invalid email format
                {
                    "nome": "Empresa Teste Ltda",
                    "cnpj": "12.345.678/0001-95",
                    "email": "email-invalido"
                },
            ]
        },
        "condutores": {
            "endpoint": "/api/condutores",
            "valid_payload": {
                "nome": "João da Silva",
                "cpf": "123.456.789-09",  # valid CPF format
                "rg": "12.345.678-9",
                "telefone": "(21) 99999-8888",
                # Optional fields omitted
            },
            "invalid_payloads": [
                # Missing required field: nome
                {
                    "cpf": "123.456.789-09"
                },
                # Invalid CPF format
                {
                    "nome": "João da Silva",
                    "cpf": "12345678909"
                },
                # Empty CPF
                {
                    "nome": "João da Silva",
                    "cpf": ""
                },
            ]
        },
        "contratantes": {
            "endpoint": "/api/contratantes",
            "valid_payload": {
                "nome": "Cliente Ltda",
                "cnpj": "98.765.432/0001-10",
                # Optional fields omitted
            },
            "invalid_payloads": [
                {"nome": ""},  # Missing required and invalid field
                {"nome": "Cliente Ltda", "cnpj": "98765432000110"},  # Invalid CNPJ mask
            ]
        },
        "fornecedores": {
            "endpoint": "/api/fornecedores",
            "valid_payload": {
                "nome": "Fornecedor SA",
                "cnpj": "11.222.333/0001-44"
            },
            "invalid_payloads": [
                {"cnpj": "11222333000144"},  # missing formatting mask
                {"nome": ""},  # empty required field
            ]
        }
    }

    # Function to create resource (POST)
    def create_resource(url, data):
        resp = requests.post(url, json=data, auth=AUTH, headers=headers, timeout=TIMEOUT)
        return resp

    # Function to delete resource (DELETE)
    def delete_resource(url):
        resp = requests.delete(url, auth=AUTH, headers=headers, timeout=TIMEOUT)
        return resp

    for entity_name, entity_data in entities.items():
        url = BASE_URL + entity_data["endpoint"]

        # Test valid payload - expect success 201 Created
        resp_valid = create_resource(url, entity_data["valid_payload"])
        assert resp_valid.status_code == 201, f"{entity_name} valid payload creation failed: {resp_valid.text}"
        resource_id = None
        try:
            resource_id = resp_valid.json().get("id")
            assert resource_id is not None, f"{entity_name} created resource missing 'id' field"

            # Optionally, fetch the created resource and verify fields are stored correctly
            resp_get = requests.get(f"{url}/{resource_id}", auth=AUTH, headers=headers, timeout=TIMEOUT)
            assert resp_get.status_code == 200, f"Failed to get created {entity_name} resource"
            fetched = resp_get.json()
            for k, v in entity_data["valid_payload"].items():
                assert fetched.get(k) == v, f"{entity_name} field {k} mismatch on fetched data"

            # Test invalid payloads - expect failure 400 Bad Request with validation error message
            for invalid_payload in entity_data["invalid_payloads"]:
                resp_invalid = create_resource(url, invalid_payload)
                assert resp_invalid.status_code == 400, (
                    f"{entity_name} invalid payload {invalid_payload} did not fail as expected"
                )
                json_resp = resp_invalid.json()
                # Check error message presence, could be error details or messages related to validation
                assert any(
                    key in json_resp for key in ["errors", "message", "detail"]
                ), f"{entity_name} invalid payload error response missing expected keys"

        finally:
            # Cleanup created resource if exists
            if resource_id:
                del_resp = delete_resource(f"{url}/{resource_id}")
                # Allow 200 or 204 as successful delete
                assert del_resp.status_code in (200, 204), f"Failed to delete {entity_name} resource {resource_id}"

test_form_validation_required_and_optional_fields_with_input_masks()