-- Create tables for K-System

-- System Users (Admins)
CREATE TABLE IF NOT EXISTS system_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    login VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CONVIDADO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaborators (Employees)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula VARCHAR(50) UNIQUE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    filial VARCHAR(255) NOT NULL,
    login VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    funcao VARCHAR(255),
    setor VARCHAR(255) NOT NULL,
    departamento VARCHAR(255),
    segmento VARCHAR(255),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Logs
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources (Filiais, Funcoes, Setores, Departamentos)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'FILIAL', 'FUNCAO', 'SETOR', 'DEPARTAMENTO'
    name VARCHAR(255) NOT NULL,
    UNIQUE(type, name)
);

-- Insert initial data
INSERT INTO system_users (nome, login, senha, role) VALUES
    ('ADMINISTRADOR', 'ADMIN', '1235', 'ADMIN'),
    ('WILLAMS SILVA', 'WILLAMS', '1235', 'ADMIN'),
    ('YURI PINHEIRO', 'YURI', '123', 'ADMIN'),
    ('TESTE', 'TESTE', '123', 'CONVIDADO')
ON CONFLICT (login) DO NOTHING;

INSERT INTO resources (type, name) VALUES
    ('FILIAL', 'L01 - CONDOR'),
    ('FILIAL', 'L02 - A.CACELA'),
    ('FILIAL', 'L03 - DOCA'),
    ('FILIAL', 'L04 - OBIDOS'),
    ('FILIAL', 'L05 - CASTANHEITA'),
    ('FILIAL', 'L06 - MGZ CASTANHEIRA'),
    ('FILIAL', 'L07 - P.BARSIL'),
    ('FILIAL', 'L08 - B.CAMPOS'),
    ('FILIAL', 'L09 - HUMAITA'),
    ('FILIAL', 'L10 - CASTANHAL'),
    ('FILIAL', 'L11 - ICOARACI'),
    ('FILIAL', 'L12 - BR'),
    ('FILIAL', 'L15 - ESC.CENTRAL'),
    ('FILIAL', 'L17 - CANUDOS'),
    ('FUNCAO', 'TECNOLOGIA DA INFORMAÇÃO'),
    ('FUNCAO', 'CPD'),
    ('FUNCAO', 'CM'),
    ('FUNCAO', 'ESTOQUE'),
    ('FUNCAO', 'GERENCIA'),
    ('FUNCAO', 'DEP.TROCA'),
    ('FUNCAO', 'FRENTE DE LOJA'),
    ('FUNCAO', 'HOME CENTER'),
    ('FUNCAO', 'FARMACIA'),
    ('SETOR', 'DESENVOLVIMENTO'),
    ('SETOR', 'INFRAESTRUTURA'),
    ('SETOR', 'RECRUTAMENTO'),
    ('SETOR', 'CONTABILIDADE'),
    ('SETOR', 'VENDAS'),
    ('SETOR', 'ALMOXARIFADO'),
    ('SETOR', 'NUTRILIDER'),
    ('SETOR', 'PET SHOP'),
    ('SETOR', 'OTICA'),
    ('SETOR', 'TESOURARIA')
ON CONFLICT (type, name) DO NOTHING;

INSERT INTO users (matricula, nome_completo, filial, login, senha, funcao, setor, segmento) VALUES
    ('1001', 'DAVID SOUZA', 'L06 - MGZ CASTANHEIRA', '123', '123', 'TECNOLOGIA DA INFORMAÇÃO', 'INFRAESTRUTURA', 'SUPERMERCADO'),
    ('1002', 'JOÃO PEDRO', 'L02 - A.CACELA', '123', '123', 'CPD', 'DESENVOLVIMENTO', 'SUPERMERCADO'),
    ('1003', 'PAULO RICARDO', 'L01 - CONDOR', '123', '123', 'ESTOQUE', 'ALMOXARIFADO', 'SUPERMERCADO'),
    ('1004', 'MARIA SOCORRO', 'L04 - OBIDOS', '123', '123', 'GERENCIA', 'CONTABILIDADE', 'SUPERMERCADO'),
    ('1005', 'EDUARDO SANTOS', 'L06 - MGZ CASTANHEIRA', '123', '123', 'CM', 'VENDAS', 'SUPERMERCADO'),
    ('1006', 'LUIZ VASCONCELOS', 'L02 - A.CACELA', '123', '123', 'DEP.TROCA', 'DESENVOLVIMENTO', 'SUPERMERCADO'),
    ('1007', 'SOCORRO GOMES', 'L01 - CONDOR', '123', '123', 'CPD', 'ALMOXARIFADO', 'SUPERMERCADO'),
    ('1008', 'PAULA CATARINA', 'L04 - OBIDOS', '123', '123', 'GERENCIA', 'CONTABILIDADE', 'SUPERMERCADO')
ON CONFLICT (matricula) DO NOTHING;
