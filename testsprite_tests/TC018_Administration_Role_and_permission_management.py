import requests
import json

BASE_URL = "http://localhost:5000"
AUTH = ("programador", "conectairrig@")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_administration_role_and_permission_management():
    # Helper functions
    def create_role(role_data):
        resp = requests.post(f"{BASE_URL}/api/cargos", auth=AUTH, headers=HEADERS, json=role_data, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def get_role(role_id):
        resp = requests.get(f"{BASE_URL}/api/cargos/{role_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def update_role(role_id, update_data):
        resp = requests.put(f"{BASE_URL}/api/cargos/{role_id}", auth=AUTH, headers=HEADERS, json=update_data, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def delete_role(role_id):
        resp = requests.delete(f"{BASE_URL}/api/cargos/{role_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.status_code == 204

    def list_permissions():
        resp = requests.get(f"{BASE_URL}/api/permissoes", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def get_permission_matrix(role_id):
        resp = requests.get(f"{BASE_URL}/api/cargos/{role_id}/matriz-permissoes", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def apply_permission_preset(role_id, preset_data):
        resp = requests.post(f"{BASE_URL}/api/cargos/{role_id}/presets", auth=AUTH, headers=HEADERS, json=preset_data, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    # Start test
    role_data = {
        "nome": "TestRole_TC018",
        "descricao": "Role criada para teste automático TC018",
        "ativo": True
    }
    role = None

    try:
        # Create role
        role = create_role(role_data)
        assert "id" in role, "Role creation must return an ID"
        role_id = role["id"]
        assert role["nome"] == role_data["nome"]
        assert role["ativo"] is True

        # Read role
        read_role = get_role(role_id)
        assert read_role["id"] == role_id
        assert read_role["nome"] == role_data["nome"]

        # List available permissions
        permissions = list_permissions()
        assert isinstance(permissions, list)
        assert len(permissions) > 0, "Permissions list should not be empty"

        # Update role - toggle active status and change name
        update_data = {
            "nome": "TestRole_TC018_Updated",
            "descricao": "Role atualizada para teste automático TC018",
            "ativo": False
        }
        updated_role = update_role(role_id, update_data)
        assert updated_role["nome"] == update_data["nome"]
        assert updated_role["ativo"] is False

        # Get permission matrix visualization for the role
        matrix = get_permission_matrix(role_id)
        assert isinstance(matrix, dict), "Permission matrix should be a dictionary"
        assert "permissions" in matrix, "Permission matrix must contain permissions key"
        assert isinstance(matrix["permissions"], list)

        # Apply a permission preset to the role
        # For the test, pick first permission IDs if available
        preset_permissions = {"presetName": "TestPreset", "permissions": []}
        if permissions:
            preset_permissions["permissions"] = [permissions[0]["id"]]

        preset_resp = apply_permission_preset(role_id, preset_permissions)
        assert "applied" in preset_resp and preset_resp["applied"] is True

        # Verify permission matrix after applying preset
        matrix_after_preset = get_permission_matrix(role_id)
        assert any(perm["id"] == preset_permissions["permissions"][0] and perm.get("enabled", False) for perm in matrix_after_preset.get("permissions", []))

    finally:
        if role is not None:
            try:
                deleted = delete_role(role["id"])
                assert deleted is True
            except Exception:
                # If deletion fails, raise but test already run
                pass

test_administration_role_and_permission_management()
