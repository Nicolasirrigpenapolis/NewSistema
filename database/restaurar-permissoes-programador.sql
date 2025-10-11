-- Script para restaurar TODAS as permissões do cargo Programador
-- Execute este script no SQL Server Management Studio ou via sqlcmd

USE SistemaModelo; -- ajuste para o banco específico da empresa (ex.: SistemaIrrigacao ou SistemaChinellato)
GO

-- Declarar variável para armazenar o ID do cargo Programador
DECLARE @CargoProgramadorId INT;

-- Obter o ID do cargo Programador
SELECT @CargoProgramadorId = Id FROM Cargos WHERE Nome = 'Programador';

-- Verificar se o cargo existe
IF @CargoProgramadorId IS NULL
BEGIN
    PRINT 'ERRO: Cargo Programador não encontrado!';
    RETURN;
END

PRINT 'Cargo Programador encontrado com ID: ' + CAST(@CargoProgramadorId AS VARCHAR(10));
PRINT '';

-- Remover TODAS as permissões atuais do cargo Programador (para limpar)
DELETE FROM CargoPermissoes WHERE CargoId = @CargoProgramadorId;
PRINT 'Permissões antigas removidas.';
PRINT '';

-- Inserir TODAS as permissões para o cargo Programador
INSERT INTO CargoPermissoes (CargoId, PermissaoId, DataAtribuicao)
SELECT
    @CargoProgramadorId,
    p.Id,
    GETDATE()
FROM Permissoes p
WHERE NOT EXISTS (
    SELECT 1 FROM CargoPermissoes cp
    WHERE cp.CargoId = @CargoProgramadorId AND cp.PermissaoId = p.Id
);

-- Verificar quantas permissões foram atribuídas
DECLARE @TotalPermissoes INT;
DECLARE @PermissoesAtribuidas INT;

SELECT @TotalPermissoes = COUNT(*) FROM Permissoes;
SELECT @PermissoesAtribuidas = COUNT(*) FROM CargoPermissoes WHERE CargoId = @CargoProgramadorId;

PRINT '';
PRINT '====================================';
PRINT 'RESULTADO DA RESTAURAÇÃO';
PRINT '====================================';
PRINT 'Total de permissões no sistema: ' + CAST(@TotalPermissoes AS VARCHAR(10));
PRINT 'Permissões atribuídas ao Programador: ' + CAST(@PermissoesAtribuidas AS VARCHAR(10));
PRINT '';

IF @TotalPermissoes = @PermissoesAtribuidas
BEGIN
    PRINT 'SUCESSO! Todas as permissões foram restauradas para o cargo Programador!';
END
ELSE
BEGIN
    PRINT 'AVISO: Nem todas as permissões foram atribuídas. Verifique o banco de dados.';
END

PRINT '====================================';
PRINT '';

-- Listar algumas permissões atribuídas para confirmar
PRINT 'Amostra de permissões atribuídas:';
SELECT TOP 10
    p.Codigo,
    p.Nome,
    p.Modulo
FROM CargoPermissoes cp
INNER JOIN Permissoes p ON p.Id = cp.PermissaoId
WHERE cp.CargoId = @CargoProgramadorId
ORDER BY p.Modulo, p.Nome;

GO
