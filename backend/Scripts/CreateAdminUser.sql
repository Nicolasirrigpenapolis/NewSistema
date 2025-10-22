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

        ------------------------------------------------------------
        -- Garantir que todas as permissões necessárias existam
        ------------------------------------------------------------
        DECLARE @Permissoes TABLE (Codigo NVARCHAR(100), Nome NVARCHAR(200), Descricao NVARCHAR(500), Modulo NVARCHAR(100));

        INSERT INTO @Permissoes (Codigo, Nome, Descricao, Modulo)
        VALUES
            (N'veiculos.listar', N'Listar veículos', N'Permite visualizar a lista de veículos', N'Operacoes'),
            (N'veiculos.criar', N'Criar veículos', N'Permite cadastrar novos veículos', N'Operacoes'),
            (N'veiculos.editar', N'Editar veículos', N'Permite editar veículos existentes', N'Operacoes'),
            (N'reboques.listar', N'Listar reboques', N'Permite visualizar a lista de reboques', N'Operacoes'),
            (N'reboques.criar', N'Criar reboques', N'Permite cadastrar novos reboques', N'Operacoes'),
            (N'reboques.editar', N'Editar reboques', N'Permite editar reboques existentes', N'Operacoes'),
            (N'condutores.listar', N'Listar condutores', N'Permite visualizar a lista de condutores', N'Operacoes'),
            (N'condutores.criar', N'Criar condutores', N'Permite cadastrar novos condutores', N'Operacoes'),
            (N'condutores.editar', N'Editar condutores', N'Permite editar condutores existentes', N'Operacoes'),
            (N'viagens.criar', N'Criar viagens', N'Permite cadastrar novas viagens', N'Operacoes'),
            (N'viagens.editar', N'Editar viagens', N'Permite editar viagens existentes', N'Operacoes'),
            (N'mdfe.listar', N'Listar MDF-e', N'Permite visualizar o módulo de MDF-e', N'Documentos'),
            (N'nfe.listar', N'Listar NF-e', N'Permite visualizar o módulo de NF-e', N'Documentos'),
            (N'cte.listar', N'Listar CT-e', N'Permite visualizar o módulo de CT-e', N'Documentos'),
            (N'contratantes.listar', N'Listar contratantes', N'Permite visualizar contratantes', N'Cadastros'),
            (N'contratantes.criar', N'Criar contratantes', N'Permite cadastrar novos contratantes', N'Cadastros'),
            (N'contratantes.editar', N'Editar contratantes', N'Permite editar contratantes existentes', N'Cadastros'),
            (N'seguradoras.listar', N'Listar seguradoras', N'Permite visualizar seguradoras', N'Cadastros'),
            (N'seguradoras.criar', N'Criar seguradoras', N'Permite cadastrar novas seguradoras', N'Cadastros'),
            (N'seguradoras.editar', N'Editar seguradoras', N'Permite editar seguradoras existentes', N'Cadastros'),
            (N'municipios.listar', N'Listar municípios', N'Permite visualizar municípios', N'Cadastros'),
            (N'municipios.criar', N'Criar municípios', N'Permite cadastrar novos municípios', N'Cadastros'),
            (N'municipios.editar', N'Editar municípios', N'Permite editar municípios existentes', N'Cadastros'),
            (N'fornecedores.listar', N'Listar fornecedores', N'Permite visualizar fornecedores', N'Cadastros'),
            (N'fornecedores.criar', N'Criar fornecedores', N'Permite cadastrar novos fornecedores', N'Cadastros'),
            (N'fornecedores.editar', N'Editar fornecedores', N'Permite editar fornecedores existentes', N'Cadastros'),
            (N'manutencoes.listar', N'Listar manutenções', N'Permite visualizar manutenções', N'Manutencoes'),
            (N'manutencoes.criar', N'Criar manutenções', N'Permite cadastrar manutenções', N'Manutencoes'),
            (N'manutencoes.editar', N'Editar manutenções', N'Permite editar manutenções', N'Manutencoes'),
            (N'relatorios.manutencao', N'Relatório de manutenção', N'Permite acessar o relatório de manutenção', N'Inteligencia'),
            (N'relatorios.despesas', N'Relatório de despesas', N'Permite acessar o relatório de despesas de viagens', N'Inteligencia'),
            (N'usuarios.listar', N'Listar usuários', N'Permite visualizar usuários', N'Administracao'),
            (N'usuarios.criar', N'Criar usuários', N'Permite criar novos usuários', N'Administracao'),
            (N'usuarios.visualizar', N'Visualizar usuários', N'Permite visualizar detalhes de usuários', N'Administracao'),
            (N'usuarios.editar', N'Editar usuários', N'Permite editar usuários', N'Administracao'),
            (N'cargos.listar', N'Listar cargos', N'Permite visualizar cargos', N'Administracao'),
            (N'emitente.configurar', N'Configurar emitente', N'Permite configurar dados do emitente', N'Administracao');

        INSERT INTO dbo.Permissoes (Codigo, Nome, Descricao, Modulo, Ativo, DataCriacao)
        SELECT p.Codigo, p.Nome, p.Descricao, p.Modulo, 1, SYSDATETIME()
        FROM @Permissoes AS p
        WHERE NOT EXISTS (
            SELECT 1 FROM dbo.Permissoes WHERE Codigo = p.Codigo
        );

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
