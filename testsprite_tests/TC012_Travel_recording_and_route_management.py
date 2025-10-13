import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
AUTH = HTTPBasicAuth("programador", "conectairrig@")
TIMEOUT = 30

def test_travel_recording_and_route_management():
    headers = {"Content-Type": "application/json"}
    vehicle_id = None
    route_id = None
    travel_id = None

    try:
        # Step 1: Create a vehicle (required to link the travel record)
        vehicle_payload = {
            "placa": "XYZ1234",
            "modelo": "Volvo FH",
            "ano": 2020,
            "capacidade": 30000,
            "renavam": "12345678901",
            "tara": 8000
        }
        r = requests.post(f"{BASE_URL}/api/veiculos", json=vehicle_payload, headers=headers, auth=AUTH, timeout=TIMEOUT)
        assert r.status_code == 201, f"Failed to create vehicle: {r.text}"
        vehicle = r.json()
        vehicle_id = vehicle.get("id")
        assert vehicle_id is not None, "Vehicle ID not returned"

        # Step 2: Create a route to manage and track
        route_payload = {
            "nome": "Rota Teste",
            "descricao": "Rota para teste de gerenciamento",
            "ponto_inicial": "Origem A",
            "ponto_final": "Destino B",
            "distancia_km": 150
        }
        r = requests.post(f"{BASE_URL}/api/rotas", json=route_payload, headers=headers, auth=AUTH, timeout=TIMEOUT)
        assert r.status_code == 201, f"Failed to create route: {r.text}"
        route = r.json()
        route_id = route.get("id")
        assert route_id is not None, "Route ID not returned"

        # Step 3: Create a travel record linked to the vehicle and route
        travel_payload = {
            "veiculoId": vehicle_id,
            "rotaId": route_id,
            "data_inicio": "2025-10-04T08:00:00Z",
            "data_fim": "2025-10-04T12:00:00Z",
            "km_inicial": 100000,
            "km_final": 100150,
            "descricao": "Viagem teste de integração entre veículo e rota."
        }
        r = requests.post(f"{BASE_URL}/api/viagens", json=travel_payload, headers=headers, auth=AUTH, timeout=TIMEOUT)
        assert r.status_code == 201, f"Failed to create travel record: {r.text}"
        travel = r.json()
        travel_id = travel.get("id")
        assert travel_id is not None, "Travel ID not returned"
        assert travel.get("veiculoId") == vehicle_id, "Travel record vehicle link incorrect"
        assert travel.get("rotaId") == route_id, "Travel record route link incorrect"

        # Step 4: Retrieve and verify the travel record
        r = requests.get(f"{BASE_URL}/api/viagens/{travel_id}", headers=headers, auth=AUTH, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to get travel record: {r.text}"
        travel_get = r.json()
        assert travel_get["id"] == travel_id, "Travel record ID mismatch"
        assert travel_get["veiculoId"] == vehicle_id, "Travel record vehicle link mismatch"
        assert travel_get["rotaId"] == route_id, "Travel record route link mismatch"

        # Step 5: Update route data to simulate management
        route_update_payload = {
            "nome": "Rota Teste Atualizada",
            "descricao": "Rota atualizada para gerenciamento e rastreamento",
            "ponto_inicial": "Origem A",
            "ponto_final": "Destino C",
            "distancia_km": 180
        }
        r = requests.put(f"{BASE_URL}/api/rotas/{route_id}", json=route_update_payload, headers=headers, auth=AUTH, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to update route: {r.text}"
        route_updated = r.json()
        assert route_updated["nome"] == route_update_payload["nome"], "Route name update failed"
        assert route_updated["ponto_final"] == route_update_payload["ponto_final"], "Route final point update failed"

        # Step 6: Retrieve route and verify changes
        r = requests.get(f"{BASE_URL}/api/rotas/{route_id}", headers=headers, auth=AUTH, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to get route: {r.text}"
        route_get = r.json()
        assert route_get["nome"] == route_update_payload["nome"], "Route name mismatch after update"
        assert route_get["ponto_final"] == route_update_payload["ponto_final"], "Route final point mismatch after update"

    finally:
        # Cleanup created travel record
        if travel_id:
            requests.delete(f"{BASE_URL}/api/viagens/{travel_id}", headers=headers, auth=AUTH, timeout=TIMEOUT)
        # Cleanup created route
        if route_id:
            requests.delete(f"{BASE_URL}/api/rotas/{route_id}", headers=headers, auth=AUTH, timeout=TIMEOUT)
        # Cleanup created vehicle
        if vehicle_id:
            requests.delete(f"{BASE_URL}/api/veiculos/{vehicle_id}", headers=headers, auth=AUTH, timeout=TIMEOUT)


test_travel_recording_and_route_management()