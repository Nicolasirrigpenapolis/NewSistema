import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
VEHICLES_ENDPOINT = f"{BASE_URL}/api/veiculos"
AUTH = HTTPBasicAuth("programador", "conectairrig@")
TIMEOUT = 30
HEADERS = {"Content-Type": "application/json"}


def test_vehicles_crud_operations():
    # Sample vehicle payload for creation
    vehicle_data = {
        "placa": "ABC1234",
        "renavam": "12345678901",
        "marca": "Volkswagen",
        "modelo": "Gol",
        "anoFabricacao": 2020,
        "anoModelo": 2021,
        "capacidadeCarga": 1200.5,
        "tipoVeiculo": "Automóvel",
        "cor": "Azul",
        "observacoes": "Veículo de teste"
    }

    created_vehicle_id = None

    try:
        # CREATE - POST /api/veiculos
        response_create = requests.post(VEHICLES_ENDPOINT, json=vehicle_data, auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert response_create.status_code == 201, f"Failed to create vehicle: {response_create.text}"
        created_vehicle = response_create.json()
        created_vehicle_id = created_vehicle.get("id")
        assert created_vehicle_id is not None, "Created vehicle ID is None"
        for key in vehicle_data:
            # Some APIs might transform or normalize data, so do a loose check
            if isinstance(vehicle_data[key], float):
                assert abs(vehicle_data[key] - created_vehicle.get(key, 0)) < 0.01, f"Mismatch in field {key}"
            else:
                assert str(vehicle_data[key]).lower() == str(created_vehicle.get(key, "")).lower(), f"Mismatch in field {key}"

        # READ - GET /api/veiculos/{id}
        response_get = requests.get(f"{VEHICLES_ENDPOINT}/{created_vehicle_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert response_get.status_code == 200, f"Failed to get vehicle: {response_get.text}"
        fetched_vehicle = response_get.json()
        assert fetched_vehicle.get("id") == created_vehicle_id, "Fetched vehicle ID mismatch"
        for key in vehicle_data:
            if isinstance(vehicle_data[key], float):
                assert abs(vehicle_data[key] - fetched_vehicle.get(key, 0)) < 0.01, f"Mismatch in field {key} on fetched vehicle"
            else:
                assert str(vehicle_data[key]).lower() == str(fetched_vehicle.get(key, "")).lower(), f"Mismatch in field {key} on fetched vehicle"

        # UPDATE - PUT /api/veiculos/{id}
        updated_data = {
            "placa": "XYZ9876",
            "renavam": "10987654321",
            "marca": "Ford",
            "modelo": "Focus",
            "anoFabricacao": 2019,
            "anoModelo": 2020,
            "capacidadeCarga": 1500.0,
            "tipoVeiculo": "Automóvel",
            "cor": "Vermelho",
            "observacoes": "Veículo atualizado"
        }
        response_update = requests.put(f"{VEHICLES_ENDPOINT}/{created_vehicle_id}", json=updated_data, auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert response_update.status_code == 200, f"Failed to update vehicle: {response_update.text}"

        updated_vehicle = response_update.json()
        assert updated_vehicle.get("id") == created_vehicle_id, "Updated vehicle ID mismatch"
        for key in updated_data:
            if isinstance(updated_data[key], float):
                assert abs(updated_data[key] - updated_vehicle.get(key, 0)) < 0.01, f"Mismatch in updated field {key}"
            else:
                assert str(updated_data[key]).lower() == str(updated_vehicle.get(key, "")).lower(), f"Mismatch in updated field {key}"

        # READ after UPDATE - verify updated data
        response_get_updated = requests.get(f"{VEHICLES_ENDPOINT}/{created_vehicle_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert response_get_updated.status_code == 200, f"Failed to get updated vehicle: {response_get_updated.text}"
        fetched_updated_vehicle = response_get_updated.json()
        for key in updated_data:
            if isinstance(updated_data[key], float):
                assert abs(updated_data[key] - fetched_updated_vehicle.get(key, 0)) < 0.01, f"Mismatch in field {key} after update read"
            else:
                assert str(updated_data[key]).lower() == str(fetched_updated_vehicle.get(key, "")).lower(), f"Mismatch in field {key} after update read"

    finally:
        # DELETE - DELETE /api/veiculos/{id}
        if created_vehicle_id:
            response_delete = requests.delete(f"{VEHICLES_ENDPOINT}/{created_vehicle_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
            assert response_delete.status_code in [200, 204], f"Failed to delete vehicle: {response_delete.text}"

        # Validate deletion
        if created_vehicle_id:
            response_get_deleted = requests.get(f"{VEHICLES_ENDPOINT}/{created_vehicle_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
            assert response_get_deleted.status_code == 404, "Vehicle still exists after deletion"

test_vehicles_crud_operations()