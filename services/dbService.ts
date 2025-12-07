
import { User, SystemUser } from '../types';

const DB_KEY = 'k_system_users_db';
const SYSTEM_USERS_KEY = 'k_system_access_users'; // New DB for Login Users

const KEYS = {
    FILIAIS: 'k_system_filiais',
    DEPARTAMENTOS: 'k_system_departamentos',
    SETORES: 'k_system_setores'
};

// Initial Data Defaults
const DEFAULTS = {
    FILIAIS: ['L01 - CONDOR', 'L02 - A.CACELA', 'L03 - DOCA', 'L04 - OBIDOS', 'L05 - CASTANHEITA', 'L06 - MGZ CASTANHEIRA'],
    DEPARTAMENTOS: ['TECNOLOGIA DA INFORMAÇÃO', 'CPD', 'CM', 'ESTOQUE', 'GERENCIA', 'DEP.TROCA'],
    SETORES: ['DESENVOLVIMENTO', 'INFRAESTRUTURA', 'RECRUTAMENTO', 'CONTABILIDADE', 'VENDAS', 'ALMOXARIFADO']
};

const INITIAL_USERS: User[] = [
  {
    id: '1',
    matricula: '1001',
    nomeCompleto: 'FUNCIONARIO EXEMPLO',
    filial: 'MATRIZ',
    login: 'FUNC.1',
    senha: '123',
    departamento: 'TECNOLOGIA DA INFORMAÇÃO',
    setor: 'INFRAESTRUTURA',
    dataCadastro: new Date().toISOString()
  }
];

// Default Admin for the new Access System
const INITIAL_SYSTEM_USERS: SystemUser[] = [
    {
        id: 'admin-01',
        nome: 'ADMINISTRADOR',
        login: 'ADMIN',
        senha: '123',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
    },

    {
        id: 'admin-02',
        nome: 'WILLAMS',
        login: 'WILLAMS',
        senha: '1235',
        role: 'ADMIN',
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
    return JSON.parse(stored);
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
  // --- AUTHENTICATION & SYSTEM USERS (NEW) ---
  getSystemUsers: (): SystemUser[] => {
      const stored = localStorage.getItem(SYSTEM_USERS_KEY);
      if (!stored) {
          localStorage.setItem(SYSTEM_USERS_KEY, JSON.stringify(INITIAL_SYSTEM_USERS));
          return INITIAL_SYSTEM_USERS;
      }
      return JSON.parse(stored);
  },

  addSystemUser: (user: Omit<SystemUser, 'id' | 'createdAt'>): { success: boolean; message: string } => {
      const users = dbService.getSystemUsers();
      if (users.some(u => u.login === user.login)) {
          return { success: false, message: 'Este login já está em uso.' };
      }
      
      const newUser: SystemUser = {
          ...user,
          id: crypto.randomUUID(),
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
    return JSON.parse(stored);
  },

  // Helper for realtime validation
  checkMatriculaExists: (matricula: string): boolean => {
      const users = dbService.getAllUsers();
      return users.some(u => u.matricula === matricula);
  },

  addUser: (user: Omit<User, 'id' | 'dataCadastro'>): { success: boolean; message: string } => {
    const users = dbService.getAllUsers();
    if (users.some(u => u.matricula === user.matricula)) {
      return { success: false, message: `A matrícula ${user.matricula} já está cadastrada.` };
    }
    // We still check for unique login among employees to avoid confusion, though they are separate DBs now
    if (users.some(u => u.login === user.login)) {
      return { success: false, message: `Erro: O login ${user.login} já está em uso por outro colaborador.` };
    }
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
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
    if (existingMatricula) return { success: false, message: `A matrícula ${updatedUser.matricula} já pertence a outro usuário.` };

    const existingLogin = users.find(u => u.login === updatedUser.login && u.id !== updatedUser.id);
    if (existingLogin) return { success: false, message: `O login ${updatedUser.login} já está em uso.` };

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

  // --- DEPARTAMENTOS ---
  getDepartamentos: () => getList(KEYS.DEPARTAMENTOS, DEFAULTS.DEPARTAMENTOS),
  addDepartamento: (name: string) => addToList(KEYS.DEPARTAMENTOS, name),
  deleteDepartamento: (name: string) => removeFromList(KEYS.DEPARTAMENTOS, name),

  // --- SETORES ---
  getSetores: () => getList(KEYS.SETORES, DEFAULTS.SETORES),
  addSetor: (name: string) => addToList(KEYS.SETORES, name),
  deleteSetor: (name: string) => removeFromList(KEYS.SETORES, name),
};
