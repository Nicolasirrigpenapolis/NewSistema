/*
    Script: CreateAdminUser.sql
    Objetivo: criar/atualizar um cargo administrativo, um usuário associado e
              garantir que todas as permissões existentes sejam atribuídas a esse cargo.
    Uso: ajuste o nome do banco em USE [...] se necessário antes de executar.
    Observação: o hash segue o mesmo algoritmo do backend (SHA256 + salt "SistemaModelo2024").
*/

USE [SistemaDesenvolvimento];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @UserName           NVARCHAR(100) = N'programador';
DECLARE @UserDisplayName    NVARCHAR(200) = N'Programador do Sistema';
DECLARE @PlainPassword      NVARCHAR(128) = N'conectairrig@';
DECLARE @CargoNome          NVARCHAR(100) = N'Programador';
DECLARE @CargoDescricao     NVARCHAR(500) = N'Cargo Programador criado via script manual';

DECLARE @PasswordHash NVARCHAR(256) = N'giiqGVlPsbaX+qBfclpdlEyG8gsNw6552/5hU5Rxy0U='; -- SHA256(UTF-8(password+salt))

BEGIN TRY
    BEGIN TRANSACTION;

        DECLARE @CargoId INT = (
            SELECT TOP (1) Id
            FROM dbo.Cargos
            WHERE Nome = @CargoNome
        );

        IF @CargoId IS NULL
        BEGIN
            INSERT INTO dbo.Cargos (Nome, Descricao, Ativo, DataCriacao)
            VALUES (@CargoNome, @CargoDescricao, 1, SYSDATETIME());

            SET @CargoId = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE dbo.Cargos
               SET Descricao = @CargoDescricao,
                   Ativo = 1,
                   DataUltimaAlteracao = SYSDATETIME()
             WHERE Id = @CargoId;
        END

        DECLARE @UsuarioId INT = (
            SELECT TOP (1) Id
            FROM dbo.Usuarios
            WHERE UserName = @UserName
        );

        IF @UsuarioId IS NULL
        BEGIN
            INSERT INTO dbo.Usuarios (UserName, Nome, PasswordHash, CargoId, Ativo, DataCriacao)
            VALUES (@UserName, @UserDisplayName, @PasswordHash, @CargoId, 1, SYSDATETIME());

            SET @UsuarioId = SCOPE_IDENTITY();
        END
        ELSE
        BEGIN
            UPDATE dbo.Usuarios
               SET Nome = @UserDisplayName,
                   PasswordHash = @PasswordHash,
                   CargoId = @CargoId,
                   Ativo = 1,
                   DataUltimaAlteracao = SYSDATETIME()
             WHERE Id = @UsuarioId;
        END

        INSERT INTO dbo.CargoPermissoes (CargoId, PermissaoId, DataCriacao)
        SELECT @CargoId, p.Id, SYSDATETIME()
        FROM dbo.Permissoes AS p
        WHERE NOT EXISTS (
            SELECT 1
            FROM dbo.CargoPermissoes AS cp
            WHERE cp.CargoId = @CargoId
              AND cp.PermissaoId = p.Id
        );

    COMMIT TRANSACTION;

    SELECT
        u.Id,
        u.UserName,
        u.Nome,
        c.Nome AS Cargo,
        PermissoesVinculadas = COUNT(cp.Id)
    FROM dbo.Usuarios AS u
    INNER JOIN dbo.Cargos AS c ON c.Id = u.CargoId
    LEFT JOIN dbo.CargoPermissoes AS cp ON cp.CargoId = c.Id
    WHERE u.Id = @UsuarioId
    GROUP BY u.Id, u.UserName, u.Nome, c.Nome;

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
