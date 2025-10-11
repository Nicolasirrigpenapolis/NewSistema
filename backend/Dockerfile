ARG BUILD_FRONTEND=1

# ============================
# STAGE 1 - Build frontend (opcional)
# ============================
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps || npm install
COPY frontend/ ./
RUN [ "$BUILD_FRONTEND" = "1" ] && npm run build || echo "Skip frontend build"

# ============================
# STAGE 2 - Restore & build backend
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY MDFe-Sistema.sln ./
COPY MDFe.Api/MDFeApi.csproj MDFe.Api/
# (Adicionar outros csproj se aparecerem dependências compartilhadas)
RUN dotnet restore MDFe.Api/MDFeApi.csproj
COPY . .
RUN dotnet publish MDFe.Api/MDFeApi.csproj -c Release -o /app/publish /p:UseAppHost=false /p:Deterministic=true

# ============================
# STAGE 3 - Runtime final
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=backend-build /app/publish .
# Copia estáticos só se buildado
COPY --from=frontend-build /app/frontend/build ./wwwroot

# Variáveis default (podem ser sobrescritas)
ENV ASPNETCORE_URLS=http://0.0.0.0:8080 \
    DOTNET_EnableDiagnostics=0 \
    COMPlus_ReadyToRun=0 \
    COMPlus_TC_QuickJitForLoops=1 \
    MDFE_DB_CONN="Server=sqlserver,1433;Database=SistemaModelo;User Id=sa;Password=Your_strong_password123;TrustServerCertificate=True;Encrypt=False;MultipleActiveResultSets=True;"

## Criar usuário não-root
RUN adduser --disabled-password --home /app --gecos "App User" appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8080
ENTRYPOINT ["dotnet", "MDFeApi.dll"]
