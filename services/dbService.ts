import { User } from '../types';

const DB_KEY = 'k_system_users_db';

// Initialize with some dummy data if empty
const INITIAL_DATA: User[] = [
  {
    id: '1',
    matricula: '1001',
    nomeCompleto: 'ADMINISTRADOR SISTEMA',
    filial: 'MATRIZ' as any,
    login: 'ADMIN',
    senha: '123',
    departamento: 'TECNOLOGIA DA INFORMAÇÃO' as any,
    setor: 'INFRAESTRUTURA' as any,
    dataCadastro: new Date().toISOString()
  },
  {
    id: '2',
    matricula: '1002',
    nomeCompleto: 'JOAO SILVA',
    filial: 'SÃO PAULO' as any,
    login: 'JSILVA',
    senha: '123',
    departamento: 'COMERCIAL' as any,
    setor: 'VENDAS' as any,
    dataCadastro: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const dbService = {
  getAllUsers: (): User[] => {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(stored);
  },

  addUser: (user: Omit<User, 'id' | 'dataCadastro'>): { success: boolean; message: string } => {
    const users = dbService.getAllUsers();
    
    // Check constraint: Matricula uniqueness
    if (users.some(u => u.matricula === user.matricula)) {
      return { success: false, message: `Erro: A matrícula ${user.matricula} já está cadastrada.` };
    }

    // Check constraint: Login uniqueness (optional but good practice)
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

  deleteUser: (id: string) => {
    const users = dbService.getAllUsers().filter(u => u.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(users));
  }
};