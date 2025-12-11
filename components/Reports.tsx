
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService.ts';
import { User } from '../types.ts';
import { FileBarChart2, Users, Building2, MapPin, ArrowUpDown, ArrowUp, ArrowDown, FileDown, Eye, X, Printer } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Spinner } from './Spinner.tsx';

type SortKeys = keyof User;

export const Reports: React.FC = () => {
  const [selectedFilial, setSelectedFilial] = useState<string>('TODAS');
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filialOptions, setFilialOptions] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleExportPDF = () => {
    setIsExporting(true);
    
    // Determine which element to capture: The Preview container (if open) or the main list
    const elementId = showPreview ? 'preview-paper' : 'report-content';

    setTimeout(() => {
      const element = document.getElementById(elementId);
      
      if (!element) {
        setIsExporting(false);
        return;
      }

      const opt = {
        margin: [5, 5, 5, 5], // mm
        filename: `Relatorio_${selectedFilial.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const html2pdf = (window as any).html2pdf;
      if (html2pdf) {
        html2pdf().set(opt).from(element).save().then(() => {
          setIsExporting(false);
        }).catch((err: any) => {
          console.error("PDF Export Error:", err);
          setIsExporting(false);
        });
      } else {
        alert("Biblioteca de PDF não carregada. Por favor, tente recarregar a página.");
        setIsExporting(false);
      }
    }, 200);
  };

  const handlePrint = () => {
      // Small timeout to ensure DOM is ready if state just changed
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

        // Numeric sorting for matricula
        if (sortConfig.key === 'matricula') {
            return sortConfig.direction === 'asc' 
                ? parseInt(aValue || '0') - parseInt(bValue || '0')
                : parseInt(bValue || '0') - parseInt(aValue || '0');
        }

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
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline-block print:hidden" />;
    if (sortConfig.direction === 'asc') return <ArrowUp className="w-3 h-3 text-primary-600 ml-1 inline-block print:text-black" />;
    return <ArrowDown className="w-3 h-3 text-primary-600 ml-1 inline-block print:text-black" />;
  };

  const ThSortable = ({ label, columnKey, align = 'left' }: { label: string, columnKey: SortKeys, align?: string }) => (
    <th 
      onClick={() => handleSort(columnKey)}
      className={`p-3 font-bold text-slate-700 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors select-none text-${align} print:text-black print:border-black print:text-xs print:uppercase print:p-2`}
    >
      <div className={`flex items-center ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  return (
    <div className="p-6 space-y-6 animate-[fadeIn_0.4s_ease-out] print:p-0 print:space-y-0 print:w-full print:bg-white">
      {/* 
        ROBUST PRINT STYLES 
        This logic ensures we target the correct element regardless of DOM structure depth.
      */}
      <style>{`
        @media print {
          @page { size: auto; margin: 0mm; }
          
          body { 
              background-color: white !important;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
          }

          /* Global Hides */
          nav, aside, header, .print\\:hidden { display: none !important; }

          ${showPreview ? `
              /* 
                 PRINT PREVIEW MODE:
                 We use visibility: hidden on body to hide everything,
                 then visibility: visible on the modal container to show it.
                 This is more robust than display: none for deeply nested React components.
              */
              body * {
                  visibility: hidden;
              }

              #preview-modal-container,
              #preview-modal-container * {
                  visibility: visible;
              }

              #preview-modal-container {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  overflow: visible !important; /* Critical for multi-page */
                  z-index: 9999 !important;
              }

              #preview-paper {
                  box-shadow: none !important;
                  margin: 0 auto !important;
                  width: 100% !important;
                  padding: 10mm !important; /* Keep internal padding */
                  max-width: none !important;
              }

              /* Explicitly hide toolbar even if it's inside the visible container */
              #preview-toolbar {
                  display: none !important;
              }

          ` : `
              /* NORMAL MODE (Printing the list view directly) */
              #preview-modal-container { display: none !important; }
              #reports-main-ui { display: block !important; }
          `}
        }
      `}</style>

      {/* Main Screen Content Wrapper */}
      <div id="reports-main-ui" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0 print:w-full print:rounded-none">
        
        {/* Screen Header - Hides on Print */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileBarChart2 className="w-6 h-6 text-primary-500" />
              Relatório de Colaboradores
            </h2>
            <p className="text-slate-500 text-sm mt-1">Selecione uma filial para visualizar o quadro de funcionários.</p>
          </div>
          
          <div className="flex gap-2">
             <button 
                onClick={handlePrint}
                disabled={!selectedFilial || users.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold uppercase tracking-wider text-xs shadow-lg shadow-slate-900/10"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>

             <button 
                onClick={() => setShowPreview(true)}
                disabled={!selectedFilial || users.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold uppercase tracking-wider text-xs"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </button>
          </div>
        </div>

        {/* Screen Filters - Hides on Print */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 print:hidden">
            <label className="block text-sm font-medium text-slate-700 mb-2">Selecione a Filial de Origem</label>
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <select
                    value={selectedFilial}
                    onChange={(e) => setSelectedFilial(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg appearance-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none font-medium text-slate-700"
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
          <div id="report-content" className="animate-[fadeIn_0.3s_ease-out] print:w-full">
            
            {/* PRINT HEADER - Shows ONLY on Print (Main Mode) OR when Exporting PDF */}
            <div className={`${isExporting ? 'flex' : 'hidden'} print:flex flex-row justify-between items-start mb-8 border-b-2 border-black pb-4`}>
                <div className="flex items-center gap-4">
                    <Logo className="w-12 h-12" variant="primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-black uppercase tracking-tight">K-System</h1>
                        <p className="text-sm text-gray-600">Relatório de Controle de Acessos e Colaboradores</p>
                    </div>
                </div>
                <div className="text-right">
                     <p className="text-xs text-gray-500 uppercase font-bold">Data de Emissão</p>
                     <p className="text-sm font-mono text-black mb-2">{new Date().toLocaleString()}</p>
                     <p className="text-xs text-gray-500 uppercase font-bold">Filtro Aplicado</p>
                     <p className="text-sm font-bold text-black">{selectedFilial === 'TODAS' ? 'TODAS AS FILIAIS' : selectedFilial}</p>
                </div>
            </div>

            {/* Content Stats */}
            <div className="mb-6 flex justify-between items-end print:mb-4">
                <div className={`${isExporting ? 'hidden' : 'block'} print:hidden`}>
                    <h3 className="text-lg font-bold text-slate-800">
                        {selectedFilial === 'TODAS' ? 'Quadro Geral' : selectedFilial}
                    </h3>
                </div>
                <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 print:bg-transparent print:border-none print:px-0">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider print:text-black">Total Registrados</p>
                    <p className="text-2xl font-bold text-primary-600 print:text-black flex items-center gap-2">
                        {users.length} <span className="text-sm text-slate-400 font-normal print:hidden">colaboradores</span>
                    </p>
                </div>
            </div>

            {users.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-slate-200 print:border-none print:overflow-visible print:rounded-none">
                    <table className="w-full text-left border-collapse print:w-full print:text-sm">
                        <thead className="bg-slate-50 print:bg-white print:border-b-2 print:border-black">
                            <tr>
                                <ThSortable label="Matrícula" columnKey="matricula" />
                                <ThSortable label="Nome Completo" columnKey="nomeCompleto" />
                                {selectedFilial === 'TODAS' && (
                                    <ThSortable label="Filial" columnKey="filial" />
                                )}
                                <th className="p-3 font-bold text-slate-700 border-b border-slate-200 text-left print:text-black print:border-black print:text-xs print:uppercase print:p-2">
                                    Departamento / Setor
                                </th>
                                <ThSortable label="Login" columnKey="login" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                            {sortedUsers.map((user, index) => (
                                <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} print:bg-transparent`}>
                                    <td className="p-3 font-mono font-bold text-slate-600 print:text-black print:border-b print:border-gray-200">{user.matricula}</td>
                                    
                                    <td className="p-3 print:text-black print:border-b print:border-gray-200">
                                         <div className="font-semibold text-slate-800 print:text-black">{user.nomeCompleto}</div>
                                         <div className="text-xs text-slate-400 print:hidden">Cadastrado em {new Date(user.dataCadastro).toLocaleDateString()}</div>
                                    </td>
                                    
                                    {selectedFilial === 'TODAS' && (
                                        <td className="p-3 text-slate-600 print:text-black print:border-b print:border-gray-200">
                                            {/* Screen Style: Red Pill */}
                                            <span className="print:hidden inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                {user.filial}
                                            </span>
                                            {/* Print Style: Text */}
                                            <span className="hidden print:inline font-bold text-xs">{user.filial}</span>
                                        </td>
                                    )}
                                    
                                    <td className="p-3 print:text-black print:border-b print:border-gray-200">
                                         <div className="text-sm text-slate-700 font-medium print:text-black">{user.departamento}</div>
                                         <div className="text-xs text-slate-500 uppercase tracking-wide print:text-gray-600">{user.setor}</div>
                                    </td>

                                    <td className="p-3 text-slate-600 print:text-black print:font-mono print:border-b print:border-gray-200">
                                        <span className="bg-slate-100 px-2 py-1 rounded print:bg-transparent print:p-0">{user.login}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 print:bg-white print:border-black">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3 print:hidden" />
                    <p className="text-slate-500 font-medium print:text-black">Nenhum colaborador encontrado para esta seleção.</p>
                </div>
            )}
            
            {/* Print Footer */}
            <div className={`${isExporting ? 'flex' : 'hidden'} print:flex mt-8 pt-4 border-t border-black text-xs text-gray-500 justify-between items-center`}>
                <p>Relatório gerado automaticamente pelo sistema.</p>
                <p>Página 1 de 1</p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between print:hidden">
                <p>Gerado pelo K-System</p>
                <p>{new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && (
          <div id="preview-modal-container" className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex justify-center overflow-y-auto animate-[fadeIn_0.2s]">
              <div className="relative w-full flex justify-center py-8 px-4">
                  
                  {/* Floating Toolbar */}
                  <div id="preview-toolbar" className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex gap-4 items-center">
                      <span className="text-sm font-semibold text-slate-300 pr-4 border-r border-slate-600 hidden sm:block">Visualização</span>
                      
                      {/* PDF Button */}
                      <div className="relative group">
                          <button 
                            onClick={handleExportPDF} 
                            disabled={isExporting}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-colors text-sm font-medium disabled:opacity-50"
                          >
                             {isExporting ? <Spinner size="sm" variant="white" /> : <FileDown className="w-4 h-4" />}
                             <span className="hidden sm:inline">PDF</span>
                          </button>
                          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                                Baixar em PDF
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-t border-l border-slate-700 rotate-45"></div>
                          </div>
                      </div>

                      {/* Print Button */}
                      <div className="relative group">
                          <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-colors text-sm font-medium"
                          >
                             <Printer className="w-4 h-4" />
                             <span className="hidden sm:inline">Imprimir</span>
                          </button>
                          <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                                Imprimir Relatório
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-t border-l border-slate-700 rotate-45"></div>
                          </div>
                      </div>

                      <div className="w-px h-6 bg-slate-600 mx-1"></div>

                      <button onClick={() => setShowPreview(false)} className="bg-slate-700 hover:bg-red-600 rounded-full p-1.5 transition-colors">
                          <X className="w-4 h-4" />
                      </button>
                  </div>

                  {/* A4 Paper Simulation */}
                  <div id="preview-paper" className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl relative animate-[scaleIn_0.3s_ease-out] text-black">
                      
                      {/* Header */}
                      <div className="flex flex-row justify-between items-start mb-8 border-b-2 border-black pb-4">
                        <div className="flex items-center gap-4">
                            <Logo className="w-12 h-12" variant="primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-black uppercase tracking-tight">K-System</h1>
                                <p className="text-sm text-gray-600">Relatório de Controle de Acessos e Colaboradores</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-bold">Data de Emissão</p>
                            <p className="text-sm font-mono text-black mb-2">{new Date().toLocaleString()}</p>
                            <p className="text-xs text-gray-500 uppercase font-bold">Filtro Aplicado</p>
                            <p className="text-sm font-bold text-black">{selectedFilial === 'TODAS' ? 'TODAS AS FILIAIS' : selectedFilial}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-6 flex justify-between items-end">
                        <div className="bg-transparent border-none px-0">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider text-black">Total Registrados</p>
                            <p className="text-2xl font-bold text-black flex items-center gap-2">
                                {users.length}
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-white border-b-2 border-black">
                            <tr>
                                <th className="p-2 font-bold text-black text-xs uppercase text-left border-b border-gray-300">Matrícula</th>
                                <th className="p-2 font-bold text-black text-xs uppercase text-left border-b border-gray-300">Nome</th>
                                {selectedFilial === 'TODAS' && (
                                     <th className="p-2 font-bold text-black text-xs uppercase text-left border-b border-gray-300">Filial</th>
                                )}
                                <th className="p-2 font-bold text-black text-xs uppercase text-left border-b border-gray-300">Departamento / Setor</th>
                                <th className="p-2 font-bold text-black text-xs uppercase text-left border-b border-gray-300">Login</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sortedUsers.map((user) => (
                                <tr key={user.id} className="bg-transparent">
                                    <td className="p-2 text-black border-b border-gray-200 font-mono">{user.matricula}</td>
                                    
                                    <td className="p-2 text-black border-b border-gray-200">
                                        <div className="font-bold">{user.nomeCompleto}</div>
                                        <div className="text-xs text-gray-500">Cadastrado em {new Date(user.dataCadastro).toLocaleDateString()}</div>
                                    </td>
                                    
                                    {selectedFilial === 'TODAS' && (
                                         <td className="p-2 text-black border-b border-gray-200 font-bold text-xs">{user.filial}</td>
                                    )}
                                    
                                    <td className="p-2 text-black border-b border-gray-200">
                                        <div className="text-xs font-bold">{user.departamento}</div>
                                        <div className="text-[10px] text-gray-500">{user.setor}</div>
                                    </td>
                                    
                                    <td className="p-2 text-black border-b border-gray-200 font-mono text-xs">{user.login}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div className="flex mt-8 pt-4 border-t border-black text-xs text-gray-500 justify-between items-center absolute bottom-[15mm] left-[15mm] right-[15mm]">
                        <p>Relatório gerado automaticamente pelo sistema.</p>
                        <p>Página 1 de 1</p>
                    </div>

                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
