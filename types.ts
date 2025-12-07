
export enum Filial {
  MATRIZ = 'MATRIZ',
  SAO_PAULO = 'SÃO PAULO',
  RIO_DE_JANEIRO = 'RIO DE JANEIRO',
  BELO_HORIZONTE = 'BELO HORIZONTE',
  CURITIBA = 'CURITIBA',
  PORTO_ALEGRE = 'PORTO ALEGRE'
}

export enum Departamento {
  TI = 'TECNOLOGIA DA INFORMAÇÃO',
  RH = 'RECURSOS HUMANOS',
  FINANCEIRO = 'FINANCEIRO',
  COMERCIAL = 'COMERCIAL',
  OPERACIONAL = 'OPERACIONAL',
  LOGISTICA = 'LOGÍSTICA'
}

export enum Setor {
  DESENVOLVIMENTO = 'DESENVOLVIMENTO',
  INFRAESTRUTURA = 'INFRAESTRUTURA',
  RECRUTAMENTO = 'RECRUTAMENTO',
  CONTABILIDADE = 'CONTABILIDADE',
  VENDAS = 'VENDAS',
  ALMOXARIFADO = 'ALMOXARIFADO'
}

export interface User {
  id: string;
  matricula: string;
  nomeCompleto: string;
  filial: Filial;
  login: string;
  senha?: string; // Optional because we might verify it but not display it
  departamento: Departamento;
  setor: Setor;
  dataCadastro: string; // ISO String
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'REGISTER' | 'USERS_LIST' | 'REPORTS';
