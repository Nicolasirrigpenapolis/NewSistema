-- Script para habilitar especificamente a permissão admin.permissions.assign para o Programador
-- Execute este script no SQL Server Management Studio ou via sqlcmd

USE SistemaModelo; -- ajuste para o banco específico da empresa (ex.: SistemaIrrigacao ou SistemaChinellato)
GO

-- Declarar variáveis
DECLARE @CargoProgramadorId INT;
DECLARE @PermissaoId INT;

-- Obter o ID do cargo Programador
SELECT @CargoProgramadorId = Id FROM Cargos WHERE Nome = 'Programador';

-- Verificar se o cargo existe
IF @CargoProgramadorId IS NULL
BEGIN
    PRINT 'ERRO: Cargo Programador não encontrado!';
    RETURN;
END

PRINT 'Cargo Programador encontrado com ID: ' + CAST(@CargoProgramadorId AS VARCHAR(10));

-- Obter o ID da permissão admin.permissions.assign
SELECT @PermissaoId = Id FROM Permissoes WHERE Codigo = 'admin.permissions.assign';

-- Verificar se a permissão existe
IF @PermissaoId IS NULL
BEGIN
    PRINT 'ERRO: Permissão admin.permissions.assign não encontrada!';
    RETURN;
END

PRINT 'Permissão admin.permissions.assign encontrada com ID: ' + CAST(@PermissaoId AS VARCHAR(10));
PRINT '';

-- Verificar se já está atribuída
IF EXISTS (SELECT 1 FROM CargoPermissoes WHERE CargoId = @CargoProgramadorId AND PermissaoId = @PermissaoId)
BEGIN
    PRINT 'A permissão admin.permissions.assign JÁ ESTÁ atribuída ao cargo Programador!';
    PRINT 'Nenhuma ação necessária.';
END
ELSE
BEGIN
    -- Atribuir a permissão
    INSERT INTO CargoPermissoes (CargoId, PermissaoId, DataAtribuicao)
    VALUES (@CargoProgramadorId, @PermissaoId, GETDATE());

    PRINT 'SUCESSO! Permissão admin.permissions.assign foi atribuída ao cargo Programador!';
END

PRINT '';
PRINT '====================================';
PRINT 'VERIFICAÇÃO FINAL';
PRINT '====================================';

-- Listar todas as permissões de admin para o Programador
SELECT
    p.Codigo,
    p.Nome,
    p.Descricao,
    CASE WHEN cp.PermissaoId IS NOT NULL THEN 'SIM' ELSE 'NÃO' END AS [Atribuída]
FROM Permissoes p
LEFT JOIN CargoPermissoes cp ON cp.PermissaoId = p.Id AND cp.CargoId = @CargoProgramadorId
WHERE p.Modulo = 'admin'
ORDER BY p.Codigo;

GO
