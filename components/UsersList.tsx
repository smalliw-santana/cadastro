
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { dbService } from '../services/dbService.ts';
import { User, SystemUser } from '../types.ts';
import { Search, Database, ShieldAlert, Plus, X, CheckCircle2, Eraser, AlertTriangle, Edit2, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { Spinner } from './Spinner.tsx';
import { Input } from './Input.tsx';
import { Select } from './Select.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';

interface UsersListProps {
  onNavigateToRegister?: () => void;
  currentUser?: SystemUser;
}

export const UsersList: React.FC<UsersListProps> = ({ onNavigateToRegister, currentUser }) => {
  const userRole = currentUser?.role || 'CONVIDADO';
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');
  const [funcaoFilter, setFuncaoFilter] = useState<string>('TODAS');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [successItemName, setSuccessItemName] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // --- DELETE STATES ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'SINGLE' | 'ALL'>('SINGLE');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // --- PASSWORD VISIBILITY ---
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
      setVisiblePasswords(prev => ({
          ...prev,
          [userId]: !prev[userId]
      }));
  };

  // --- DETAILS/EDIT STATES ---
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
      nomeCompleto: '',
      filial: '',
      funcao: '',
      setor: '',
      login: '',
      senha: '', // Optional in edit
      codigoVenda: '', // Optional
      segmento: '',
      usuarioColetor: '',
      rhdoTi: '',
      status: 'ATIVO' as 'ATIVO' | 'INATIVO'
  });
  
  // Options for Edit Form
  const [options, setOptions] = useState({
    filiais: [] as string[],
    funcoes: [] as string[],
    setores: [] as string[]
  });

  useEffect(() => {
    loadUsers();
    // Load options for the edit modal
    const loadOptions = async () => {
      setOptions({
          filiais: await dbService.getFiliais(),
          funcoes: await dbService.getFuncoes(),
          setores: await dbService.getSetores()
      });
    };
    loadOptions();
  }, []);

  const loadUsers = () => {
    setIsLoading(true);
    setTimeout(async () => {
        setUsers(await dbService.getAllUsers());
        setIsLoading(false);
    }, 600);
  };

  // --- DELETE LOGIC ---

  const requestDeleteAll = () => {
    setDeleteMode('ALL');
    setIsDeleteModalOpen(true);
  };

  // Called from within the modal for single user deletion
  const requestDeleteSingle = (user: User) => {
    setDeleteMode('SINGLE');
    setUserToDelete(user);
    setIsDetailsModalOpen(false); // Close details modal to show delete confirmation
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = () => {
    setIsProcessing(true);
    setTimeout(async () => {
        let result;
        
        if (deleteMode === 'ALL') {
            result = await dbService.deleteAllUsers();
        } else {
            if (userToDelete) {
                result = await dbService.deleteUser(userToDelete.id);
            } else {
                result = { success: false, message: "Erro ao identificar usuário." };
            }
        }

        if (result.success) {
            const itemName = deleteMode === 'ALL' ? 'Todos os registros' : (userToDelete?.nomeCompleto || '');
            setSuccessItemName(itemName);
            
            if (currentUser) {
                await dbService.addLog({
                    userName: currentUser.nome,
                    action: 'DELETE',
                    resource: 'Usuário (Colaborador)',
                    details: deleteMode === 'ALL' ? 'Todos os usuários foram excluídos.' : `Usuário ${userToDelete?.login} excluído.`
                });
            }
            
            setIsDeleteModalOpen(false);
            setShowDeleteSuccess(true);
            loadUsers();
            
            setTimeout(() => {
                setShowDeleteSuccess(false);
                setFeedback({ type: 'success', message: result.message });
                setUserToDelete(null);
            }, 5000);
        } else {
            setFeedback({ type: 'error', message: result.message });
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
        
        setIsProcessing(false);
        setTimeout(() => setFeedback(null), 3000);
    }, 1000);
  };

  // --- VIEW/EDIT LOGIC ---

  const handleViewClick = (user: User) => {
      setSelectedUser(user);
      setEditForm({
          nomeCompleto: user.nomeCompleto,
          filial: user.filial,
          funcao: user.funcao,
          setor: user.setor,
          login: user.login,
          senha: '', // Initialize empty to show placeholder
          codigoVenda: user.codigoVenda || '',
          segmento: user.segmento || 'SUPERMERCADO',
          usuarioColetor: user.usuarioColetor || '',
          rhdoTi: user.rhdoTi || '',
          status: user.status || 'ATIVO'
      });
      
      // Ensure current values are in the options list so the select doesn't break
      setOptions(prev => ({
          filiais: prev.filiais.includes(user.filial) ? prev.filiais : [...prev.filiais, user.filial],
          funcoes: prev.funcoes.includes(user.funcao) ? prev.funcoes : [...prev.funcoes, user.funcao],
          setores: prev.setores.includes(user.setor) ? prev.setores : [...prev.setores, user.setor]
      }));

      setIsDetailsModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;
      if (userRole !== 'ADMIN') return;

      setIsProcessing(true);
      
      const updatedUser: User = {
          ...selectedUser,
          nomeCompleto: editForm.nomeCompleto.toUpperCase(),
          filial: editForm.filial,
          funcao: editForm.funcao,
          setor: editForm.setor,
          login: editForm.login.toUpperCase(),
          senha: editForm.senha ? editForm.senha : selectedUser.senha,
          codigoVenda: editForm.codigoVenda,
          segmento: editForm.segmento,
          usuarioColetor: editForm.usuarioColetor,
          rhdoTi: editForm.rhdoTi,
          status: editForm.status
      };

      setTimeout(async () => {
          const result = await dbService.updateUser(updatedUser);
          
          if (result.success) {
              setSuccessItemName(updatedUser.nomeCompleto);
              if (currentUser) {
                  await dbService.addLog({
                      userName: currentUser.nome,
                      action: 'UPDATE',
                      resource: 'Usuário (Colaborador)',
                      details: `Usuário ${updatedUser.login} atualizado.`
                  });
              }
              
              setIsDetailsModalOpen(false);
              setShowSaveSuccess(true);
              loadUsers();
              setSelectedUser(null);

              setTimeout(() => {
                  setShowSaveSuccess(false);
                  setFeedback({ type: 'success', message: result.message });
              }, 5000);
          } else {
              setFeedback({ type: 'error', message: result.message });
          }
          
          setIsProcessing(false);
          setTimeout(() => setFeedback(null), 3000);
      }, 800);
  };

  // Optimized Search Logic
  const filteredUsers = useMemo(() => {
    let result = users;

    if (statusFilter !== 'TODOS') {
        result = result.filter(user => user.status === statusFilter || (!user.status && statusFilter === 'ATIVO'));
    }

    if (funcaoFilter !== 'TODAS') {
        result = result.filter(user => user.funcao === funcaoFilter);
    }

    const term = searchTerm.toLowerCase().trim();
    if (term) {
        result = result.filter(user =>
          (user.nomeCompleto?.toLowerCase() || '').includes(term) ||
          (user.matricula || '').includes(term) ||
          (user.filial?.toLowerCase() || '').includes(term) ||
          (user.funcao?.toLowerCase() || '').includes(term) ||
          (user.setor?.toLowerCase() || '').includes(term) ||
          (user.login?.toLowerCase() || '').includes(term)
        );
    }
    
    return result;
  }, [users, searchTerm, statusFilter, funcaoFilter]);

  return (
    <div className="h-full p-6 flex flex-col gap-6 animate-[fadeIn_0.4s_ease-out] print:p-0 print:space-y-0">
        
        <style>{`
            @keyframes popIn {
                0% { transform: scale(0.9); opacity: 0; }
                50% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop-in {
                animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes fadeSlideUp {
                0% { transform: translateY(20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            .animate-fade-slide-up {
                animation: fadeSlideUp 0.5s ease-out forwards;
            }
        `}</style>

        {/* Deletion Success Animation Overlay */}
        {showDeleteSuccess && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
                <div className="flex flex-col items-center text-center p-8 animate-pop-in">
                    <div className="w-24 h-24 mb-6 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/40">
                        <Trash2 className="w-12 h-12 text-white animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Exclusão Concluída
                    </h2>
                    <p className="text-red-100 text-lg animate-fade-slide-up [animation-delay:0.2s]">
                        <span className="font-bold">{successItemName}</span> foi removido com sucesso.
                    </p>
                    <div className="mt-8 flex gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-ping [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-ping [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}

        {/* Save Success Animation Overlay */}
        {showSaveSuccess && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
                <div className="flex flex-col items-center text-center p-8 animate-pop-in">
                    <div className="w-24 h-24 mb-6 rounded-full bg-green-600 flex items-center justify-center shadow-2xl shadow-green-600/40">
                        <CheckCircle2 className="w-12 h-12 text-white animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Alterações Salvas
                    </h2>
                    <p className="text-green-100 text-lg animate-fade-slide-up [animation-delay:0.2s]">
                        Os dados de <span className="font-bold">{successItemName}</span> foram atualizados.
                    </p>
                    <div className="mt-8 flex gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-ping [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}
        
        {feedback && !isDeleteModalOpen && !isDetailsModalOpen && (
            <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
                feedback.type === 'success' ? 'bg-white dark:bg-dark-800 border-green-200 text-green-700' : 'bg-white dark:bg-dark-800 border-red-200 text-red-700 dark:text-red-400'
            } print:hidden`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <ShieldAlert className="w-5 h-5 text-red-500"/>}
                <span className="font-medium">{feedback.message}</span>
                <button onClick={() => setFeedback(null)} className="ml-2 text-slate-400 hover:text-slate-600 dark:text-slate-300"><X className="w-4 h-4"/></button>
            </div>
        )}

        {/* Print Header */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-100 dark:border-dark-700 pb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Relatório Geral de Usuários</h1>
                    <p className="text-slate-500 text-sm mt-1">Gestão de Acessos - Base de Dados Completa</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Data de Emissão</p>
                    <p className="text-slate-900 dark:text-white font-mono">{new Date().toLocaleString()}</p>
                </div>
            </div>
            {searchTerm && (
                <div className="mt-4 p-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 rounded text-sm text-slate-600 dark:text-slate-300 inline-block">
                    Filtro aplicado: <span className="font-semibold">"{searchTerm}"</span>
                </div>
            )}
        </div>

        <div className="flex-1 bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-700 flex flex-col min-h-0 print:shadow-none print:border-none print:p-0 print:min-h-0">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 print:hidden">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Database className="w-6 h-6 text-primary-500"/>
                        Base de Dados de Usuários
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Gerenciamento completo dos registros do sistema</p>
                </div>
                
                <div className="flex gap-3 w-full xl:w-auto flex-col sm:flex-row flex-wrap justify-end">
                    <div className="flex gap-3 flex-1 sm:flex-none">
                        <select
                            className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[120px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            disabled={isLoading}
                        >
                            <option value="TODOS">Todos os Status</option>
                            <option value="ATIVO">Ativos</option>
                            <option value="INATIVO">Inativos</option>
                        </select>
                        <select
                            className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 rounded-xl px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[160px] flex-1 sm:flex-none"
                            value={funcaoFilter}
                            onChange={(e) => setFuncaoFilter(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="TODAS">Todas as Funções</option>
                            {options.funcoes.map(f => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex-1 sm:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por matrícula, nome, filial, login..."
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1 rounded-full hover:bg-slate-200 dark:bg-dark-600 transition-colors"
                                title="Limpar busca"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    
                    {userRole === 'ADMIN' && onNavigateToRegister && (
                        <button 
                            type="button"
                            onClick={onNavigateToRegister}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 font-medium text-sm whitespace-nowrap disabled:opacity-50 flex-1 sm:flex-none"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Usuário
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 dark:border-dark-600 shadow-sm print:overflow-visible print:shadow-none print:border-none print:rounded-none">
                <table className="w-full text-left border-collapse relative [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
                    <thead className="print:bg-slate-100 sticky top-0 z-10 bg-slate-50/95 dark:bg-dark-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-dark-600">
                        <tr>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Matrícula</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Nome Completo</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Filial</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Setor / Função</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Login</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Senha</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Segmento</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Usuário de Coletor</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Código de Venda</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">RHDO-TI</th>
                            <th className="px-3 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900 text-center">Status</th>
                            {userRole === 'ADMIN' && (
                                <th className="px-3 py-3 font-semibold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider text-right print:hidden">Ações</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-700 bg-white dark:bg-dark-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={12} className="p-12 text-center">
                                     <div className="flex flex-col items-center justify-center gap-3">
                                        <Spinner size="lg" />
                                        <p className="text-slate-400 font-medium">Carregando registros...</p>
                                     </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/80 transition-colors group print:break-inside-avoid">
                                    <td className="px-3 py-3 text-sm text-slate-600 font-mono font-medium print:text-slate-800">{user.matricula}</td>
                                    <td className="px-3 py-3 w-[250px] max-w-[250px] truncate">
                                        <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate" title={user.nomeCompleto}>{user.nomeCompleto}</div>
                                        <div className="text-xs text-slate-400">Cadastrado em {new Date(user.dataCadastro).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                        {/* Changed from Red to Indigo/Slate to look less like an error */}
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50 print:bg-transparent print:border-none print:p-0 print:text-slate-800 whitespace-nowrap">
                                            {user.filial}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 w-[150px] max-w-[150px] truncate">
                                        <div className="text-sm text-slate-700 dark:text-slate-200 truncate" title={user.setor}>{user.setor}</div>
                                        <div className="text-xs text-slate-500 truncate" title={user.funcao}>{user.funcao}</div>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-slate-600 font-mono bg-slate-50/50 dark:bg-dark-900/50 rounded print:bg-transparent print:p-0 print:text-slate-800">{user.login}</td>
                                    <td className="px-3 py-3 text-sm text-slate-600 font-mono bg-slate-50/50 dark:bg-dark-900/50 rounded print:bg-transparent print:p-0 print:text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <span>{visiblePasswords[user.id] && userRole === 'ADMIN' ? user.senha : '••••••••'}</span>
                                            {userRole === 'ADMIN' && (
                                                <button 
                                                    onClick={() => togglePasswordVisibility(user.id)}
                                                    className="text-slate-400 hover:text-primary-600 focus:outline-none print:hidden"
                                                    title={visiblePasswords[user.id] ? "Ocultar senha" : "Mostrar senha"}
                                                >
                                                    {visiblePasswords[user.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-sm text-slate-600 font-mono bg-slate-50/50 dark:bg-dark-900/50 rounded print:bg-transparent print:p-0 print:text-slate-800">{user.segmento || 'SUPERMERCADO'}</td>
                                    <td className="px-3 py-3 text-sm text-slate-600 font-mono text-center print:text-slate-800">{user.usuarioColetor || '-'}</td>
                                    <td className="px-3 py-3 text-sm text-slate-600 font-mono text-center print:text-slate-800">{user.codigoVenda || '-'}</td>
                                    <td className="px-3 py-3 text-sm text-slate-600 font-mono print:text-slate-800">{user.rhdoTi || '-'}</td>
                                    <td className="px-3 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                                            user.status === 'INATIVO' 
                                                ? 'bg-slate-50 dark:bg-dark-900 text-slate-500 border-slate-200 dark:border-dark-600'
                                                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50'
                                        }`}>
                                            {user.status === 'INATIVO' ? 'INATIVO' : 'ATIVO'}
                                        </span>
                                    </td>
                                    
                                    {/* Action Column */}
                                    {userRole === 'ADMIN' && (
                                        <td className="px-3 py-3 text-right print:hidden">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => handleViewClick(user)}
                                                    className="p-2 rounded-lg transition-all text-slate-400 hover:text-primary-600 hover:bg-primary-50"
                                                    title={userRole === 'ADMIN' ? "Editar" : "Visualizar"}
                                                >
                                                    {userRole === 'ADMIN' ? <Edit2 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>

                                                {userRole === 'ADMIN' && (
                                                    <button 
                                                        onClick={() => requestDeleteSingle(user)}
                                                        className="p-2 text-slate-400 hover:text-red-600 dark:text-red-400 hover:bg-red-50 dark:bg-red-900/20 rounded-lg transition-all"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <ShieldAlert className="w-12 h-12 mb-3 text-slate-300" />
                                        <p className="text-lg font-medium text-slate-500">
                                            {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhum registro encontrado'}
                                        </p>
                                        {searchTerm && (
                                            <button 
                                                onClick={() => setSearchTerm('')}
                                                className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline print:hidden"
                                            >
                                                Limpar filtros
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs text-slate-400 pt-2 print:hidden">
                <p>Mostrando {filteredUsers.length} de {users.length} registros</p>
            </div>
             {/* Print Footer */}
             <div className="hidden print:flex mt-4 pt-4 border-t border-slate-200 dark:border-dark-600 justify-between text-xs text-slate-500">
                <p>Gestão de Acessos - Relatório Administrativo</p>
                <p>Total: {filteredUsers.length}</p>
            </div>
        </div>

        {/* --- DETAILS / EDIT MODAL --- */}
        {isDetailsModalOpen && createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s] print:hidden">
                <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
                    <div className="p-6 bg-professional-red flex justify-between items-center shrink-0">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {userRole === 'ADMIN' ? <Edit2 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            {userRole === 'ADMIN' ? 'Editar Colaborador' : 'Detalhes do Colaborador'}
                        </h3>
                        <button onClick={() => setIsDetailsModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSaveEdit} className="p-8 overflow-y-auto">
                        {feedback && (
                            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                {feedback.message}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <Input 
                                    label="Nome Completo" 
                                    value={editForm.nomeCompleto} 
                                    onChange={e => setEditForm({...editForm, nomeCompleto: e.target.value.toUpperCase()})}
                                    required
                                    disabled={userRole !== 'ADMIN'}
                                />
                            </div>
                            
                            <Select 
                                label="Filial" 
                                options={options.filiais}
                                value={editForm.filial}
                                onChange={e => setEditForm({...editForm, filial: e.target.value})}
                                required
                                disabled={userRole !== 'ADMIN'}
                            />

                            <Input 
                                label="Login" 
                                value={editForm.login}
                                onChange={e => setEditForm({...editForm, login: e.target.value.toUpperCase()})}
                                required
                                disabled={userRole !== 'ADMIN'}
                            />

                            <Select 
                                label="Setor" 
                                options={options.setores}
                                value={editForm.setor}
                                onChange={e => setEditForm({...editForm, setor: e.target.value})}
                                required
                                disabled={userRole !== 'ADMIN'}
                            />

                            <Select 
                                label="Função" 
                                options={options.funcoes}
                                value={editForm.funcao}
                                onChange={e => setEditForm({...editForm, funcao: e.target.value})}
                                required
                                disabled={userRole !== 'ADMIN'}
                            />

                            <Select 
                                label="Status" 
                                options={['ATIVO', 'INATIVO']}
                                value={editForm.status}
                                onChange={e => setEditForm({...editForm, status: e.target.value as 'ATIVO' | 'INATIVO'})}
                                required
                                disabled={userRole !== 'ADMIN'}
                            />

                            <Input 
                                label="Código de Venda (Opcional)" 
                                value={editForm.codigoVenda}
                                onChange={e => setEditForm({...editForm, codigoVenda: e.target.value})}
                                disabled={userRole !== 'ADMIN'}
                            />

                            <Select 
                                label="Segmento" 
                                options={['SUPERMERCADO', 'MAGAZAN', 'FARMACIA', 'HOME CENTER', 'PET SHOP', 'NUTRILIDER', 'OTICA', 'OUTROS']}
                                value={editForm.segmento}
                                onChange={e => setEditForm({...editForm, segmento: e.target.value})}
                                required
                                disabled={userRole !== 'ADMIN'}
                            />

                            <Select 
                                label="Usuário de Coletor" 
                                options={['SIM', 'NÃO']}
                                value={editForm.usuarioColetor || ''}
                                onChange={e => setEditForm({...editForm, usuarioColetor: e.target.value})}
                                disabled={userRole !== 'ADMIN'}
                            />
                            
                            <Input 
                                label="RHDO-TI" 
                                value={editForm.rhdoTi || ''}
                                onChange={e => setEditForm({...editForm, rhdoTi: e.target.value})}
                                disabled={userRole !== 'ADMIN'}
                            />
                            
                            {userRole === 'ADMIN' && (
                                <div className="col-span-1 md:col-span-2 border-t border-slate-100 dark:border-dark-700 pt-4 mt-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nova Senha (Opcional)</label>
                                    <input 
                                        type="password"
                                        className="w-full px-4 py-2 bg-white dark:bg-dark-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-dark-500 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="Deixe em branco para manter a atual"
                                        value={editForm.senha}
                                        onChange={e => setEditForm({...editForm, senha: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100 dark:border-dark-700">
                             {/* Left Side: Delete Button (Admin Only) */}
                             <div>
                                {userRole === 'ADMIN' && selectedUser && (
                                    <button 
                                        type="button"
                                        onClick={() => requestDeleteSingle(selectedUser)}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                                        disabled={isProcessing}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Excluir Cadastro
                                    </button>
                                )}
                             </div>

                             {/* Right Side: Action Buttons */}
                             <div className="flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    disabled={isProcessing}
                                    className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-600 rounded-xl transition-colors font-medium disabled:opacity-50"
                                >
                                    {userRole === 'ADMIN' ? 'Cancelar' : 'Fechar'}
                                </button>
                                
                                {userRole === 'ADMIN' && (
                                    <button 
                                        type="submit"
                                        disabled={isProcessing}
                                        className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? <Spinner size="sm" variant="white" /> : <Save className="w-4 h-4" />}
                                        {isProcessing ? "Salvando..." : "Salvar Alterações"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>,
            document.body
        )}

        {/* --- DELETE CONFIRMATION MODAL (Handles both Single and All) --- */}
        <ConfirmModal
            isOpen={isDeleteModalOpen}
            title="Confirmar Exclusão"
            message={deleteMode === 'ALL' 
                ? 'Você está prestes a excluir TODOS os registros da base de dados. Esta ação é irreversível.' 
                : `Tem certeza que deseja excluir o usuário "${userToDelete?.nomeCompleto}"?`}
            confirmText={deleteMode === 'ALL' ? "Sim, Limpar Tudo" : "Sim, Excluir"}
            onConfirm={handleExecuteDelete}
            onCancel={() => setIsDeleteModalOpen(false)}
            isProcessing={isProcessing}
            icon={deleteMode === 'ALL' ? Eraser : AlertTriangle}
            variant="danger"
        />
    </div>
  );
};
