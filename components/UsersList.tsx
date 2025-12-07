
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { Trash2, Search, Database, ShieldAlert, Edit2, Plus, X, Save, CheckCircle2, Eraser, AlertTriangle } from 'lucide-react';
import { Input } from './Input';
import { Select } from './Select';

interface UsersListProps {
  onNavigateToRegister?: () => void;
}

export const UsersList: React.FC<UsersListProps> = ({ onNavigateToRegister }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dynamic Options for Edit
  const [options, setOptions] = useState({
      filiais: [] as string[],
      departamentos: [] as string[],
      setores: [] as string[]
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadUsers();
    // Load options for the edit modal
    setOptions({
        filiais: dbService.getFiliais(),
        departamentos: dbService.getDepartamentos(),
        setores: dbService.getSetores()
    });
  }, []);

  const loadUsers = () => {
    setUsers(dbService.getAllUsers());
  };

  // Trigger Delete User Modal
  const confirmDeleteUser = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setUserToDelete(user);
    setIsDeleteAll(false);
    setIsDeleteModalOpen(true);
  };

  // Trigger Delete All Modal
  const confirmDeleteAll = () => {
    setUserToDelete(null);
    setIsDeleteAll(true);
    setIsDeleteModalOpen(true);
  };

  // Execute Deletion
  const handleExecuteDelete = () => {
    if (isDeleteAll) {
        const result = dbService.deleteAllUsers();
        if (result.success) {
            setFeedback({ type: 'success', message: result.message });
            loadUsers();
        } else {
            setFeedback({ type: 'error', message: result.message });
        }
    } else if (userToDelete) {
        const result = dbService.deleteUser(userToDelete.id);
        if (result.success) {
            setFeedback({ type: 'success', message: result.message });
            loadUsers();
        } else {
            setFeedback({ type: 'error', message: result.message });
        }
    }
    
    // Close Modal and Clear feedback after 3s
    setIsDeleteModalOpen(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleEditClick = (user: User) => {
    setEditingUser({ ...user });
    setFeedback(null);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingUser) return;
    const { name, value } = e.target;
    let finalValue = value;
    if (['nomeCompleto', 'login'].includes(name)) {
        finalValue = value.toUpperCase();
    }
    setEditingUser({ ...editingUser, [name]: finalValue });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const result = dbService.updateUser(editingUser);
    if (result.success) {
        setFeedback({ type: 'success', message: result.message });
        loadUsers();
        setIsEditModalOpen(false);
        setFeedback({ type: 'success', message: 'Usuário atualizado com sucesso!' });
        setTimeout(() => setFeedback(null), 3000);
    } else {
        setFeedback({ type: 'error', message: result.message });
    }
  };

  // Optimized Search Logic using useMemo
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return users;

    return users.filter(user =>
      user.nomeCompleto.toLowerCase().includes(term) ||
      user.matricula.includes(term) ||
      user.filial.toLowerCase().includes(term) ||
      user.departamento.toLowerCase().includes(term) ||
      user.setor.toLowerCase().includes(term) ||
      user.login.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out]">
        
        {feedback && !isEditModalOpen && !isDeleteModalOpen && (
            <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
                feedback.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'
            }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <ShieldAlert className="w-5 h-5 text-red-500"/>}
                <span className="font-medium">{feedback.message}</span>
                <button onClick={() => setFeedback(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
            </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Database className="w-6 h-6 text-primary-500"/>
                        Base de Dados de Usuários
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Gerenciamento completo dos registros do sistema</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap justify-end">
                    <div className="relative flex-1 md:w-56 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, setor..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {users.length > 0 && (
                        <button 
                            type="button"
                            onClick={confirmDeleteAll}
                            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm whitespace-nowrap"
                        >
                            <Eraser className="w-4 h-4" />
                            Limpar Base
                        </button>
                    )}

                    {onNavigateToRegister && (
                        <button 
                            type="button"
                            onClick={onNavigateToRegister}
                            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 font-medium text-sm whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Usuário
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Matrícula</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Nome Completo</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Filial</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Departamento / Setor</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Login</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4 text-sm text-slate-600 font-mono font-medium">{user.matricula}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-800 text-sm">{user.nomeCompleto}</div>
                                        <div className="text-xs text-slate-400">Cadastrado em {new Date(user.dataCadastro).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {user.filial}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-700">{user.departamento}</div>
                                        <div className="text-xs text-slate-500">{user.setor}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-mono bg-slate-50/50 rounded w-fit px-2">{user.login}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                type="button"
                                                onClick={() => handleEditClick(user)} 
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => confirmDeleteUser(e, user)} 
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <ShieldAlert className="w-12 h-12 mb-3 text-slate-300" />
                                        <p className="text-lg font-medium text-slate-500">Nenhum registro encontrado</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                <p>Mostrando {filteredUsers.length} de {users.length} registros</p>
            </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-primary-600"/>
                            Editar Usuário
                        </h3>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveEdit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Matrícula" name="matricula" value={editingUser.matricula} onChange={handleEditChange} required />
                            <Select label="Filial" name="filial" value={editingUser.filial} onChange={handleEditChange} options={options.filiais} required />
                            <div className="col-span-1 md:col-span-2">
                                <Input label="Nome Completo" name="nomeCompleto" value={editingUser.nomeCompleto} onChange={handleEditChange} required />
                            </div>
                            <Input label="Login" name="login" value={editingUser.login} onChange={handleEditChange} required />
                            <Input label="Senha" name="senha" type="password" value={editingUser.senha || ''} onChange={handleEditChange} required />
                            <Select label="Departamento" name="departamento" value={editingUser.departamento} onChange={handleEditChange} options={options.departamentos} required />
                            <Select label="Setor" name="setor" value={editingUser.setor} onChange={handleEditChange} options={options.setores} required />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium">Cancelar</button>
                            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-500/20"><Save className="w-4 h-4" />Salvar Alterações</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Exclusão</h3>
                        <p className="text-slate-500 mb-6">
                            {isDeleteAll 
                                ? "Você está prestes a excluir TODOS os registros da base de dados. Esta ação é irreversível." 
                                : `Tem certeza que deseja excluir o usuário ${userToDelete?.nomeCompleto} (Login: ${userToDelete?.login})?`
                            }
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
                                {isDeleteAll ? "Sim, Limpar Tudo" : "Sim, Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
