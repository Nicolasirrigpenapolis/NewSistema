-- Script para popular a tabela Estados com códigos IBGE

-- Primeiro, verificar se a tabela existe e criar se necessário
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Estados' AND xtype='U')
BEGIN
    CREATE TABLE Estados (
        Id int IDENTITY(1,1) PRIMARY KEY,
        Uf nvarchar(2) NOT NULL,
        Nome nvarchar(100) NOT NULL,
        CodigoIbge nvarchar(2) NOT NULL,
        Ativo bit NOT NULL DEFAULT 1
    );
END

-- Limpar dados existentes
DELETE FROM Estados;

-- Popular com todos os estados do Brasil
INSERT INTO Estados (Uf, Nome, CodigoIbge, Ativo) VALUES
('AC', 'Acre', '12', 1),
('AL', 'Alagoas', '17', 1),
('AP', 'Amapá', '16', 1),
('AM', 'Amazonas', '13', 1),
('BA', 'Bahia', '29', 1),
('CE', 'Ceará', '23', 1),
('DF', 'Distrito Federal', '53', 1),
('ES', 'Espírito Santo', '32', 1),
('GO', 'Goiás', '52', 1),
('MA', 'Maranhão', '21', 1),
('MT', 'Mato Grosso', '51', 1),
('MS', 'Mato Grosso do Sul', '50', 1),
('MG', 'Minas Gerais', '31', 1),
('PA', 'Pará', '15', 1),
('PB', 'Paraíba', '25', 1),
('PR', 'Paraná', '41', 1),
('PE', 'Pernambuco', '26', 1),
('PI', 'Piauí', '22', 1),
('RJ', 'Rio de Janeiro', '33', 1),
('RN', 'Rio Grande do Norte', '24', 1),
('RS', 'Rio Grande do Sul', '43', 1),
('RO', 'Rondônia', '11', 1),
('RR', 'Roraima', '14', 1),
('SC', 'Santa Catarina', '42', 1),
('SP', 'São Paulo', '35', 1),
('SE', 'Sergipe', '28', 1),
('TO', 'Tocantins', '17', 1);

-- Verificar se os dados foram inseridos
SELECT COUNT(*) AS 'Total de Estados' FROM Estados;
SELECT * FROM Estados ORDER BY Uf;