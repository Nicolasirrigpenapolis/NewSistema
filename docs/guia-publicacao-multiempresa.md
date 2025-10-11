# Guia de Publicação Multiempresa

Este guia descreve o passo a passo para publicar o sistema para várias empresas usando uma única base de código. A aplicação (ASP.NET + React) permanece idêntica para todas as instalações; apenas o arquivo de configuração local (`appsettings.json`) muda para apontar pro banco e pastas da empresa correspondente.

---

## 1. Visão Geral

- **Código único:** apenas um build backend/frontend.
- **Isolamento por empresa:** cada instalação usa sua própria pasta (ex.: `C:\Sistemas\Irrigacao\`), apontando para um banco distinto (`SistemaIrrigacao`, `SistemaChinellato`, etc.).
- **Configuração dinâmica:** o backend lê a seção `Empresa` do `appsettings.json` para saber identificador, string de conexão e diretórios de armazenamento.
- **Permissões:** a tela “Configurações > Emitente” exige permissão `emitente.configurar` e controla o único emitente da instalação, incluindo upload da logomarca.

---

## 2. Pré-requisitos

1. **Builds gerados**:  
   - Backend: `dotnet publish -c Release -o publish`
   - Frontend: `npm install && npm run build`
2. **SQL Server acessível** para cada banco específico (os nomes sugeridos: `SistemaIrrigacao`, `SistemaChinellato`, `SistemaDesenvolvimento`, etc.).
3. **Usuário e senha** com permissão de `CREATE DATABASE` / `ALTER` / `CREATE TABLE` nos servidores de destino (ou bancos já criados previamente).
4. **Diretórios de instalação** definidos (ex.: `C:\Sistemas\Irrigacao`, `C:\Sistemas\Chinellato`). Cada empresa terá uma cópia do build com seu próprio `appsettings.json`.

---

## 3. Estrutura de Pastas Recomendada

```
C:\Sistemas\Irrigacao\
 ├─ Backend\Api.exe (+ dlls)
 ├─ frontend\build\ (conteúdo gerado pelo React)
 └─ appsettings.json (personalizado para esta empresa)

C:\Sistemas\Chinellato\
 ├─ Backend\Api.exe (+ dlls)
 ├─ frontend\build\
 └─ appsettings.json (personalizado para esta empresa)
```

---

## 4. Preparando o `appsettings.json` por Empresa

1. Copie o modelo apropriado em `docs/configuracoes/`:
   - `appsettings.Irrigacao.json`
   - `appsettings.Chinellato.json`
2. Renomeie para `appsettings.json` dentro da pasta da empresa.
3. Ajuste os valores conforme necessário:
   - **`Empresa.StringConexao`** → connection string do banco da empresa (ex.: `Server=SERVIDOR;Database=SistemaIrrigacao;User Id=usuario;Password=senha;...`).
   - **`Armazenamento.CaminhoBase`** → diretório onde ficarão certificados, XMLs e logos (pode ser relativo ou absoluto). Recomenda-se algo dentro da própria pasta da empresa (`C:\Sistemas\Irrigacao\dados`). O `ContextoEmpresa` garante que as subpastas (`certificados`, `xml`, `logos`) existam.
   - **`IdentificadorEmpresa` e `NomeExibicao`** → usados para logs e para exibir o nome no frontend.
4. Se desejar armazenar logs específicos por instalação, configure o `Logging` no mesmo arquivo (opcional).

**Importante:** O backend utiliza apenas a string de conexão definida em `Empresa.StringConexao`. As chaves no bloco `ConnectionStrings` são mantidas para compatibilidade e podem ser reutilizadas por ferramentas, mas a aplicação em tempo de execução lê sempre a seção `Empresa`.

---

## 5. Executando migrações

Antes de rodar a API em cada instalação, aplique as migrations no banco apontado pela configuração:

```powershell
cd C:\Sistemas\Irrigacao
dotnet Backend.Api.dll --migrar   # (se implementar um parâmetro próprio)
# ou use o comando de desenvolvimento:
dotnet ef database update --context SistemaContext --project ..\backend\Backend.Api.csproj
```

> **Observação:** Se o comando `dotnet ef` expirar, verifique a conexão com o SQL Server (porta/instância correta, credenciais, firewall) e tente novamente. A mensagem de timeout indica que o servidor não respondeu dentro do tempo configurado (30s por padrão).

---

## 6. Publicando uma Nova Versão

### 6.1 Build do Backend

```powershell
dotnet publish ..\backend\Backend.Api.csproj -c Release -o .\publish
```

Copie o conteúdo da pasta `publish` para a pasta da empresa (ex.: `C:\Sistemas\Irrigacao`). Certifique-se de manter o `appsettings.json` personalizado — não sobrescreva o arquivo sem revisar.

### 6.2 Build do Frontend

```powershell
cd ..\frontend
npm install
npm run build
```

Copie a pasta `build` para dentro da pasta da empresa (`C:\Sistemas\Irrigacao\frontend\build\`). O backend já serve arquivos estáticos se esta pasta existir, e o React utiliza as chamadas para `/api/...` usando a URL configurada.

### 6.3 Voltar a produção

1. Pare o serviço ou site IIS em execução (caso exista).
2. Substitua binários e o `frontend\build` na pasta da empresa.
3. Confirme se `appsettings.json` está com a string de conexão correta.
4. Rode novamente `dotnet ef database update --context SistemaContext` (ou um script customizado) para garantir que o schema esteja atualizado com as migrations mais recentes.
5. Inicie a aplicação/serviço.

---

## 7. Alternando Entre Empresas

Para trabalhar com mais de uma configuração no mesmo servidor:

1. **Mantenha pastas separadas.** Exemplo:
   - `C:\Sistemas\Irrigacao\` → aponta para `SistemaIrrigacao`
   - `C:\Sistemas\Chinellato\` → aponta para `SistemaChinellato`
2. **Cada serviço/processo** deve iniciar na pasta correspondente para carregar o seu `appsettings.json`. Pode-se usar serviços Windows distintos, contêineres diferentes ou sites separados no IIS.
3. **Não é necessário recompilar** para alternar empresas; basta garantir que o arquivo de configuração correto esteja presente antes de iniciar o processo.

Quando precisar criar uma nova instalação:

1. Copie os binários publicados.
2. Crie uma nova pasta (ex.: `C:\Sistemas\NovaEmpresa`).
3. Crie um `appsettings.json` com os dados daquela empresa (pode copiar um modelo de `docs/configuracoes`).
4. Aplique migrations apontando para o banco dessa empresa.
5. Inicie a aplicação nessa pasta.

---

## 8. Permissões e Tela de Emitente

- A nova tela “Configurações > Emitente” (rota `/configuracoes/emitente`) usa o endpoint `GET /api/configuracoes/empresa` para exibir o nome da empresa, banco configurado e diretórios utilizados.
- O upload da logomarca é feito via `POST /api/emitentes/logotipo` e a imagem é servida com `GET /api/emitentes/logotipo` do repositório local desta instalação (`{CaminhoBase}/logos`).
- O CRUD agora é único; caso já exista emitente cadastrado, o backend bloqueia novas inserções e apenas permite edição.
- Garanta que o usuário possua `emitente.configurar` para visualizar essa tela. Sem a permissão, o menu “Emitente” em “Configurações” não aparece.

---

## 9. Dicas de Troubleshooting

| Problema | Causa provável | Ação |
|----------|----------------|------|
| `dotnet ef database update` expira em timeout | SQL Server inacessível ou instância incorreta | Verificar endereço/porta, permissões e disponibilidade do servidor |
| Logomarca não aparece no frontend | Upload não realizado ou URL apontando para cache antigo | Verifique se o arquivo está em `{CaminhoBase}\logos`, atualize a página (o endpoint adiciona `?v=timestamp` para bust de cache) |
| Tela “Configurações > Emitente” retorna 403 | Usuário sem permissão `emitente.configurar` | Adicione a permissão ao cargo através da administração de permissões |
| Dois emitentes cadastrados | `appsettings.json` apontando para o mesmo banco em duas instalações diferentes | Certifique-se de que cada `StringConexao` refere-se ao banco correto; sincronize migrações se bancos foram recriados |

---

## 10. Checklist Rápido de Publicação

1. Gerar builds backend + frontend em Release.
2. Copiar artefatos para `C:\Sistemas\<Empresa>\`.
3. Preparar `appsettings.json` com:
   - `IdentificadorEmpresa` ajustado.
   - `StringConexao` apontando para o banco dessa empresa.
   - Diretórios de armazenamento específicos.
4. Rodar migrations (`dotnet ef database update --context SistemaContext`).
5. Iniciar o serviço/API e validar via `/api/health` e tela “Configurações > Emitente”.

Seguindo esses passos, é possível administrar quantas instalações forem necessárias reutilizando o mesmo código, garantindo isolamento de dados por banco e personalizações pontuais por empresa.
