import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
AUTH_USERNAME = "programador"
AUTH_PASSWORD = "conectairrig@"
TIMEOUT = 30


def test_list_and_filter_mdfe_documents():
    """
    Verify that MDF-es can be listed with filters applied,
    showing correct results based on filter criteria.
    """

    # Prepare authentication and headers
    auth = HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD)
    headers = {
        "Accept": "application/json",
    }

    # Example filter parameters
    # Assuming the API supports query params for filtering like status, date range, etc.
    # These can be adjusted depending on actual available filters.
    filters = {
        "status": "Authorized",  # filter by status of MDF-e
        "page": 1,
        "pageSize": 10
    }

    try:
        # Call the GET endpoint with filters
        response = requests.get(
            f"{BASE_URL}/api/mdfe",
            headers=headers,
            auth=auth,
            params=filters,
            timeout=TIMEOUT
        )

        # Validate response status code
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}"

        # Validate response content
        data = response.json()
        assert isinstance(data, dict), f"Expected a dictionary from response JSON, got {type(data)}"
        # Expecting a paginated structure with items or results list
        mdfe_list = data.get("items") or data.get("results") or data.get("data")
        assert mdfe_list is not None, "Response JSON missing expected list key ('items', 'results' or 'data')"
        assert isinstance(mdfe_list, list), f"Expected a list for MDF-e documents but got {type(mdfe_list)}"

        # Check that all returned MDF-e have the filtered status "Authorized"
        for mdfe in mdfe_list:
            status = mdfe.get("status") or mdfe.get("situacao") or mdfe.get("statusMdfe")
            assert status is not None, "MDF-e document missing status field"
            assert status == "Authorized", f"Expected MDF-e status 'Authorized', got '{status}'"

    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"
    except ValueError as e:
        assert False, f"Response content is not valid JSON: {e}"


test_list_and_filter_mdfe_documents()