Write-Host '== Inspect listeners on port 9222 and process details ==' -ForegroundColor Cyan

$lines = netstat -ano | Select-String ':9222'
if (-not $lines) { Write-Host 'No listeners for :9222 found.'; exit }

foreach ($l in $lines) {
    $text = $l.ToString().Trim()
    Write-Host "Netstat: $text"
    # split by whitespace and take last token as PID
    $parts = -split $text
    $pid = $parts[-1]
    Write-Host "Found PID: $pid" -ForegroundColor Yellow
    try {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pid"
        if ($proc) {
            $proc | Select-Object ProcessId, Name, CommandLine, ExecutablePath | Format-List
        } else {
            Write-Host "Process $pid not found via WMI"
        }
    } catch {
        Write-Host "Error inspecting PID $pid: $_"
    }
    Write-Host '---'
}

Write-Host 'Done.' -ForegroundColor Green
