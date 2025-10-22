<!-- Comentario adicionado pela Codex -->
# Sistema MDF-e

Sistema completo para emissão e gerenciamento de Manifesto Eletrônico de Documentos Fiscais (MDF-e) com interface web moderna e sistema de autenticação.

## Arquitetura

- **Backend**: .NET 8 API com Entity Framework Core
- **Frontend**: React 18 com TypeScript, Tailwind (ou MUI caso reintroduzido) e Context API
- **Autenticação**: JWT com refresh tokens e proteção de rotas
- **Integração**: Provider interno (stub) para evolução futura de comunicação com SEFAZ
- **Banco de Dados**: SQL Server Express com Entity Framework migrations
- **UI/UX**: Design responsivo (dark mode planejado)

## Estrutura do Projeto

```
Projeto/
├── Sistema.sln                  # Solução principal (.NET)
├── backend/                     # Backend .NET API
│   ├── Controllers/             # Controllers (Emitentes, MDFe, Auth, etc.)
│   ├── Models/                  # Modelos de dados (EF Core)
│   ├── Services/                # Regras de negócio
│   ├── Data/                    # DbContext e configurações
│   ├── DTOs/                    # Data Transfer Objects
│   ├── Migrations/              # Migrações EF
│   ├── Repositories/            # (Se aplicável) Acesso a dados
│   ├── Validation/              # Validadores e atributos
│   └── Program.cs / appsettings # Bootstrap e configuração
├── frontend/                    # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas
│   │   ├── contexts/            # Context API providers
│   │   ├── services/            # Chamadas à API
│   │   ├── hooks/               # Custom hooks
│   │   ├── types/               # Tipos/Interfaces
│   │   └── routes/              # Definição de rotas
├── certificados/                # Certificados digitais A1/A3
├── docs/                        # Documentação e scripts auxiliares
├── docker-compose.yml           # Orquestração dos serviços
└── README.md                    # Este arquivo
```

## Execução

### Desenvolvimento rápido

Backend + frontend (manual):
```
# Backend
cd backend
 dotnet run

# Frontend (outro terminal)
cd frontend
 npm install
 npm run dev
```

### URLs

- API: http://localhost:8080 (via Docker) ou porta padrão Kestrel (ex: 5000/5001) em dev local
- Swagger: /swagger
- Frontend: http://localhost:3000

## Configuração

1. Ajuste a connection string em `backend/appsettings.Development.json`
2. Coloque o certificado digital em `certificados/` (ex: `cert.pfx`)
3. Defina variáveis sensíveis (JWT, conexão) via secret user-secrets ou variáveis de ambiente
4. Execute as migrações (se necessário) `dotnet ef database update` dentro de `backend/`

### 🔐 Usuário Programador (Acesso Imediato)

O sistema cria automaticamente um **usuário com acesso total** na primeira execução:

```
Usuário: programador
Senha: conectairrig@
```

**Características:**
- ✅ Criado automaticamente na inicialização
- ✅ Acesso a todas as 37 permissões do sistema
- ✅ Não requer scripts SQL manuais
- ✅ Idempotente - pode reiniciar quantas vezes quiser

📖 **Documentação completa**: [docs/USUARIO_PROGRAMADOR.md](docs/USUARIO_PROGRAMADOR.md)

## Funcionalidades Implementadas (Resumo)

- Gestão de Emitentes, Veículos, Condutores, Contratantes, Seguradoras, Municípios
- Emissão e gerenciamento de MDF-e (base estrutural)
- Autenticação JWT (login, proteção de rotas)
- Organização modular (Controllers/Services/DTOs)
- Docker para padronização de ambiente

## Infraestrutura e Qualidade

- EF Core + Migrations
- Interceptores para performance (se configurados na pasta `Data/Interceptors`)
- Scripts em `scripts/` e `database/` para seed/ajustes

## Docker

Subir ambiente completo (API + SQL Server):
```
docker compose up -d --build
```
Parar:
```
docker compose down
```
Resetar dados:
```
docker compose down -v
 docker compose up -d --build
```
Logs:
```
docker compose logs -f api
```

## Variáveis de Ambiente Principais

| Variável          | Serviço   | Descrição                              |
|-------------------|----------|----------------------------------------|
| MDFE_DB_CONN       | api      | Connection string EF Core              |
| SA_PASSWORD        | sqlserver| Senha usuário sa                        |
| JWT_SECRET_KEY     | api      | Chave assinatura JWT                   |

## Próximos Incrementos Sugeridos

- Seed inicial automatizado
- Cache de dependências dotnet/npm entre builds
- Pipeline CI/CD (GitHub Actions) com versionamento de imagem
- Métricas e health detail (/health /ready /live)
- Testes automatizados (unit + integração mínima)

## Notas sobre Rename

O arquivo de solução foi renomeado de `MDFe-Sistema.sln` para `Sistema.sln`. Caso tenha workspaces locais antigos, remova referências antigas e abra a nova solução:
```
code Sistema.sln
```
Ou no Visual Studio: File > Open > Project/Solution > escolha `Sistema.sln`.

## Documentação Adicional

- `docs/` para materiais complementares
- Scripts de banco em `database/`

Se algo do documento anterior estiver faltando e você quiser reintroduzir, me avise que restauro os trechos específicos.
