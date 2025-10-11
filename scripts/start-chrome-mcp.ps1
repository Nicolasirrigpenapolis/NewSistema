<#
Start-Chrome-MCP.ps1

Uso:
  .\start-chrome-mcp.ps1 [-StartChrome] [-ChromePath <string>] [-DebugPort <int>]

O script faz duas coisas principais:
  1) Inicia o processo npm 'npx chrome-devtools-mcp' (servidor MCP)
  2) Opcionalmente inicia o Google Chrome com a flag --remote-debugging-port para permitir conexões do DevTools

Observações:
  - Requer Node.js + npx disponível no PATH
  - Execute no PowerShell como usuário (não precisa de privilegios elevados em geral)
#>

[CmdletBinding()]
param(
    [switch]$StartChrome,
    [string]$ChromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe",
    [int]$DebugPort = 9222
)

function Start-MCPServer {
    Write-Host "Iniciando chrome-devtools-mcp via npx (background)..."
  # Usa start-process para rodar npx em background e redirecionar output para arquivo de log
  $npxArgs = "chrome-devtools-mcp@latest --channel stable --logFile chrome-devtools-mcp.log"
  # -NoNewWindow não é compatível com -WindowStyle; usamos apenas -WindowStyle Hidden para criar processo em background
  Start-Process -FilePath "npx" -ArgumentList $npxArgs -WindowStyle Hidden
    Write-Host "MCP server iniciado (logs em chrome-devtools-mcp.log)"
}

function Start-ChromeWithDebugPort {
    param([string]$Path, [int]$Port)
    if (-Not (Test-Path $Path)) {
        Write-Warning "Chrome não encontrado em '$Path'. Passe o parâmetro -ChromePath com o caminho correto.";
        return
    }

    $userData = Join-Path -Path $env:TEMP -ChildPath "chrome-mcp-user-data"
    if (-Not (Test-Path $userData)) { New-Item -ItemType Directory -Path $userData | Out-Null }

    $args = "--remote-debugging-port=$Port --user-data-dir=`"$userData`" --no-first-run --disable-extensions"
    Write-Host "Iniciando Chrome com porta de debug $Port..."
    Start-Process -FilePath $Path -ArgumentList $args
}

# Run actions
Start-MCPServer

if ($StartChrome) { Start-ChromeWithDebugPort -Path $ChromePath -Port $DebugPort }

Write-Host "Pronto. Se precisar parar o MCP, finalize o processo 'node' ou use 'taskkill' no Windows." 
