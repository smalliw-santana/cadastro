-- 1. Drop old tables if they exist to avoid conflicts
DROP TABLE IF EXISTS filiais CASCADE;
DROP TABLE IF EXISTS funcoes CASCADE;
DROP TABLE IF EXISTS setores CASCADE;

-- 2. Create the correct tables
CREATE TABLE IF NOT EXISTS system_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    login VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CONVIDADO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricula VARCHAR(50) UNIQUE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    filial VARCHAR(255) NOT NULL,
    login VARCHAR(255) NOT NULL,
    senha VARCHAR(255),
    funcao VARCHAR(255) NOT NULL,
    setor VARCHAR(255) NOT NULL,
    departamento VARCHAR(255),
    codigo_venda VARCHAR(50),
    segmento VARCHAR(50) NOT NULL,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(255) DEFAULT 'Sistema',
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    UNIQUE(type, name)
);

-- 3. Disable RLS (Row Level Security) so the app can read/write without complex policies
ALTER TABLE system_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;

-- 4. Insert initial Admin user
INSERT INTO system_users (nome, login, senha, role) 
VALUES ('ADMINISTRADOR', 'ADMIN', '1235', 'ADMIN')
ON CONFLICT (login) DO NOTHING;

-- 5. Insert initial resources
INSERT INTO resources (type, name) VALUES 
  ('FILIAL', 'L01 - CONDOR'), ('FILIAL', 'L02 - A.CACELA'), ('FILIAL', 'L03 - DOCA'),
  ('FUNCAO', 'GERENCIA'), ('FUNCAO', 'FRENTE DE LOJA'), ('FUNCAO', 'ESTOQUE'),
  ('SETOR', 'VENDAS'), ('SETOR', 'ALMOXARIFADO'), ('SETOR', 'TESOURARIA')
ON CONFLICT (type, name) DO NOTHING;
