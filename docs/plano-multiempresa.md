# Plano de Adaptação Multiempresa

Este documento descreve a reorganização necessária para executar o sistema como uma única base de código atendendo múltiplas empresas (tenants), mantendo o isolamento de dados e garantindo que o frontend permaneça responsável apenas por experiência visual.

## 1. Arquitetura Geral
- **Código único**: manter um único repositório e pipeline de build. As publicações geradas para cada empresa serão idênticas, diferenciando-se apenas pelo arquivo de configuração local (`appsettings.json` ou `.ini`).
- **Instalação por empresa**: cada pasta de instalação conterá o binário do backend, o build do frontend e o arquivo de configuração com a string de conexão exclusiva.
- **Execução simultânea**: as instalações são independentes; é possível abrir os ambientes de todas as empresas ao mesmo tempo, pois cada pasta usa o seu próprio banco (ex.: `SistemaIrrigacao`, `SistemaChinellato`) e arquivos isolados.
- **Isolamento por banco**: cada empresa aponta para o próprio banco (`SistemaIrrigacao`, `SistemaChinellato`, ...). Migrações são executadas individualmente por instalação.
- **Carregamento automático**: a aplicação monta os serviços lendo `OpcoesEmpresa` (seção `Empresa`) e inicializa `IContextoEmpresa`, que distribui a string de conexão e metadados para o restante do backend.

```
C:\Sistemas\Irrigacao\
 ├─ appsettings.json    (Empresa.IdentificadorEmpresa = "irrigacao")
 ├─ Backend\Api.exe
 └─ frontend\build\

C:\Sistemas\Chinelato\
 ├─ appsettings.json    (Empresa.IdentificadorEmpresa = "chinelato")
 ├─ Backend\Api.exe
 └─ frontend\build\
```

## 2. Backend (ASP.NET)
### 2.1 Camada de Empresa (Tenancy)
- Adicionar `OpcoesEmpresa` (configuração fortemente tipada) e `IContextoEmpresa` (expõe empresa ativa).
- Criar `ContextoEmpresa` que lê `IConfiguration["Empresa"]`, valida campos obrigatórios e disponibiliza via DI (singleton).
- Adaptar `Program.cs` para:
  1. Carregar `OpcoesEmpresa` usando `builder.Configuration.GetSection("Empresa")`.
  2. Registrar `IContextoEmpresa`.
  3. Alterar `DbContextOptions` para consumir `contextoEmpresa.StringConexao`.
- Implementar `IMigracaoTenantService` que executa `context.Database.MigrateAsync()` ao iniciar, garantindo schema atualizado para o banco da instalação.

### 2.2 Serviços e Repositórios
- Injetar `IContextoEmpresa` em serviços que necessitam salvar arquivos ou acessar configurações específicas (certificado, XML, logo).
- Centralizar validação de permissões e filtros por empresa apenas no backend. O frontend consome endpoints já filtrados.

### 2.3 Permissões
- Criar tabela `Modulos` (opcional) e garantir que `Permissoes` inclua coluna `CodigoEmpresa` caso seja necessário segmentar permissões customizadas por empresa.
- No login o backend devolve `claims` com as permissões do cargo (já filtradas pelo banco da empresa). O JWT nunca mistura dados de outras empresas.

## 3. Frontend (React + TypeScript + Tailwind)
- Continuar usando `AuthContext` e `PermissionContext` para habilitar/ocultar rotas. Os endpoints sempre retornam dados da empresa carregada no backend.
- Introduzir componente `GuardaPermissao` (`<GuardaPermissao codigo="emitentes.editar">`) que encapsula a regra de exibir botões e rotas.
- Consumir endpoint `/configuracoes/empresa` para obter metadados de branding (nome, logotipo, cor primária) exibidos no layout.
- Recarregar a logomarca usando `GET /api/emitentes/logotipo?v=<timestamp>` garantindo cache controlado quando um novo arquivo for enviado.

## 4. Tela de Emitente
- Movê-la para menu `Configurações > Emitente`.
- Backend expõe apenas um registro (`GET /emitente/configuracao`, `PUT /emitente/configuracao`). O cadastro múltiplo é desativado.
- Adicionar upload da logomarca (`POST /emitente/logotipo`) gravando arquivo em `OpcoesEmpresa.Armazenamento.PastaLogos`.
- Respeitar permissão dedicada (`emitente.configurar`). Apenas usuários com essa permissão enxergam a tela.
- Endpoint `GET /api/emitentes/logotipo` devolve a imagem armazenada; o controlador atualiza automaticamente `CaminhoLogotipo` e invalida o cache após upload.

## 5. Deploy e Manutenção
1. Publicar backend (`dotnet publish`) e frontend (`npm run build`).
2. Copiar artefatos para a pasta da empresa.
3. Editar `appsettings.json`:
   ```json
   {
     "Empresa": {
       "IdentificadorEmpresa": "irrigacao",
       "NomeExibicao": "Irrigação Penápolis",
       "StringConexao": "Server=...;Database=SistemaIrrigacao;...",
       "Armazenamento": {
         "CaminhoBase": "dados",
         "PastaLogos": "logos"
       }
     }
   }
   ```
   Exemplos completos por instalação estão em `docs/configuracoes/appsettings.Irrigacao.json` e `docs/configuracoes/appsettings.Chinellato.json`.
4. Executar migrações: `Backend\Api.exe --migrar` (parâmetro a ser implementado) ou serviço Windows configurado para rodar `Update-Database`.
5. Reiniciar serviço/IIS para carregar configurações.

## 6. Próximos Passos
1. Implementar `ServicoContextoEmpresa` com fallback e logging de configuração inválida.
2. Refatorar `Program.cs` e `SistemaContext` para usar `StringConexao` dinâmica.
3. Criar endpoints de configuração de emitente e logotipo.
4. Ajustar rotas do frontend e inserir guardas de permissão.
5. Documentar scripts de diferenciação de bancos (migrações e seeds específicos).

Com essa estrutura, mantemos o mesmo código para todas as empresas, garantindo isolamento por banco, permissões configuráveis e experiência consistente.
