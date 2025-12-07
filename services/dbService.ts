
import { User } from '../types';

const DB_KEY = 'k_system_users_db';
const KEYS = {
    FILIAIS: 'k_system_filiais',
    DEPARTAMENTOS: 'k_system_departamentos',
    SETORES: 'k_system_setores'
};

// Initial Data Defaults
const DEFAULTS = {
    FILIAIS: ['MATRIZ', 'SÃO PAULO', 'RIO DE JANEIRO', 'BELO HORIZONTE', 'CURITIBA', 'PORTO ALEGRE'],
    DEPARTAMENTOS: ['TECNOLOGIA DA INFORMAÇÃO', 'RECURSOS HUMANOS', 'FINANCEIRO', 'COMERCIAL', 'OPERACIONAL', 'LOGÍSTICA'],
    SETORES: ['DESENVOLVIMENTO', 'INFRAESTRUTURA', 'RECRUTAMENTO', 'CONTABILIDADE', 'VENDAS', 'ALMOXARIFADO']
};

const INITIAL_USERS: User[] = [
  {
    id: '1',
    matricula: '1001',
    nomeCompleto: 'ADMINISTRADOR',
    filial: 'MATRIZ',
    login: 'ADMIN',
    senha: '123',
    departamento: 'TECNOLOGIA DA INFORMAÇÃO',
    setor: 'INFRAESTRUTURA',
    dataCadastro: new Date().toISOString()
  },
  {
    id: '2',
    matricula: '1002',
    nomeCompleto: 'JOAO SILVA',
    filial: 'SÃO PAULO',
    login: 'JSILVA',
    senha: '123',
    departamento: 'COMERCIAL',
    setor: 'VENDAS',
    dataCadastro: new Date(Date.now() - 86400000 * 2).toISOString()
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
const removeFromList = (key: string, value: string) => {
    const list = getList(key, []);
    const newList = list.filter(item => item !== value);
    localStorage.setItem(key, JSON.stringify(newList));
};

export const dbService = {
  // --- USERS ---
  getAllUsers: (): User[] => {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(stored);
  },

  addUser: (user: Omit<User, 'id' | 'dataCadastro'>): { success: boolean; message: string } => {
    const users = dbService.getAllUsers();
    if (users.some(u => u.matricula === user.matricula)) {
      return { success: false, message: `A matrícula ${user.matricula} já está cadastrada.` };
    }
    if (users.some(u => u.login === user.login)) {
      return { success: false, message: `Erro: O login ${user.login} já está em uso.` };
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
    const newUsers = users.filter(u => u.id !== id);
    if (users.length === newUsers.length) return { success: false, message: 'Erro: Usuário não encontrado.' };
    localStorage.setItem(DB_KEY, JSON.stringify(newUsers));
    return { success: true, message: 'Usuário excluído com sucesso.' };
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
