
export interface User {
  id: string;
  matricula: string;
  nomeCompleto: string;
  filial: string; // Changed from Enum to string to support dynamic entries
  login: string;
  senha?: string;
  funcao: string; // Changed from Enum to string
  setor: string; // Changed from Enum to string
  departamento?: string;
  dataCadastro: string;
  codigoVenda?: string;
  segmento: string;
  usuarioColetor?: string;
  rhdoTi?: string;
  status?: 'ATIVO' | 'INATIVO';
}

export interface SystemUser {
  id: string;
  nome: string;
  login: string;
  senha?: string; // Optional for display, required for creation
  role: 'ADMIN' | 'CONVIDADO';
  createdAt: string;
  avatarUrl?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SYSTEM';
  resource?: string;
  details: string;
}

export type ViewState = 
  | 'LOGIN' 
  | 'DASHBOARD' 
  | 'REGISTER' 
  | 'USERS_LIST' 
  | 'REPORTS' 
  | 'DB_SETTINGS'
  | 'REGISTER_FILIAL'
  | 'REGISTER_FUNCAO'
  | 'REGISTER_SETOR'
  | 'MANAGE_ACCESS'
  | 'SYSTEM_LOGS'
  | 'PROFILE';
