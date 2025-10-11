-- Script para criar conta Master inicial
-- Execute após rodar as migrações

-- 1. Criar cargo Programador se não existir
IF NOT EXISTS (SELECT 1 FROM Cargos WHERE Nome = 'Programador')
BEGIN
    INSERT INTO Cargos (Nome, Descricao, Ativo, DataCriacao)
    VALUES ('Programador', 'Desenvolvedor do sistema com acesso total', 1, GETDATE())
END

-- 2. Criar usuário Master
DECLARE @CargoId INT = (SELECT Id FROM Cargos WHERE Nome = 'Programador')

IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE UserName = 'master')
BEGIN
    INSERT INTO Usuarios (
        UserName,
        NormalizedUserName,
        Email,
        NormalizedEmail,
        EmailConfirmed,
        PasswordHash,
        SecurityStamp,
        ConcurrencyStamp,
        PhoneNumberConfirmed,
        TwoFactorEnabled,
        LockoutEnabled,
        AccessFailedCount,
        Nome,
        CargoId,
        Ativo,
        DataCriacao
    )
    VALUES (
        'master',
        'MASTER',
        'master@sistema.com',
        'MASTER@SISTEMA.COM',
        1,
        'AQAAAAIAAYagAAAAEO3ZOwOKKOr3Vps+XJQE3Rwd4eiP4jYHD9c6QxIKWfvKQaK6A8LLlKs2/Uix+AkcXw==', -- Senha: master123
        NEWID(),
        NEWID(),
        0,
        0,
        1,
        0,
        'Usuário Master do Sistema',
        @CargoId,
        1,
        GETDATE()
    )
END

-- Verificar se foi criado
SELECT
    u.Id,
    u.UserName,
    u.Nome,
    u.Email,
    c.Nome as Cargo,
    u.Ativo,
    u.DataCriacao
FROM Usuarios u
LEFT JOIN Cargos c ON u.CargoId = c.Id
WHERE u.UserName = 'master'