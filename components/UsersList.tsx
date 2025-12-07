import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { Trash2, Search, Database, ShieldAlert } from 'lucide-react';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setUsers(dbService.getAllUsers());
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${name}? Esta ação não pode ser desfeita.`)) {
        dbService.deleteUser(id);
        setUsers(dbService.getAllUsers()); // Refresh list
    }
  };

  const filteredUsers = users.filter(user =>
    user.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.matricula.includes(searchTerm) ||
    user.filial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Database className="w-6 h-6 text-primary-500"/>
                        Base de Dados de Usuários
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Gerenciamento completo dos registros do sistema</p>
                </div>
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, matrícula..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                                    <td className="p-4 text-sm text-slate-600 font-mono bg-slate-50/50 rounded">{user.login}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(user.id, user.nomeCompleto)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Excluir Registro"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <ShieldAlert className="w-12 h-12 mb-3 text-slate-300" />
                                        <p className="text-lg font-medium text-slate-500">Nenhum registro encontrado</p>
                                        <p className="text-sm">Tente ajustar sua busca ou cadastre um novo usuário.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                <p>Mostrando {filteredUsers.length} de {users.length} registros</p>
                <p>Banco de dados local (Browser Storage)</p>
            </div>
        </div>
    </div>
  );
};