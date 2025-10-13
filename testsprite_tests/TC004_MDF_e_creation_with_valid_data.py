import requests
import json

BASE_URL = "http://localhost:5000"
AUTH = ("programador", "conectairrig@")
HEADERS = {
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_mdfe_creation_with_valid_data():
    # Sample valid MDF-e payload (simplified and must comply with backend expectations)
    mdfe_data = {
        "emitenteId": 1,
        "veiculoId": 1,
        "condutorId": 1,
        "reboques": [],
        "contratanteId": 1,
        "seguradoraId": 1,
        "municipioId": 3550308,  # São Paulo IBGE code for example
        "numeroManifesto": "123456789",
        "dataEmissao": "2025-10-04T10:00:00",
        "valorCarga": 15000.00,
        "tipoCarga": "Granel sólido",
        "observacoes": "Teste de emissão MDF-e via API, integração SEFAZ ACBr",
        "destino": {
            "municipioId": 3304557,  # Rio de Janeiro IBGE code for example
            "tipoDocumento": "CTe",
            "documentos": ["000123"]
        }
    }

    created_mdfe_id = None

    try:
        # Step 1: Create and emit MDF-e
        response = requests.post(
            f"{BASE_URL}/api/mdfe",
            auth=AUTH,
            headers=HEADERS,
            data=json.dumps(mdfe_data),
            timeout=TIMEOUT
        )
        assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}"
        created_mdfe = response.json()
        assert "id" in created_mdfe, "Response missing 'id'"
        created_mdfe_id = created_mdfe["id"]
        assert created_mdfe.get("status") in ["Pending", "Authorized"], "Unexpected MDF-e status after creation"
        assert created_mdfe.get("integracaoSEFAZ") == True, "SEFAZ integration flag should be True"

        # Step 2: Confirm the MDF-e is retrievable and has correct data
        get_response = requests.get(
            f"{BASE_URL}/api/mdfe/{created_mdfe_id}",
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_response.status_code == 200, f"Expected 200 OK when querying created MDF-e, got {get_response.status_code}"
        mdfe_detail = get_response.json()
        assert mdfe_detail["id"] == created_mdfe_id, "Mismatch in MDF-e ID from GET response"
        assert mdfe_detail["numeroManifesto"] == mdfe_data["numeroManifesto"], "numeroManifesto does not match"
        assert mdfe_detail["valorCarga"] == mdfe_data["valorCarga"], "valorCarga does not match"
        assert mdfe_detail["status"] in ["Pending", "Authorized"], "Unexpected status in MDF-e detail"
        assert mdfe_detail.get("integracaoSEFAZ") == True, "SEFAZ integration should be confirmed in detail"

    finally:
        # Cleanup: delete the created MDF-e to maintain test isolation
        if created_mdfe_id:
            delete_response = requests.delete(
                f"{BASE_URL}/api/mdfe/{created_mdfe_id}",
                auth=AUTH,
                headers=HEADERS,
                timeout=TIMEOUT
            )
            # We accept 200 or 204 for successful delete
            assert delete_response.status_code in [200, 204], f"Failed to delete test MDF-e with id {created_mdfe_id}"

test_mdfe_creation_with_valid_data()