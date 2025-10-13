import requests
import json

BASE_URL = "http://localhost:5000"
AUTH = ("programador", "conectairrig@")
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json"
}

def test_tc011_vehicle_maintenance_with_report_export():
    manutencoes_url = f"{BASE_URL}/api/manutencoes"
    relatorios_url = f"{BASE_URL}/api/relatorios/manutencoes"

    # Sample vehicle maintenance record payload
    manutencao_payload = {
        "veiculoId": None,       # Will create vehicle first and replace
        "dataManutencao": "2025-10-04T10:30:00Z",
        "descricao": "Troca de óleo e filtros",
        "custo": 350.75,
        "tipoManutencao": "Preventiva",
        "fornecedorId": None     # Optional but can be null
    }

    # To create a maintenance, vehicle ID is required.
    # So create a vehicle first:
    veiculos_url = f"{BASE_URL}/api/veiculos"
    veiculo_payload = {
        "placa": "TEST1234",
        "modelo": "Teste Modelo",
        "marca": "Teste Marca",
        "anoFabricacao": 2020,
        "renavam": "12345678901",
        "tara": 3000,
        "capacidade": 10000,
        "tipoVeiculo": "Caminhão"
    }

    veiculo_id = None
    manutencao_id = None

    try:
        # Create Vehicle
        resp = requests.post(veiculos_url, auth=AUTH, headers=HEADERS, json=veiculo_payload, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Failed to create vehicle: {resp.text}"
        veiculo_id = resp.json().get("id")
        assert veiculo_id, "Vehicle ID not returned"

        # Update maintenance payload with vehicleId
        manutencao_payload["veiculoId"] = veiculo_id

        # Create Maintenance Record
        resp = requests.post(manutencoes_url, auth=AUTH, headers=HEADERS, json=manutencao_payload, timeout=TIMEOUT)
        assert resp.status_code == 201, f"Failed to create maintenance record: {resp.text}"
        manutencao_id = resp.json().get("id")
        assert manutencao_id, "Maintenance ID not returned"

        # View Maintenance Record by ID
        resp = requests.get(f"{manutencoes_url}/{manutencao_id}", auth=AUTH, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to get maintenance record: {resp.text}"
        record = resp.json()
        assert record["id"] == manutencao_id, "Maintenance record ID mismatch"
        assert record["veiculoId"] == veiculo_id, "Vehicle ID mismatch in maintenance record"
        assert record["descricao"] == manutencao_payload["descricao"], "Description mismatch"

        # Filter Maintenance Records by vehicleId
        params = {"veiculoId": veiculo_id}
        resp = requests.get(manutencoes_url, auth=AUTH, params=params, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to filter maintenance records: {resp.text}"
        filtered_list = resp.json()
        assert any(m["id"] == manutencao_id for m in filtered_list), "Created maintenance record not in filtered results"

        # Export reports for maintenance in supported formats: e.g., "pdf" and "xlsx"
        for fmt in ["pdf", "xlsx"]:
            export_params = {"formato": fmt, "veiculoId": veiculo_id}
            resp = requests.get(relatorios_url, auth=AUTH, params=export_params, timeout=TIMEOUT)
            assert resp.status_code == 200, f"Failed to export maintenance report in {fmt}: {resp.text}"
            content_type = resp.headers.get("Content-Type", "")
            if fmt == "pdf":
                assert "pdf" in content_type.lower(), f"Expected PDF content type, got {content_type}"
            elif fmt == "xlsx":
                assert ("excel" in content_type.lower() or "spreadsheetml" in content_type.lower()), f"Expected Excel content type, got {content_type}"
            # Response content length should be greater than 0
            assert len(resp.content) > 0, f"Empty report exported in {fmt} format"

    finally:
        # Cleanup created maintenance record
        if manutencao_id:
            requests.delete(f"{manutencoes_url}/{manutencao_id}", auth=AUTH, timeout=TIMEOUT)

        # Cleanup created vehicle
        if veiculo_id:
            requests.delete(f"{veiculos_url}/{veiculo_id}", auth=AUTH, timeout=TIMEOUT)


test_tc011_vehicle_maintenance_with_report_export()