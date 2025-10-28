-- Script para atualizar a permissão de "excluir" para "desativar"
-- Data: 22/10/2025

USE SistemaDesenvolvimento;
GO

-- Atualizar a permissão de cargos.excluir para cargos.desativar
UPDATE Permissoes
SET 
    Codigo = 'cargos.desativar',
    Nome = 'Desativar cargos',
    Descricao = 'Permite desativar cargos'
WHERE Codigo = 'cargos.excluir';

-- Verificar se a atualização foi bem-sucedida
SELECT * FROM Permissoes WHERE Codigo LIKE '%cargos%';
GO
