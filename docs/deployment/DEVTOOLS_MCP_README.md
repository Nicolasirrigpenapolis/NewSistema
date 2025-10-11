Chrome DevTools MCP - Instruções (Windows)
=========================================

Resumo
------
Este projeto já inclui scripts para iniciar o servidor MCP (Chrome DevTools MCP) que permite automação/integração com ferramentas como Claude/agents.

Arquivos úteis
-------------
- `chrome-mcp-start.bat`  - script batch existente que roda `npx chrome-devtools-mcp`.
- `start-chrome-mcp.ps1`  - (novo) script PowerShell que inicia o MCP via npx e opcionalmente inicia o Chrome com `--remote-debugging-port`.
- `claude-mcp-config.json` - configuração de exemplo usada pelo Claude/agent para executar o MCP.

Pré-requisitos
-------------
- Node.js (para npx)
- Google Chrome instalado
- Permissão para executar scripts PowerShell (se necessário, execute: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`)

Usando o script batch existente
-------------------------------
1. Abra um Prompt de Comando (cmd) ou PowerShell
2. Execute:

   chrome-mcp-start.bat

Isso irá iniciar `npx chrome-devtools-mcp` em background e criar o arquivo `chrome-devtools-mcp.log` com logs.

Usando o novo script PowerShell
-------------------------------
Abra PowerShell e, a partir da raiz do workspace (`c:\Projetos\SistemaNovo`), execute:

1) Apenas iniciar o servidor MCP (background):

   .\start-chrome-mcp.ps1

2) Iniciar MCP e também abrir o Chrome com porta de depuração remota (padrão 9222):

   .\start-chrome-mcp.ps1 -StartChrome

3) Passar um caminho customizado para o executável do Chrome:

   .\start-chrome-mcp.ps1 -StartChrome -ChromePath "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" -DebugPort 9223

Verificando se está funcionando
-------------------------------
- Abra `http://localhost:9222` no navegador; se o Chrome foi iniciado com `--remote-debugging-port=9222`, você verá a interface do remote debugging com páginas abertas.
- Verifique o arquivo `chrome-devtools-mcp.log` gerado na pasta do projeto para logs do servidor MCP.

Integração com Claude / agents
-------------------------------
O arquivo `claude-mcp-config.json` já aponta para `npx chrome-devtools-mcp@latest`. Se estiver usando o Claude local, assegure que as permissões e configurações permitam executar `npx`.

Dicas de troubleshooting
-----------------------
- Se `npx` não for reconhecido: instale Node.js ou ajuste o PATH.
- Se PowerShell bloquear a execução do script: rode `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` como administrador ou siga políticas de TI.
- Para encerrar o MCP: identifique o processo Node.js que está rodando e termine-o (`tasklist | findstr node` e `taskkill /PID <pid> /F`).

Próximos passos sugeridos
------------------------
- Se quiser carregar uma extensão DevTools local, adicione a flag `--load-extension="<caminho>"` ao iniciar o Chrome no `start-chrome-mcp.ps1`.
- Automatizar start/stop completo com um script que mata processos antigos antes de iniciar.
