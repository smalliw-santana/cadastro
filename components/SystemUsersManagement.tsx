
import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/dbService.ts';
import { SystemUser } from '../types.ts';
import { ShieldCheck, UserPlus, Trash2, Key, Save, AlertCircle, CheckCircle2, X, AlertTriangle, User, Pencil } from 'lucide-react';
import { Input } from './Input.tsx';
import { Select } from './Select.tsx';

interface SystemUsersManagementProps {
  currentUser?: SystemUser;
}

export const SystemUsersManagement: React.FC<SystemUsersManagementProps> = ({ currentUser }) => {
  const userRole = currentUser?.role || 'CONVIDADO';
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [newUser, setNewUser] = useState({
      nome: '',
      login: '',
      senha: '',
      role: 'ADMIN' as 'ADMIN' | 'CONVIDADO',
      avatarUrl: ''
  });

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewUser(prev => ({ ...prev, avatarUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsers(await dbService.getSystemUsers());
  };

  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUser.nome || !newUser.login || (!newUser.senha && !editingUserId)) {
          setFeedback({ type: 'error', message: 'Preencha todos os campos obrigatórios.' });
          return;
      }

      let result;
      if (editingUserId) {
          result = await dbService.updateSystemUser(editingUserId, {
              nome: newUser.nome.toUpperCase(),
              login: newUser.login.toUpperCase(),
              senha: newUser.senha || undefined, // Only update if provided
              role: newUser.role,
              avatarUrl: newUser.avatarUrl
          });
      } else {
          result = await dbService.addSystemUser({
              nome: newUser.nome.toUpperCase(),
              login: newUser.login.toUpperCase(),
              senha: newUser.senha,
              role: newUser.role,
              avatarUrl: newUser.avatarUrl
          });
      }

      if (result.success) {
          if (currentUser) {
              await dbService.addLog({
                  userName: currentUser.nome,
                  action: editingUserId ? 'UPDATE' : 'CREATE',
                  resource: 'Usuário de Sistema',
                  details: editingUserId 
                      ? `Atualizou usuário de sistema: ${newUser.login.toUpperCase()}`
                      : `Cadastrou usuário de sistema: ${newUser.login.toUpperCase()} (${newUser.role})`
              });
          }
          setFeedback({ type: 'success', message: result.message });
          setNewUser({ nome: '', login: '', senha: '', role: 'ADMIN', avatarUrl: '' });
          setEditingUserId(null);
          loadUsers();
          setTimeout(() => setFeedback(null), 3000);
      } else {
          setFeedback({ type: 'error', message: result.message });
      }
  };

  const handleEditClick = (user: SystemUser) => {
      setNewUser({
          nome: user.nome,
          login: user.login,
          senha: '', // Don't populate password
          role: user.role,
          avatarUrl: user.avatarUrl || ''
      });
      setEditingUserId(user.id);
  };

  const cancelEdit = () => {
      setNewUser({ nome: '', login: '', senha: '', role: 'ADMIN', avatarUrl: '' });
      setEditingUserId(null);
  };

  const confirmDelete = (e: React.MouseEvent, user: SystemUser) => {
      e.preventDefault();
      e.stopPropagation();
      setUserToDelete(user);
      setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
      if (!userToDelete) return;

      const result = await dbService.deleteSystemUser(userToDelete.id);
      if (result.success) {
          if (currentUser) {
              await dbService.addLog({
                  userName: currentUser.nome,
                  action: 'DELETE',
                  resource: 'Usuário de Sistema',
                  details: `Excluiu usuário de sistema: ${userToDelete.login}`
              });
          }
          loadUsers();
          setFeedback({ type: 'success', message: result.message });
      } else {
          setFeedback({ type: 'error', message: result.message });
      }
      
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setTimeout(() => setFeedback(null), 3000);
  };

  const PREDEFINED_AVATARS = [
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=f8fafc',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=f8fafc',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=f8fafc',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=f8fafc',
      'https://api.dicebear.com/7.x/adventurer/svg?seed=Sam&backgroundColor=f8fafc'
  ];

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
        <div className="bg-primary-900 p-6 flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
             <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Controle de Acesso</h2>
            <p className="text-primary-200 text-sm">
                {userRole === 'ADMIN' ? 'Gerencie os usuários que podem fazer login no sistema.' : 'Visualização de usuários com acesso ao sistema.'}
            </p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Formulario - ONLY ADMIN */}
            {userRole === 'ADMIN' && (
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <UserPlus className="w-5 h-5 text-primary-500" />
                        {editingUserId ? 'Editar Usuário' : 'Novo Usuário de Sistema'}
                    </h3>
                    
                    <form onSubmit={handleAddUser} className="space-y-6">
                        {/* Avatar Card */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                                    {newUser.avatarUrl ? (
                                        <img src={newUser.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <User className="w-10 h-10 text-slate-400" />
                                    )}
                                </div>
                                
                                <div className="text-center space-y-1 w-full">
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                    >
                                        Foto (Opcional)
                                    </button>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 mb-2">
                                        Ou escolha um modelo
                                    </p>
                                    
                                    <div className="flex items-center justify-center gap-3 flex-nowrap overflow-x-auto pb-2">
                                        {PREDEFINED_AVATARS.map((url, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setNewUser({...newUser, avatarUrl: url})}
                                                className={`shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${newUser.avatarUrl === url ? 'border-primary-500 scale-110 shadow-md' : 'border-transparent hover:scale-105 hover:shadow'}`}
                                            >
                                                <img src={url} alt={`Modelo ${i+1}`} className="w-full h-full object-cover bg-slate-100" referrerPolicy="no-referrer" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields Card */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
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
                            label={editingUserId ? "Nova Senha (deixe em branco para manter)" : "Senha"}
                            type="password"
                            value={newUser.senha}
                            onChange={e => setNewUser({...newUser, senha: e.target.value})}
                            placeholder="••••••"
                            required={!editingUserId}
                        />
                        <Select 
                            label="Nível de Permissão"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                            options={['ADMIN', 'CONVIDADO']}
                        />

                        <div className="flex gap-2 mt-4">
                            {editingUserId && (
                                <button 
                                    type="button"
                                    onClick={cancelEdit}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-3 rounded-lg hover:bg-slate-200 transition-all font-semibold"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button 
                                type="submit"
                                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-lg shadow-primary-500/20"
                            >
                                <Save className="w-4 h-4" />
                                {editingUserId ? 'Salvar' : 'Criar Acesso'}
                            </button>
                        </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista - Full width if Operator */}
            <div className={`space-y-4 ${userRole !== 'ADMIN' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
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
                                {userRole === 'ADMIN' && <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.nome} className="w-8 h-8 rounded-full object-cover border border-slate-200" referrerPolicy="no-referrer" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-700">{user.nome}</div>
                                                <div className="text-xs text-slate-400">Criado em: {new Date(user.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm font-mono text-slate-600 bg-slate-50 w-fit rounded">{user.login}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {user.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    {userRole === 'ADMIN' && (
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEditClick(user)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                    title="Editar Usuário"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => confirmDelete(e, user)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Revogar Acesso"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
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
