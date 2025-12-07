
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { SystemUser } from '../types';
import { ShieldCheck, UserPlus, Trash2, Key, Save, AlertCircle, CheckCircle2, X, AlertTriangle } from 'lucide-react';
import { Input } from './Input';
import { Select } from './Select';

export const SystemUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [newUser, setNewUser] = useState({
      nome: '',
      login: '',
      senha: '',
      role: 'ADMIN' as 'ADMIN' | 'OPERADOR'
  });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(dbService.getSystemUsers());
  };

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUser.nome || !newUser.login || !newUser.senha) {
          setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
          return;
      }

      const result = dbService.addSystemUser({
          nome: newUser.nome.toUpperCase(),
          login: newUser.login.toUpperCase(),
          senha: newUser.senha,
          role: newUser.role
      });

      if (result.success) {
          setFeedback({ type: 'success', message: result.message });
          setNewUser({ nome: '', login: '', senha: '', role: 'ADMIN' });
          loadUsers();
          setTimeout(() => setFeedback(null), 3000);
      } else {
          setFeedback({ type: 'error', message: result.message });
      }
  };

  const confirmDelete = (e: React.MouseEvent, user: SystemUser) => {
      e.preventDefault();
      e.stopPropagation();
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = () => {
      if (!userToDelete) return;

      const result = dbService.deleteSystemUser(userToDelete.id);
      if (result.success) {
          loadUsers();
          setFeedback({ type: 'success', message: result.message });
      } else {
          setFeedback({ type: 'error', message: result.message });
      }
      
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out]">
        
        {feedback && (
            <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
                feedback.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'
            }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <AlertCircle className="w-5 h-5 text-red-500"/>}
                <span className="font-medium">{feedback.message}</span>
                <button onClick={() => setFeedback(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
            </div>
        )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
             <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Controle de Acesso</h2>
            <p className="text-slate-400 text-sm">Gerencie os usuários que podem fazer login no sistema.</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Formulario */}
            <div className="lg:col-span-1 space-y-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <UserPlus className="w-5 h-5 text-primary-500" />
                    Novo Usuário de Sistema
                </h3>
                
                <form onSubmit={handleAddUser} className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                    <Input 
                        label="Nome do Usuário"
                        value={newUser.nome}
                        onChange={e => setNewUser({...newUser, nome: e.target.value.toUpperCase()})}
                        placeholder="Ex: JOÃO SILVA"
                        required
                    />
                    <Input 
                        label="Login de Acesso"
                        value={newUser.login}
                        onChange={e => setNewUser({...newUser, login: e.target.value.toUpperCase()})}
                        placeholder="Ex: ADMIN"
                        required
                    />
                    <Input 
                        label="Senha"
                        type="password"
                        value={newUser.senha}
                        onChange={e => setNewUser({...newUser, senha: e.target.value})}
                        placeholder="••••••"
                        required
                    />
                    <Select 
                        label="Nível de Permissão"
                        value={newUser.role}
                        onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                        options={['ADMIN', 'OPERADOR']}
                    />

                    <button 
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-500/20 mt-4"
                    >
                        <Save className="w-4 h-4" />
                        Criar Acesso
                    </button>
                </form>
            </div>

            {/* Lista */}
            <div className="lg:col-span-2 space-y-4">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Key className="w-5 h-5 text-slate-500" />
                    Usuários com Acesso ({users.length})
                </h3>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Usuário</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Login</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Permissão</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-700">{user.nome}</div>
                                        <div className="text-xs text-slate-400">Criado em: {new Date(user.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-slate-600 bg-slate-50 w-fit rounded">{user.login}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={(e) => confirmDelete(e, user)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Revogar Acesso"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
      </div>

       {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Revogação</h3>
                        <p className="text-slate-500 mb-6">
                            Tem certeza que deseja revogar o acesso do usuário <strong>{userToDelete?.nome}</strong> (Login: {userToDelete?.login})?
                        </p>
                        
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleExecuteDelete}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-500/30 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Sim, Revogar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
