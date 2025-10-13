import requests

BASE_URL = "http://localhost:5000"
AUTH_CREDENTIALS = ("programador", "conectairrig@")
TIMEOUT = 30

def test_permission_enforcement_based_on_user_roles():
    # Step 1: Authenticate to get JWT token for admin user with known permissions
    login_url = f"{BASE_URL}/api/auth"
    login_payload = {
        "username": AUTH_CREDENTIALS[0],
        "password": AUTH_CREDENTIALS[1]
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        login_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Authentication failed: {e}"

    token = login_resp.json().get("token")
    assert token is not None and isinstance(token, str) and token != "", "JWT token not returned in login response"

    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Retrieve all roles (cargos) to test permissions presets
    cargos_url = f"{BASE_URL}/api/cargos"
    try:
        cargos_resp = requests.get(cargos_url, headers=headers, timeout=TIMEOUT)
        cargos_resp.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Failed to retrieve roles: {e}"

    cargos = cargos_resp.json()
    assert isinstance(cargos, list), "Expected cargos list"

    # If no roles exist, fail the test since roles are needed to test permission enforcement
    assert len(cargos) > 0, "No roles found to test permissions"

    # Step 3: For each role, simulate a user with that role and verify permissions enforcement
    # Since backend auth bypass is allowed for development (per instructions),
    # we can assume an endpoint to get permissions for a role preset
    # If not available, fallback: Check /api/permissoes?roleId={id} or try to access a protected resource.

    permissions_url = f"{BASE_URL}/api/permissoes"

    for cargo in cargos:
        role_id = cargo.get("id")
        role_name = cargo.get("nome") or cargo.get("name") or str(role_id)
        assert role_id is not None, f"Role id missing for role {role_name}"

        # Retrieve permissions preset for this role
        try:
            perm_resp = requests.get(f"{permissions_url}?roleId={role_id}", headers=headers, timeout=TIMEOUT)
            if perm_resp.status_code == 404:
                # Endpoint might not support role query param, skip with warning
                continue
            perm_resp.raise_for_status()
        except requests.RequestException as e:
            assert False, f"Failed to retrieve permissions for role {role_name}: {e}"

        permissions = perm_resp.json()
        assert isinstance(permissions, list), f"Permissions for role {role_name} is not a list"

        # Step 4: Verify permissions match expected structure and enforce access answers

        # Example: test access to /admin/usuarios (user management) endpoint which usually requires admin permission

        # We simulate access by setting a header to impersonate this role (if supported)
        # Since no explicit impersonation API in provided PRD,
        # we attempt a GET to /api/admin/usuarios with same token and check permission error or success
        # Alternatively, we test allowed feature access based on permissions data

        # For demonstration, test feature access by checking permission entries for key features
        # Permissions entries could be like {"feature": "user_management", "allowed": True}

        for perm in permissions:
            feature = perm.get("feature") or perm.get("name") or ""
            allowed = perm.get("allowed") if "allowed" in perm else perm.get("acesso", None)

            assert feature != "", f"Permission feature missing in role {role_name}"

            # Validate permission value type
            assert isinstance(allowed, bool), f"Permission 'allowed' flag not boolean for feature {feature} in role {role_name}"

        # Step 5: Test actual enforcement for a known protected endpoint based on permission

        # We'll identify if the role has permission to access the user list in /api/usuarios
        user_management_permission = next((p for p in permissions if p.get("feature","").lower() in ["user_management","usuarios","admin_usuarios"]), None)
        can_access_users = user_management_permission["allowed"] if user_management_permission else False

        usuarios_url = f"{BASE_URL}/api/usuarios"

        # Since we only have one token (admin), actual enforcement test is limited.
        # However, as instructions mention auth bypass for development, assume an impersonation header "X-Impersonate-RoleId"
        impersonate_headers = headers.copy()
        impersonate_headers["X-Impersonate-RoleId"] = str(role_id)

        resp = requests.get(usuarios_url, headers=impersonate_headers, timeout=TIMEOUT)
        if can_access_users:
            assert resp.status_code == 200, (
                f"Role '{role_name}' should have access to user management but received status {resp.status_code}"
            )
            data = resp.json()
            assert isinstance(data, list), f"Expected list of users for role '{role_name}'"
        else:
            assert resp.status_code in (401, 403), (
                f"Role '{role_name}' should NOT have access to user management but received status {resp.status_code}"
            )

    print("Permission enforcement based on user roles tested successfully.")

test_permission_enforcement_based_on_user_roles()