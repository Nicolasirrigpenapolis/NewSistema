import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:5000"
AUTH = HTTPBasicAuth("programador", "conectairrig@")
TIMEOUT = 30

def test_backup_and_uptime_monitoring():
    # Endpoint assumed for backups monitoring
    backup_status_url = f"{BASE_URL}/api/backup/status"
    # Endpoint assumed for system uptime monitoring
    uptime_status_url = f"{BASE_URL}/api/monitoring/uptime"

    try:
        # Check daily backup status
        backup_response = requests.get(backup_status_url, auth=AUTH, timeout=TIMEOUT)
        assert backup_response.status_code == 200, f"Backup status API returned {backup_response.status_code}"
        backup_data = backup_response.json()
        # Expecting backup_data to have 'lastBackupDate' and 'status' fields
        assert "lastBackupDate" in backup_data, "Missing 'lastBackupDate' in backup status response"
        assert "status" in backup_data, "Missing 'status' in backup status response"
        assert backup_data["status"].lower() == "success", f"Backup status is not successful: {backup_data['status']}"

        # Check system uptime status
        uptime_response = requests.get(uptime_status_url, auth=AUTH, timeout=TIMEOUT)
        assert uptime_response.status_code == 200, f"Uptime status API returned {uptime_response.status_code}"
        uptime_data = uptime_response.json()
        # Expecting uptime_data to have 'uptimePercentage' field as float or int
        assert "uptimePercentage" in uptime_data, "Missing 'uptimePercentage' in uptime status response"
        uptime_pct = float(uptime_data["uptimePercentage"])
        # SLA requires uptime >= 99%
        assert uptime_pct >= 99.0, f"System uptime below SLA threshold: {uptime_pct}%"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    except AssertionError:
        raise
    except Exception as e:
        assert False, f"Unexpected error: {e}"

test_backup_and_uptime_monitoring()