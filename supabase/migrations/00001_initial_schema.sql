-- Create tables for the application

-- Table: filiais
CREATE TABLE filiais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: funcoes
CREATE TABLE funcoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: setores
CREATE TABLE setores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: system_users
CREATE TABLE system_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  login VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'CONVIDADO')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: users (colaboradores)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula VARCHAR(50) NOT NULL UNIQUE,
  nome_completo VARCHAR(255) NOT NULL,
  filial VARCHAR(255) NOT NULL,
  login VARCHAR(255) NOT NULL,
  senha VARCHAR(255),
  funcao VARCHAR(255) NOT NULL,
  setor VARCHAR(255) NOT NULL,
  codigo_venda VARCHAR(50),
  segmento VARCHAR(50) NOT NULL,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: system_logs
CREATE TABLE system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SYSTEM')),
  resource VARCHAR(255) NOT NULL,
  details TEXT NOT NULL
);

-- Insert initial data
INSERT INTO filiais (nome) VALUES 
  ('L01 - CONDOR'), ('L02 - A.CACELA'), ('L03 - DOCA'), ('L04 - OBIDOS'), 
  ('L05 - CASTANHEITA'), ('L06 - MGZ CASTANHEIRA'), ('L07 - P.BARSIL'), 
  ('L08 - B.CAMPOS'), ('L09 - HUMAITA'), ('L10 - CASTANHAL'), 
  ('L11 - ICOARACI'), ('L12 - BR'), ('L15 - ESC.CENTRAL'), ('L17 - CANUDOS')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO funcoes (nome) VALUES 
  ('TECNOLOGIA DA INFORMAÇÃO'), ('CPD'), ('CM'), ('ESTOQUE'), 
  ('GERENCIA'), ('DEP.TROCA'), ('FRENTE DE LOJA'), ('HOME CENTER'), ('FARMACIA')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO setores (nome) VALUES 
  ('DESENVOLVIMENTO'), ('INFRAESTRUTURA'), ('RECRUTAMENTO'), ('CONTABILIDADE'), 
  ('VENDAS'), ('ALMOXARIFADO'), ('NUTRILIDER'), ('PET SHOP'), ('OTICA'), ('TESOURARIA')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO system_users (nome, login, senha, role) VALUES 
  ('ADMINISTRADOR', 'ADMIN', '1235', 'ADMIN'),
  ('WILLAMS SILVA', 'WILLAMS', '1235', 'ADMIN'),
  ('YURI PINHEIRO', 'YURI', '123', 'ADMIN'),
  ('TESTE', 'TESTE', '123', 'CONVIDADO')
ON CONFLICT (login) DO NOTHING;
