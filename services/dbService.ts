
import { User, SystemUser, SystemLog } from '../types.ts';

const DB_KEY = 'k_system_users_db';
const SYSTEM_USERS_KEY = 'k_system_access_users'; // New DB for Login Users
const SYSTEM_LOGS_KEY = 'k_system_logs'; // New DB for Logs

const KEYS = {
    FILIAIS: 'k_system_filiais',
    FUNCOES: 'k_system_funcoes',
    SETORES: 'k_system_setores'
};

// Robust ID Generator Fallback
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for non-secure contexts or older browsers
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Initial Data Defaults
const DEFAULTS = {
    FILIAIS: ['L01 - CONDOR', 'L02 - A.CACELA', 'L03 - DOCA', 'L04 - OBIDOS', 'L05 - CASTANHEITA', 'L06 - MGZ CASTANHEIRA', 'L07 - P.BARSIL', 'L08 - B.CAMPOS', 'L09 - HUMAITA', 'L10 - CASTANHAL', 'L11 - ICOARACI', 'L12 - BR', 'L15 - ESC.CENTRAL', 'L17 - CANUDOS'],
    FUNCOES: ['TECNOLOGIA DA INFORMAÇÃO', 'CPD', 'CM', 'ESTOQUE', 'GERENCIA', 'DEP.TROCA', 'FRENTE DE LOJA', 'HOME CENTER', 'FARMACIA', ''],
    SETORES: ['DESENVOLVIMENTO', 'INFRAESTRUTURA', 'RECRUTAMENTO', 'CONTABILIDADE', 'VENDAS', 'ALMOXARIFADO', 'NUTRILIDER', 'PET SHOP', 'OTICA', 'TESOURARIA']
};

const INITIAL_USERS: User[] = [
  {
    id: '1',
    matricula: '1001',
    nomeCompleto: 'DAVID SOUZA',
    filial: 'L06 - MGZ CASTANHEIRA',
    login: '123',
    senha: '123',
    funcao: 'TECNOLOGIA DA INFORMAÇÃO',
    setor: 'INFRAESTRUTURA',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

   {
    id: '2',
    matricula: '1002',
    nomeCompleto: 'JOÃO PEDRO',
    filial: 'L02 - A.CACELA',
    login: '123',
    senha: '123',
    funcao: 'CPD',
    setor: 'DESENVOLVIMENTO',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '3',
    matricula: '1003',
    nomeCompleto: 'PAULO RICARDO',
    filial: 'L01 - CONDOR',
    login: '123',
    senha: '123',
    funcao: 'ESTOQUE',
    setor: 'ALMOXARIFADO',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '4',
    matricula: '1004',
    nomeCompleto: 'MARIA SOCORRO',
    filial: 'L04 - OBIDOS',
    login: '123',
    senha: '123',
    funcao: 'GERENCIA',
    setor: 'CONTABILIDADE',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

   {
    id: '5',
    matricula: '1005',
    nomeCompleto: 'EDUARDO SANTOS',
    filial: 'L06 - MGZ CASTANHEIRA',
    login: '123',
    senha: '123',
    funcao: 'CM',
    setor: 'VENDAS',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

   {
    id: '6',
    matricula: '1006',
    nomeCompleto: 'LUIZ VASCONCELOS',
    filial: 'L02 - A.CACELA',
    login: '123',
    senha: '123',
    funcao: 'DEP.TROCA',
    setor: 'DESENVOLVIMENTO',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '7',
    matricula: '1007',
    nomeCompleto: 'SOCORRO GOMES',
    filial: 'L01 - CONDOR',
    login: '123',
    senha: '123',
    funcao: 'CPD',
    setor: 'ALMOXARIFADO',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '8',
    matricula: '1008',
    nomeCompleto: 'PAULA CATARINA',
    filial: 'L04 - OBIDOS',
    login: '123',
    senha: '123',
    funcao: 'GERENCIA',
    setor: 'CONTABILIDADE',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '9',
    matricula: '1009',
    nomeCompleto: 'DAVID SOUZA',
    filial: 'L06 - MGZ CASTANHEIRA',
    login: '123',
    senha: '123',
    funcao: 'TECNOLOGIA DA INFORMAÇÃO',
    setor: 'INFRAESTRUTURA',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

   {
    id: '10',
    matricula: '1010',
    nomeCompleto: 'JOÃO PEDRO',
    filial: 'L02 - A.CACELA',
    login: '123',
    senha: '123',
    funcao: 'CPD',
    setor: 'DESENVOLVIMENTO',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '11',
    matricula: '1011',
    nomeCompleto: 'PAULO RICARDO',
    filial: 'L01 - CONDOR',
    login: '123',
    senha: '123',
    funcao: 'ESTOQUE',
    setor: 'ALMOXARIFADO',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '12',
    matricula: '1012',
    nomeCompleto: 'MARIA SOCORRO',
    filial: 'L04 - OBIDOS',
    login: '123',
    senha: '123',
    funcao: 'GERENCIA',
    setor: 'CONTABILIDADE',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

   {
    id: '13',
    matricula: '1013',
    nomeCompleto: 'EDUARDO SANTOS',
    filial: 'L06 - MGZ CASTANHEIRA',
    login: '123',
    senha: '123',
    funcao: 'CM',
    setor: 'VENDAS',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

   {
    id: '14',
    matricula: '1014',
    nomeCompleto: 'LUIZ VASCONCELOS',
    filial: 'L02 - A.CACELA',
    login: '123',
    senha: '123',
    funcao: 'DEP.TROCA',
    setor: 'DESENVOLVIMENTO',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '15',
    matricula: '1015',
    nomeCompleto: 'SOCORRO GOMES',
    filial: 'L01 - CONDOR',
    login: '123',
    senha: '123',
    funcao: 'CPD',
    setor: 'ALMOXARIFADO',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  },

  {
    id: '16',
    matricula: '1016',
    nomeCompleto: 'PAULA CATARINA',
    filial: 'L04 - OBIDOS',
    login: '123',
    senha: '123',
    funcao: 'GERENCIA',
    setor: 'CONTABILIDADE',
    segmento: 'SUPERMERCADO',
    dataCadastro: new Date().toISOString()
  }
];

// Default Admin for the new Access System
const INITIAL_SYSTEM_USERS: SystemUser[] = [
    {
        id: 'admin-01',
        nome: 'ADMINISTRADOR',
        login: 'ADMIN',
        senha: '1235',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
    },

    {
        id: 'admin-02',
        nome: 'WILLAMS SILVA',
        login: 'WILLAMS',
        senha: '1235',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
    },

    {
        id: 'admin-03',
        nome: 'YURI PINHEIRO',
        login: 'YURI',
        senha: '123',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
    },

    {
        id: 'admin-04',
        nome: 'TESTE',
        login: 'TESTE',
        senha: '123',
        role: 'CONVIDADO',
        createdAt: new Date().toISOString()
    }

];

// Helper to get list or init default
const getList = (key: string, defaultList: string[]): string[] => {
    const stored = localStorage.getItem(key);
    if (!stored) {
        localStorage.setItem(key, JSON.stringify(defaultList));
        return defaultList;
    }
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
            return parsed;
        }
    } catch (e) {}
    localStorage.setItem(key, JSON.stringify(defaultList));
    return defaultList;
};

// Helper to add to list
const addToList = (key: string, value: string): boolean => {
    const list = getList(key, []);
    const upperValue = value.toUpperCase().trim();
    if (list.includes(upperValue)) return false;
    
    list.push(upperValue);
    localStorage.setItem(key, JSON.stringify(list));
    return true;
};

// Helper to remove from list
const removeFromList = (key: string, value: string): boolean => {
    const list = getList(key, []);
    const target = value.trim();
    const newList = list.filter(item => item !== target);
    if (list.length === newList.length) return false; // Nothing removed
    localStorage.setItem(key, JSON.stringify(newList));
    return true;
};

export const dbService = {
  // --- SYSTEM LOGS ---
  getLogs: (): SystemLog[] => {
      const stored = localStorage.getItem(SYSTEM_LOGS_KEY);
      if (!stored) return [];
      try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return [];
  },

  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>): void => {
      const logs = dbService.getLogs();
      const newLog: SystemLog = {
          ...log,
          id: generateId(),
          timestamp: new Date().toISOString()
      };
      // Keep only the last 1000 logs to prevent localStorage overflow
      logs.unshift(newLog);
      if (logs.length > 1000) logs.pop();
      localStorage.setItem(SYSTEM_LOGS_KEY, JSON.stringify(logs));
  },

  // --- AUTHENTICATION & SYSTEM USERS (NEW) ---
  getSystemUsers: (): SystemUser[] => {
      const stored = localStorage.getItem(SYSTEM_USERS_KEY);
      if (!stored) {
          localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(INITIAL_SYSTEM_USERS));
          return INITIAL_SYSTEM_USERS;
      }
      try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(INITIAL_SYSTEM_USERS));
      return INITIAL_SYSTEM_USERS;
  },

  addSystemUser: (user: Omit<SystemUser, 'id' | 'createdAt'>): { success: boolean; message: string } => {
      const users = dbService.getSystemUsers();
      if (users.some(u => u.login === user.login)) {
          return { success: false, message: 'Este login já está em uso.' };
      }
      
      const newUser: SystemUser = {
          ...user,
          id: generateId(),
          createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(users));
      return { success: true, message: 'Usuário de sistema criado com sucesso.' };
  },

  deleteSystemUser: (id: string): { success: boolean; message: string } => {
      const users = dbService.getSystemUsers();
      if (users.length <= 1) return { success: false, message: 'Não é possível excluir o único usuário do sistema.' };

      const newUsers = users.filter(u => String(u.id) !== String(id));
      if (newUsers.length === users.length) return { success: false, message: 'Usuário não encontrado.' };

      localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(newUsers));
      return { success: true, message: 'Acesso revogado com sucesso.' };
  },

  authenticateSystemUser: (login: string, password: string): SystemUser | null => {
      const users = dbService.getSystemUsers();
      // Case insensitive login
      const user = users.find(u => u.login.toUpperCase() === login.toUpperCase() && u.senha === password);
      return user || null;
  },


  // --- EMPLOYEES / COLLABORATORS (OLD USERS) ---
  getAllUsers: (): User[] => {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  },

  checkMatriculaExists: (matricula: string): User | null => {
      const users = dbService.getAllUsers();
      return users.find(u => u.matricula === matricula) || null;
  },

  addUser: (user: Omit<User, 'id' | 'dataCadastro'>): { success: boolean; message: string } => {
    const users = dbService.getAllUsers();
    
    // Check for unique matricula
    if (users.some(u => u.matricula === user.matricula)) {
      return { success: false, message: `Erro: A matrícula ${user.matricula} já está cadastrada.` };
    }

    const newUser: User = {
      ...user,
      id: generateId(),
      dataCadastro: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    return { success: true, message: 'Usuário cadastrado com sucesso!' };
  },

  updateUser: (updatedUser: User): { success: boolean; message: string } => {
    const users = dbService.getAllUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index === -1) return { success: false, message: 'Usuário não encontrado.' };

    const existingMatricula = users.find(u => u.matricula === updatedUser.matricula && u.id !== updatedUser.id);
    if (existingMatricula) return { success: false, message: `A matrícula ${updatedUser.matricula} já está cadastrada.` };

    users[index] = updatedUser;
    localStorage.setItem(DB_KEY, JSON.stringify(users));
    return { success: true, message: 'Usuário atualizado com sucesso!' };
  },

  deleteUser: (id: string): { success: boolean; message: string } => {
    const users = dbService.getAllUsers();
    // Use String conversion for safer comparison in case of legacy number IDs
    const newUsers = users.filter(u => String(u.id) !== String(id));
    
    if (users.length === newUsers.length) return { success: false, message: 'Erro: Usuário não encontrado para exclusão.' };
    
    localStorage.setItem(DB_KEY, JSON.stringify(newUsers));
    return { success: true, message: 'Usuário excluído com sucesso.' };
  },

  deleteAllUsers: (): { success: boolean; message: string } => {
    localStorage.setItem(DB_KEY, '[]');
    return { success: true, message: 'Base de dados limpa com sucesso.' };
  },

  // --- FILIAIS ---
  getFiliais: () => getList(KEYS.FILIAIS, DEFAULTS.FILIAIS),
  addFilial: (name: string) => addToList(KEYS.FILIAIS, name),
  deleteFilial: (name: string) => removeFromList(KEYS.FILIAIS, name),

  // --- FUNÇÕES ---
  getFuncoes: () => getList(KEYS.FUNCOES, DEFAULTS.FUNCOES),
  addFuncao: (name: string) => addToList(KEYS.FUNCOES, name),
  deleteFuncao: (name: string) => removeFromList(KEYS.FUNCOES, name),

  // --- SETORES ---
  getSetores: () => getList(KEYS.SETORES, DEFAULTS.SETORES),
  addSetor: (name: string) => addToList(KEYS.SETORES, name),
  deleteSetor: (name: string) => removeFromList(KEYS.SETORES, name),
};
