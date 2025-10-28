-- ============================================
-- Script para Resetar Senha do Programador
-- ============================================
-- Este script reseta APENAS a senha do usuário "programador" para: conectairrig@
-- NENHUM DADO SERÁ PERDIDO! Apenas a senha será atualizada.
-- 
-- COMO USAR:
-- 1. Abra o SQL Server Management Studio (SSMS) ou Azure Data Studio
-- 2. Conecte-se ao seu banco de dados
-- 3. Execute este script
-- ============================================

-- A senha "conectairrig@" com o salt "SistemaModelo2024" gera o hash abaixo:
-- Hash SHA256 de "conectairrig@SistemaModelo2024" em Base64

-- Antes de atualizar, vamos ver o usuário atual
SELECT 
    Id,
    UserName,
    Nome,
    Ativo,
    PasswordHash AS 'Hash Antigo'
FROM Usuarios
WHERE UserName = 'programador';

-- Agora vamos resetar a senha
UPDATE Usuarios
SET PasswordHash = 'hKp+Y1LJDWzVOce9PbKzNJxG3G+MlbXJTlf/+WmQd5w='
WHERE UserName = 'programador';

-- Verificar se a atualização foi bem-sucedida
SELECT 
    Id,
    UserName,
    Nome,
    Ativo,
    PasswordHash AS 'Hash Novo',
    'Senha resetada com sucesso!' AS Status
FROM Usuarios
WHERE UserName = 'programador';

-- ============================================
-- PRONTO! A senha foi resetada para: conectairrig@
-- ============================================
-- Você pode fazer login com:
--   Usuário: programador
--   Senha: conectairrig@
-- ============================================
