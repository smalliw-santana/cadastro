
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { FileBarChart2, Printer, Users, Building2, MapPin, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortKeys = keyof User;

export const Reports: React.FC = () => {
  const [selectedFilial, setSelectedFilial] = useState<string>('TODAS');
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filialOptions, setFilialOptions] = useState<string[]>([]);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const data = dbService.getAllUsers();
    setAllUsers(data);
    setFilialOptions(dbService.getFiliais());
  }, []);

  useEffect(() => {
    if (selectedFilial === 'TODAS') {
      setUsers(allUsers);
    } else if (selectedFilial) {
      const filtered = allUsers.filter(u => u.filial === selectedFilial);
      setUsers(filtered);
    } else {
      setUsers([]);
    }
  }, [selectedFilial, allUsers]);

  const handlePrint = () => {
    setTimeout(() => {
        window.print();
    }, 100);
  };

  // Sorting Logic
  const handleSort = (key: SortKeys) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    let sortableItems = [...users];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';

        // Numeric sorting for matricula if needed, otherwise string compare
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [users, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: SortKeys }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block" />;
    if (sortConfig.direction === 'asc') return <ArrowUp className="w-3 h-3 text-primary-600 ml-1 inline-block" />;
    return <ArrowDown className="w-3 h-3 text-primary-600 ml-1 inline-block" />;
  };

  const ThSortable = ({ label, columnKey, align = 'left' }: { label: string, columnKey: SortKeys, align?: string }) => (
    <th 
      onClick={() => handleSort(columnKey)}
      className={`p-3 font-semibold text-slate-600 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors select-none text-${align} print:text-black print:border-slate-300 print:bg-white`}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out] print:p-0 print:space-y-0 print:w-full print:m-0 print:bg-white">
      {/* Styles specifically for printing to ensure backgrounds render and layout is correct */}
      <style>{`
        @media print {
          @page { margin: 1cm; size: auto; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          /* Ensure table headers repeat on new pages if needed */
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0 print:w-full print:rounded-none">
        
        {/* Header Section - Hide buttons on print */}
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
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium print:hidden"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
        </div>

        {/* Filter Section - Hide on print */}
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
                    <option value="TODAS">TODAS AS FILIAIS</option>
                    {filialOptions.map((f) => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
        </div>

        {selectedFilial && (
          <div className="animate-[fadeIn_0.3s_ease-out] print:w-full">
            {/* Header for Print / View */}
            <div className="border-b-2 border-slate-100 pb-6 mb-6 flex justify-between items-end print:border-slate-300">
                <div>
                    <div className="hidden print:block mb-2 text-2xl font-bold text-slate-900">K-System Enterprise</div>
                    <h3 className="text-2xl font-bold text-slate-900 print:text-xl">
                        {selectedFilial === 'TODAS' ? 'RELATÓRIO GERAL' : selectedFilial}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedFilial === 'TODAS' ? 'Listagem Completa de Colaboradores' : 'Relatório Detalhado de Colaboradores Ativos'}</span>
                    </div>
                </div>
                <div className="text-right bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 print:bg-transparent print:border-none print:px-0">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider print:text-slate-500">Total de Registros</p>
                    <p className="text-2xl font-bold text-blue-900 print:text-slate-900 flex items-center justify-end gap-2">
                        <Users className="w-5 h-5 opacity-50" />
                        {users.length}
                    </p>
                </div>
            </div>

            {users.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 print:border-slate-300 print:overflow-visible print:rounded-none">
                    <table className="w-full text-left border-collapse text-sm print:w-full">
                        <thead className="bg-slate-50 print:bg-slate-100">
                            <tr>
                                <ThSortable label="Matrícula" columnKey="matricula" />
                                <ThSortable label="Nome do Colaborador" columnKey="nomeCompleto" />
                                {selectedFilial === 'TODAS' && (
                                    <ThSortable label="Filial" columnKey="filial" />
                                )}
                                <ThSortable label="Departamento" columnKey="departamento" />
                                <ThSortable label="Setor" columnKey="setor" />
                                <ThSortable label="Login" columnKey="login" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                            {sortedUsers.map((user, index) => (
                                <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30 print:bg-slate-50'}>
                                    <td className="p-3 font-mono text-slate-600 print:text-black">{user.matricula}</td>
                                    <td className="p-3 font-medium text-slate-800 print:text-black">{user.nomeCompleto}</td>
                                    {selectedFilial === 'TODAS' && (
                                        <td className="p-3 text-slate-600 print:text-black">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 border border-slate-200 print:border-0 print:bg-transparent print:p-0">
                                                {user.filial}
                                            </span>
                                        </td>
                                    )}
                                    <td className="p-3 text-slate-600 print:text-black">{user.departamento}</td>
                                    <td className="p-3 text-slate-600 print:text-black">{user.setor}</td>
                                    <td className="p-3 text-slate-600 print:text-black font-mono bg-slate-100/50 print:bg-transparent rounded px-2 w-fit">{user.login}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 print:bg-white print:border-slate-400">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Nenhum colaborador encontrado.</p>
                </div>
            )}
            
            <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between print:flex print:text-slate-500 print:border-slate-300">
                <p>Gerado pelo K-System Enterprise</p>
                <p>{new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};