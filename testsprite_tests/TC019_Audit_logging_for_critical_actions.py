import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
AUTH = HTTPBasicAuth("programador", "conectairrig@")
TIMEOUT = 30

def test_audit_logging_for_critical_actions():
    headers = {"Content-Type": "application/json"}

    # 1 - Test user login audit logging
    login_payload = {
        "username": "programador",
        "password": "conectairrig@"
    }
    login_resp = requests.post(
        f"{BASE_URL}/api/auth",
        json=login_payload,
        auth=AUTH,
        headers=headers,
        timeout=TIMEOUT,
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token")
    assert token, "Token not received on login"

    auth_headers = {**headers, "Authorization": f"Bearer {token}"}

    # Verify audit log for login exists
    audit_login_resp = requests.get(
        f"{BASE_URL}/api/auditlogs",
        params={"action": "login", "username": "programador"},
        auth=AUTH,
        headers=auth_headers,
        timeout=TIMEOUT,
    )
    assert audit_login_resp.status_code == 200
    logs = audit_login_resp.json()
    assert any("programador" in log.get("details", "") for log in logs), "No audit log for user login found"

    # 2 - Test MDF-e emission audit logging

    # Create a minimal valid MDF-e (covering basic required fields)
    mdfe_payload = {
        "chave": "35210212345678000190550010000000011000000010",
        "emitenteId": None,  # Will create an emitente for this
        "dataEmissao": "2025-10-04T10:00:00",
        "status": "Pendente",
        "detalhes": "Emissão teste automatizado"
    }

    # Create an emitente to link in MDF-e
    emitente_payload = {
        "razaoSocial": "Empresa Teste LTDA",
        "cnpj": "12345678000195",
        "endereco": "Rua Teste, 123",
        "telefone": "11999999999",
        "email": "teste@empresa.com"
    }

    emitente_id = None
    mdfe_id = None
    try:
        # Create Emitente
        emitente_resp = requests.post(
            f"{BASE_URL}/api/emitentes",
            json=emitente_payload,
            auth=AUTH,
            headers=auth_headers,
            timeout=TIMEOUT
        )
        assert emitente_resp.status_code == 201, f"Emitente creation failed: {emitente_resp.text}"
        emitente_id = emitente_resp.json().get("id")
        assert emitente_id, "Emitente ID not returned"

        mdfe_payload["emitenteId"] = emitente_id

        # Create MDF-e
        mdfe_create_resp = requests.post(
            f"{BASE_URL}/api/mdfe",
            json=mdfe_payload,
            auth=AUTH,
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert mdfe_create_resp.status_code == 201, f"MDF-e creation failed: {mdfe_create_resp.text}"
        mdfe_id = mdfe_create_resp.json().get("id")
        assert mdfe_id, "MDF-e ID not returned"

        # Verify MDF-e emission audit log exists
        audit_mdfe_resp = requests.get(
            f"{BASE_URL}/api/auditlogs",
            params={"action": "mdfe_emission", "mdfeId": mdfe_id},
            auth=AUTH,
            headers=auth_headers,
            timeout=TIMEOUT,
        )
        assert audit_mdfe_resp.status_code == 200
        mdfe_logs = audit_mdfe_resp.json()
        assert any(str(mdfe_id) == str(log.get("entityId")) for log in mdfe_logs), "No audit log for MDF-e emission found"

        # 3 - Test entity CRUD audit logging (for vehicle entity)

        vehicle_payload = {
            "placa": "ABC1234",
            "renavam": "12345678900",
            "marca": "TesteMarca",
            "modelo": "TesteModelo",
            "anoFabricacao": 2020,
            "cor": "Branco"
        }
        vehicle_id = None

        try:
            # Create vehicle
            vehicle_create_resp = requests.post(
                f"{BASE_URL}/api/veiculos",
                json=vehicle_payload,
                auth=AUTH,
                headers=auth_headers,
                timeout=TIMEOUT,
            )
            assert vehicle_create_resp.status_code == 201, f"Vehicle creation failed: {vehicle_create_resp.text}"
            vehicle_id = vehicle_create_resp.json().get("id")
            assert vehicle_id, "Vehicle ID not returned"

            # Verify audit log for create vehicle
            audit_vehicle_create_resp = requests.get(
                f"{BASE_URL}/api/auditlogs",
                params={"action": "create", "entity": "veiculos", "entityId": vehicle_id},
                auth=AUTH,
                headers=auth_headers,
                timeout=TIMEOUT,
            )
            assert audit_vehicle_create_resp.status_code == 200
            logs_create = audit_vehicle_create_resp.json()
            assert any(str(vehicle_id) == str(log.get("entityId")) for log in logs_create), "No audit log for vehicle creation found"

            # Update vehicle
            update_payload = {"cor": "Preto"}
            vehicle_update_resp = requests.put(
                f"{BASE_URL}/api/veiculos/{vehicle_id}",
                json=update_payload,
                auth=AUTH,
                headers=auth_headers,
                timeout=TIMEOUT,
            )
            assert vehicle_update_resp.status_code == 200, f"Vehicle update failed: {vehicle_update_resp.text}"

            # Verify audit log for update vehicle
            audit_vehicle_update_resp = requests.get(
                f"{BASE_URL}/api/auditlogs",
                params={"action": "update", "entity": "veiculos", "entityId": vehicle_id},
                auth=AUTH,
                headers=auth_headers,
                timeout=TIMEOUT,
            )
            assert audit_vehicle_update_resp.status_code == 200
            logs_update = audit_vehicle_update_resp.json()
            assert any(str(vehicle_id) == str(log.get("entityId")) for log in logs_update), "No audit log for vehicle update found"

            # Delete vehicle
            vehicle_delete_resp = requests.delete(
                f"{BASE_URL}/api/veiculos/{vehicle_id}",
                auth=AUTH,
                headers=auth_headers,
                timeout=TIMEOUT,
            )
            assert vehicle_delete_resp.status_code == 204, f"Vehicle deletion failed: {vehicle_delete_resp.text}"

            # Verify audit log for delete vehicle
            audit_vehicle_delete_resp = requests.get(
                f"{BASE_URL}/api/auditlogs",
                params={"action": "delete", "entity": "veiculos", "entityId": vehicle_id},
                auth=AUTH,
                headers=auth_headers,
                timeout=TIMEOUT,
            )
            assert audit_vehicle_delete_resp.status_code == 200
            logs_delete = audit_vehicle_delete_resp.json()
            assert any(str(vehicle_id) == str(log.get("entityId")) for log in logs_delete), "No audit log for vehicle deletion found"

        finally:
            # Cleanup vehicle if still exists
            if vehicle_id:
                requests.delete(
                    f"{BASE_URL}/api/veiculos/{vehicle_id}",
                    auth=AUTH,
                    headers=auth_headers,
                    timeout=TIMEOUT,
                )

    finally:
        # Cleanup MDF-e
        if mdfe_id:
            requests.delete(
                f"{BASE_URL}/api/mdfe/{mdfe_id}",
                auth=AUTH,
                headers=auth_headers,
                timeout=TIMEOUT,
            )
        # Cleanup emitente
        if emitente_id:
            requests.delete(
                f"{BASE_URL}/api/emitentes/{emitente_id}",
                auth=AUTH,
                headers=auth_headers,
                timeout=TIMEOUT,
            )


test_audit_logging_for_critical_actions()