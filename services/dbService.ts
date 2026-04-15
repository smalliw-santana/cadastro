import { User, SystemUser, SystemLog } from '../types';
import { supabase } from '../lib/supabase';

// Helper to generate ID if needed (Supabase handles UUIDs, but we might need it for local optimistic updates)
const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const dbService = {
  // --- SYSTEM LOGS ---
  getLogs: async (): Promise<SystemLog[]> => {
      const { data, error } = await supabase
          .from('system_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(1000);
          
      if (error) {
          console.error('Error fetching logs:', error);
          return [];
      }
      
      return data.map(log => ({
          id: log.id,
          userId: log.user_id,
          userName: log.user_name,
          action: log.action,
          resource: log.resource || 'Sistema',
          details: log.details,
          timestamp: log.timestamp
      }));
  },

  addLog: async (log: Omit<SystemLog, 'id' | 'timestamp'>): Promise<void> => {
      const { error } = await supabase
          .from('system_logs')
          .insert([{
              user_id: log.userId,
              user_name: log.userName,
              action: log.action,
              resource: log.resource || 'Sistema',
              details: log.details
          }]);
          
      if (error) console.error('Error adding log:', error);
  },

  // --- AUTHENTICATION & SYSTEM USERS (NEW) ---
  getSystemUsers: async (): Promise<SystemUser[]> => {
      const { data, error } = await supabase
          .from('system_users')
          .select('*')
          .order('created_at', { ascending: false });
          
      if (error) {
          console.error('Error fetching system users:', error);
          return [];
      }
      
      return data.map(user => ({
          id: user.id,
          nome: user.nome,
          login: user.login,
          senha: user.senha,
          role: user.role as any,
          createdAt: user.created_at,
          avatarUrl: user.avatar_url
      }));
  },

  addSystemUser: async (user: Omit<SystemUser, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
      // Check if login exists
      const { data: existing } = await supabase
          .from('system_users')
          .select('id')
          .eq('login', user.login)
          .single();
          
      if (existing) {
          return { success: false, message: 'Este login já está em uso.' };
      }
      
      const { error } = await supabase
          .from('system_users')
          .insert([{
              nome: user.nome,
              login: user.login,
              senha: user.senha,
              role: user.role,
              avatar_url: user.avatarUrl
          }]);
          
      if (error) {
          console.error('Error adding system user:', error);
          if (error.message.includes('avatar_url')) {
              return { success: false, message: 'Erro: A coluna avatar_url não existe no banco de dados. Execute o comando SQL no Supabase.' };
          }
          return { success: false, message: 'Erro ao criar usuário de sistema.' };
      }
      
      return { success: true, message: 'Usuário de sistema criado com sucesso.' };
  },

  deleteSystemUser: async (id: string): Promise<{ success: boolean; message: string }> => {
      // Check count
      const { count } = await supabase
          .from('system_users')
          .select('*', { count: 'exact', head: true });
          
      if (count && count <= 1) {
          return { success: false, message: 'Não é possível excluir o único usuário do sistema.' };
      }

      const { error } = await supabase
          .from('system_users')
          .delete()
          .eq('id', id);
          
      if (error) {
          console.error('Error deleting system user:', error);
          return { success: false, message: 'Erro ao excluir usuário.' };
      }
      
      return { success: true, message: 'Acesso revogado com sucesso.' };
  },

  updateSystemUser: async (id: string, user: Partial<Omit<SystemUser, 'id' | 'createdAt'>>): Promise<{ success: boolean; message: string }> => {
      const updateData: any = {
          nome: user.nome,
          login: user.login,
          role: user.role
      };
      
      if (user.senha) {
          updateData.senha = user.senha;
      }
      
      if (user.avatarUrl !== undefined) {
          updateData.avatar_url = user.avatarUrl;
      }

      const { error } = await supabase
          .from('system_users')
          .update(updateData)
          .eq('id', id);

      if (error) {
          console.error('Error updating system user:', error);
          if (error.code === '23505') {
              return { success: false, message: 'Já existe um usuário com este login.' };
          }
          if (error.message.includes('avatar_url')) {
              return { success: false, message: 'Erro: A coluna avatar_url não existe no banco de dados. Execute o comando SQL no Supabase.' };
          }
          return { success: false, message: `Erro ao atualizar usuário: ${error.message}` };
      }

      return { success: true, message: 'Usuário atualizado com sucesso.' };
  },

  authenticateSystemUser: async (login: string, password: string): Promise<SystemUser | null> => {
      const { data, error } = await supabase
          .from('system_users')
          .select('*')
          .ilike('login', login)
          .eq('senha', password)
          .single();
          
      if (error || !data) {
          return null;
      }
      
      return {
          id: data.id,
          nome: data.nome,
          login: data.login,
          senha: data.senha,
          role: data.role as any,
          createdAt: data.created_at,
          avatarUrl: data.avatar_url
      };
  },


  // --- EMPLOYEES / COLLABORATORS (OLD USERS) ---
  getAllUsers: async (): Promise<User[]> => {
      const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('data_cadastro', { ascending: false });
          
      if (error) {
          console.error('Error fetching users:', error);
          return [];
      }
      
      return data.map(user => ({
          id: user.id,
          matricula: user.matricula,
          nomeCompleto: user.nome_completo,
          filial: user.filial,
          login: user.login,
          senha: user.senha,
          funcao: user.funcao,
          setor: user.setor,
          departamento: user.departamento,
          codigoVenda: user.codigo_venda,
          segmento: user.segmento,
          dataCadastro: user.data_cadastro
      }));
  },

  checkMatriculaExists: async (matricula: string): Promise<User | null> => {
      const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('matricula', matricula)
          .single();
          
      if (error || !data) return null;
      
      return {
          id: data.id,
          matricula: data.matricula,
          nomeCompleto: data.nome_completo,
          filial: data.filial,
          login: data.login,
          senha: data.senha,
          funcao: data.funcao,
          setor: data.setor,
          departamento: data.departamento,
          codigoVenda: data.codigo_venda,
          segmento: data.segmento,
          dataCadastro: data.data_cadastro
      };
  },

  addUser: async (user: Omit<User, 'id' | 'dataCadastro'>): Promise<{ success: boolean; message: string }> => {
      const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('matricula', user.matricula)
          .single();
          
      if (existing) {
          return { success: false, message: `Erro: A matrícula ${user.matricula} já está cadastrada.` };
      }

      const { error } = await supabase
          .from('users')
          .insert([{
              matricula: user.matricula,
              nome_completo: user.nomeCompleto,
              filial: user.filial,
              login: user.login,
              senha: user.senha,
              funcao: user.funcao,
              setor: user.setor,
              departamento: user.departamento,
              codigo_venda: user.codigoVenda,
              segmento: user.segmento
          }]);
          
      if (error) {
          console.error('Error adding user:', error);
          return { success: false, message: 'Erro ao cadastrar usuário.' };
      }
      
      return { success: true, message: 'Usuário cadastrado com sucesso!' };
  },

  updateUser: async (updatedUser: User): Promise<{ success: boolean; message: string }> => {
      const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('matricula', updatedUser.matricula)
          .neq('id', updatedUser.id)
          .single();
          
      if (existing) {
          return { success: false, message: `A matrícula ${updatedUser.matricula} já está cadastrada.` };
      }

      const { error } = await supabase
          .from('users')
          .update({
              matricula: updatedUser.matricula,
              nome_completo: updatedUser.nomeCompleto,
              filial: updatedUser.filial,
              login: updatedUser.login,
              senha: updatedUser.senha,
              funcao: updatedUser.funcao,
              setor: updatedUser.setor,
              departamento: updatedUser.departamento,
              codigo_venda: updatedUser.codigoVenda,
              segmento: updatedUser.segmento
          })
          .eq('id', updatedUser.id);
          
      if (error) {
          console.error('Error updating user:', error);
          return { success: false, message: 'Erro ao atualizar usuário.' };
      }
      
      return { success: true, message: 'Usuário atualizado com sucesso!' };
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
      const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);
          
      if (error) {
          console.error('Error deleting user:', error);
          return { success: false, message: 'Erro: Usuário não encontrado para exclusão.' };
      }
      
      return { success: true, message: 'Usuário excluído com sucesso.' };
  },

  deleteAllUsers: async (): Promise<{ success: boolean; message: string }> => {
      const { error } = await supabase
          .from('users')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
          
      if (error) {
          console.error('Error deleting all users:', error);
          return { success: false, message: 'Erro ao limpar base de dados.' };
      }
      
      return { success: true, message: 'Base de dados limpa com sucesso.' };
  },

  // --- RESOURCES ---
  _getResources: async (type: string): Promise<string[]> => {
      const { data, error } = await supabase
          .from('resources')
          .select('name')
          .eq('type', type)
          .order('name');
          
      if (error) {
          console.error(`Error fetching ${type}:`, error);
          return [];
      }
      
      return data.map(r => r.name);
  },
  
  _addResource: async (type: string, name: string): Promise<boolean> => {
      const upperName = name.toUpperCase().trim();
      const { error } = await supabase
          .from('resources')
          .insert([{ type, name: upperName }]);
          
      if (error) {
          console.error(`Error adding ${type}:`, error);
          return false;
      }
      return true;
  },
  
  _deleteResource: async (type: string, name: string): Promise<boolean> => {
      const upperName = name.toUpperCase().trim();
      const { error } = await supabase
          .from('resources')
          .delete()
          .eq('type', type)
          .eq('name', upperName);
          
      if (error) {
          console.error(`Error deleting ${type}:`, error);
          return false;
      }
      return true;
  },

  // --- FILIAIS ---
  getFiliais: () => dbService._getResources('FILIAL'),
  addFilial: (name: string) => dbService._addResource('FILIAL', name),
  deleteFilial: (name: string) => dbService._deleteResource('FILIAL', name),

  // --- FUNÇÕES ---
  getFuncoes: () => dbService._getResources('FUNCAO'),
  addFuncao: (name: string) => dbService._addResource('FUNCAO', name),
  deleteFuncao: (name: string) => dbService._deleteResource('FUNCAO', name),

  // --- SETORES ---
  getSetores: () => dbService._getResources('SETOR'),
  addSetor: (name: string) => dbService._addResource('SETOR', name),
  deleteSetor: (name: string) => dbService._deleteResource('SETOR', name),
  
  // --- DEPARTAMENTOS ---
  getDepartamentos: () => dbService._getResources('DEPARTAMENTO'),
  addDepartamento: (name: string) => dbService._addResource('DEPARTAMENTO', name),
  deleteDepartamento: (name: string) => dbService._deleteResource('DEPARTAMENTO', name),
};
