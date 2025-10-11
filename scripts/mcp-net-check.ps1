Write-Host '== MCP Network & process checks ==' -ForegroundColor Cyan
Write-Host ''

Write-Host 'Checking TCP listeners for :9222' -ForegroundColor Yellow
netstat -ano | Select-String ':9222' | ForEach-Object { Write-Host $_ }
Write-Host ''

Write-Host 'Node processes with command line:' -ForegroundColor Yellow
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Select-Object ProcessId, CommandLine | Format-Table -AutoSize

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
