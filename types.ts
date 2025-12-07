
export interface User {
  id: string;
  matricula: string;
  nomeCompleto: string;
  filial: string; // Changed from Enum to string to support dynamic entries
  login: string;
  senha?: string;
  departamento: string; // Changed from Enum to string
  setor: string; // Changed from Enum to string
  dataCadastro: string;
}

export type ViewState = 
  | 'LOGIN' 
  | 'DASHBOARD' 
  | 'REGISTER' 
  | 'USERS_LIST' 
  | 'REPORTS' 
  | 'DB_SETTINGS'
  | 'REGISTER_FILIAL'
  | 'REGISTER_DEPARTAMENTO'
  | 'REGISTER_SETOR';
