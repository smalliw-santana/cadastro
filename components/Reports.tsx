
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { User, Filial } from '../types';
import { FileBarChart2, Printer, Users, Building2, MapPin } from 'lucide-react';

export const Reports: React.FC = () => {
  const [selectedFilial, setSelectedFilial] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Load users on mount
    const data = dbService.getAllUsers();
    setAllUsers(data);
  }, []);

  useEffect(() => {
    if (selectedFilial) {
      const filtered = allUsers.filter(u => u.filial === selectedFilial);
      setUsers(filtered);
    } else {
      setUsers([]);
    }
  }, [selectedFilial, allUsers]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out]">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-none">
        
        {/* Header - Hidden on Print to save ink/style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileBarChart2 className="w-6 h-6 text-primary-500" />
              Relatório de Lotação
            </h2>
            <p className="text-slate-500 text-sm mt-1">Selecione uma filial para visualizar o quadro de funcionários.</p>
          </div>
          
          <button 
            onClick={handlePrint}
            disabled={!selectedFilial || users.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 print:hidden">
            <label className="block text-sm font-medium text-slate-700 mb-2">Selecione a Filial de Origem</label>
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <select
                    value={selectedFilial}
                    onChange={(e) => setSelectedFilial(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                >
                    <option value="">-- Selecione uma opção --</option>
                    {Object.values(Filial).map((f) => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
        </div>

        {/* Report Content */}
        {selectedFilial && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Report Header for Print/Display */}
            <div className="border-b-2 border-slate-100 pb-6 mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedFilial}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>Relatório Detalhado de Colaboradores Ativos</span>
                    </div>
                </div>
                <div className="text-right bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 print:bg-transparent print:border-none">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider print:text-slate-500">Total de Registros</p>
                    <p className="text-2xl font-bold text-blue-900 print:text-slate-900 flex items-center justify-end gap-2">
                        <Users className="w-5 h-5 opacity-50" />
                        {users.length}
                    </p>
                </div>
            </div>

            {users.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 font-semibold text-slate-600 border-b border-slate-200">Matrícula</th>
                                <th className="p-3 font-semibold text-slate-600 border-b border-slate-200">Nome do Colaborador</th>
                                <th className="p-3 font-semibold text-slate-600 border-b border-slate-200">Departamento</th>
                                <th className="p-3 font-semibold text-slate-600 border-b border-slate-200">Setor</th>
                                <th className="p-3 font-semibold text-slate-600 border-b border-slate-200">Data Cadastro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user, index) => (
                                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                                    <td className="p-3 font-mono text-slate-600">{user.matricula}</td>
                                    <td className="p-3 font-medium text-slate-800">{user.nomeCompleto}</td>
                                    <td className="p-3 text-slate-600">{user.departamento}</td>
                                    <td className="p-3 text-slate-600">{user.setor}</td>
                                    <td className="p-3 text-slate-500">{new Date(user.dataCadastro).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Nenhum colaborador encontrado para esta filial.</p>
                </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between print:flex">
                <p>Gerado pelo K-System Enterprise</p>
                <p>{new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
