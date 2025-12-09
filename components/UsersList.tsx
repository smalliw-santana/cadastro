
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { Search, Database, ShieldAlert, Plus, X, CheckCircle2, Eraser, AlertTriangle, Printer } from 'lucide-react';
import { Spinner } from './Spinner';

interface UsersListProps {
  onNavigateToRegister?: () => void;
}

export const UsersList: React.FC<UsersListProps> = ({ onNavigateToRegister }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Delete Modal State (Only for Delete All now)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAll, setIsDeleteAll] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setIsLoading(true);
    setTimeout(() => {
        setUsers(dbService.getAllUsers());
        setIsLoading(false);
    }, 600);
  };

  const handlePrint = () => {
      window.print();
  };

  // Trigger Delete All Modal
  const confirmDeleteAll = () => {
    setIsDeleteAll(true);
    setIsDeleteModalOpen(true);
  };

  // Execute Deletion
  const handleExecuteDelete = () => {
    setIsProcessing(true);
    setTimeout(() => {
        if (isDeleteAll) {
            const result = dbService.deleteAllUsers();
            if (result.success) {
                setFeedback({ type: 'success', message: result.message });
                loadUsers();
            } else {
                setFeedback({ type: 'error', message: result.message });
            }
        }
        
        setIsProcessing(false);
        setIsDeleteModalOpen(false);
        setTimeout(() => setFeedback(null), 3000);
    }, 1000);
  };

  // Optimized Search Logic
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
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out] print:p-0 print:space-y-0">
        
        {feedback && !isDeleteModalOpen && (
            <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
                feedback.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-700'
            } print:hidden`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <ShieldAlert className="w-5 h-5 text-red-500"/>}
                <span className="font-medium">{feedback.message}</span>
                <button onClick={() => setFeedback(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
            </div>
        )}

        {/* Print Header */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-100 pb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Relatório Geral de Usuários</h1>
                    <p className="text-slate-500 text-sm mt-1">K-System Enterprise - Base de Dados Completa</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Data de Emissão</p>
                    <p className="text-slate-900 font-mono">{new Date().toLocaleString()}</p>
                </div>
            </div>
            {searchTerm && (
                <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 inline-block">
                    Filtro aplicado: <span className="font-semibold">"{searchTerm}"</span>
                </div>
            )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] print:shadow-none print:border-none print:p-0 print:min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 print:hidden">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Database className="w-6 h-6 text-primary-500"/>
                        Base de Dados de Usuários
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Gerenciamento completo dos registros do sistema</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto flex-wrap md:flex-nowrap justify-end">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por matrícula, nome, filial, login..."
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                                title="Limpar busca"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    <button 
                        type="button"
                        onClick={handlePrint}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm whitespace-nowrap disabled:opacity-50"
                        title="Imprimir Lista"
                    >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Imprimir</span>
                    </button>
                    
                    {users.length > 0 && (
                        <button 
                            type="button"
                            onClick={confirmDeleteAll}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm whitespace-nowrap disabled:opacity-50"
                        >
                            <Eraser className="w-4 h-4" />
                            Limpar Base
                        </button>
                    )}

                    {onNavigateToRegister && (
                        <button 
                            type="button"
                            onClick={onNavigateToRegister}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 font-medium text-sm whitespace-nowrap disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Usuário
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm print:overflow-visible print:shadow-none print:border-none print:rounded-none">
                <table className="w-full text-left border-collapse">
                    <thead className="print:bg-slate-100">
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Matrícula</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Nome Completo</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Filial</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Departamento / Setor</th>
                            <th className="p-4 font-semibold text-slate-600 text-xs uppercase tracking-wider print:text-slate-900">Login</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                     <div className="flex flex-col items-center justify-center gap-3">
                                        <Spinner size="lg" />
                                        <p className="text-slate-400 font-medium">Carregando registros...</p>
                                     </div>
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group print:break-inside-avoid">
                                    <td className="p-4 text-sm text-slate-600 font-mono font-medium print:text-slate-800">{user.matricula}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-800 text-sm print:text-black">{user.nomeCompleto}</div>
                                        <div className="text-xs text-slate-400">Cadastrado em {new Date(user.dataCadastro).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 print:bg-transparent print:border-none print:p-0 print:text-slate-800">
                                            {user.filial}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-700 print:text-slate-800">{user.departamento}</div>
                                        <div className="text-xs text-slate-500">{user.setor}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-mono bg-slate-50/50 rounded w-fit px-2 print:bg-transparent print:p-0 print:text-slate-800">{user.login}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
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
            
            <div className="mt-4 flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-4 print:hidden">
                <p>Mostrando {filteredUsers.length} de {users.length} registros</p>
            </div>
             {/* Print Footer */}
             <div className="hidden print:flex mt-4 pt-4 border-t border-slate-200 justify-between text-xs text-slate-500">
                <p>K-System Enterprise - Relatório Administrativo</p>
                <p>Total: {filteredUsers.length}</p>
            </div>
        </div>

        {/* Delete Confirmation Modal (Only for Delete All) */}
        {isDeleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s] print:hidden">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[scaleIn_0.2s_ease-out]">
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmar Exclusão</h3>
                        <p className="text-slate-500 mb-6">
                            Você está prestes a excluir TODOS os registros da base de dados. Esta ação é irreversível.
                        </p>
                        
                        <div className="flex gap-3 justify-center">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isProcessing}
                                className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleExecuteDelete}
                                disabled={isProcessing}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-500/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? <Spinner size="sm" variant="white" /> : <Eraser className="w-4 h-4" />}
                                {isProcessing ? "Processando..." : "Sim, Limpar Tudo"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
