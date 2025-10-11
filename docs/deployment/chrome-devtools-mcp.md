# Chrome DevTools MCP — Instruções de uso (Windows)

Este repositório já possui suporte para rodar o servidor Chrome DevTools MCP. Abaixo há instruções rápidas para desenvolvedores Windows.

Pré-requisitos
- Node.js (v20.19+ recomendado)
- npm / npx disponível no PATH
- Google Chrome instalado

Scripts úteis no repositório
- `start-chrome-mcp.ps1` — PowerShell que inicia `npx chrome-devtools-mcp` em background e pode abrir o Chrome com `--remote-debugging-port`.
- `chrome-mcp-start.bat` — batch que inicia `npx chrome-devtools-mcp`.
- `mcp-restart.ps1`, `mcp-check.ps1`, `mcp-net-check.ps1` — utilitários de verificação e reinício.

Scripts npm (frontend)
- `npm run mcp:start` (na pasta `frontend`) — inicia `chrome-devtools-mcp` via `npx` e grava logs em `chrome-devtools-mcp.log` na raiz do projeto.
- `npm run start:with-mcp` — inicia o MCP em background e, em seguida, inicia o servidor do frontend (equivalente a executar ambos manualmente).

Como iniciar (passos rápidos)
1) A partir da raiz do projeto (PowerShell):
   .\start-chrome-mcp.ps1
   (ou) execute `chrome-mcp-start.bat` no cmd/powershell.

2) Para iniciar o frontend com MCP (opcional):
   cd frontend; npm run start:with-mcp

Verificar funcionamento
- Confira o arquivo `chrome-devtools-mcp.log` no diretório do projeto para logs do servidor MCP.
- Se o Chrome for iniciado com `--remote-debugging-port=9222`, abra `http://localhost:9222` para ver as páginas abertas.

Configuração para clientes MCP (ex.: Claude, Gemini, etc.)
Adicione a seguinte configuração ao seu cliente MCP (exemplo):

{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    }
  }
}

Links úteis
- Repositório oficial: https://github.com/ChromeDevTools/chrome-devtools-mcp/
- Blog/introdução: https://developer.chrome.com/blog/chrome-devtools-mcp

Notas de segurança
O MCP expõe o conteúdo do navegador ao cliente. Não execute o MCP com páginas sensíveis abertas ou em ambientes não confiáveis.
