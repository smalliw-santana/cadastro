
import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { FileBarChart2, Printer, Users, Building2, MapPin, ArrowUpDown, ArrowUp, ArrowDown, FileDown, Eye, X } from 'lucide-react';
import { Logo } from './Logo';
import { Spinner } from './Spinner';

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

  const handlePrint = () => {
    if (showPreview) {
        // --- PREVIEW PRINT STRATEGY (DOM PORTAL) ---
        // Creates a temporary clone of the paper at the body root to bypass React nesting and existing layout CSS
        const content = document.getElementById('preview-paper');
        if (!content) return;

        // 1. Create Portal Container
        const printPortal = document.createElement('div');
        printPortal.id = 'print-portal';
        
        // 2. Clone content (preserves Tailwind classes)
        // We wrap it to ensure margins are handled correctly
        const wrapper = document.createElement('div');
        wrapper.appendChild(content.cloneNode(true));
        printPortal.appendChild(wrapper);

        document.body.appendChild(printPortal);

        // 3. Inject Blocking CSS
        const style = document.createElement('style');
        style.id = 'print-portal-style';
        style.textContent = `
            @media print {
                /* Aggressively hide EVERYTHING else */
                body > *:not(#print-portal) { display: none !important; }
                #root { display: none !important; } /* Specific override for index.html styles */
                
                /* Reset Body */
                html, body { 
                    height: auto !important; 
                    overflow: visible !important; 
                    background: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                /* Show Portal */
                #print-portal {
                    display: block !important;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    z-index: 99999;
                }

                /* Reset Paper Styles for pure print */
                #print-portal > div > div {
                    box-shadow: none !important;
                    margin: 0 !important;
                    padding: 10mm !important; /* Standard Margin */
                    max-width: none !important;
                    width: 100% !important;
                    border: none !important;
                }
                
                /* Ensure Text Color */
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
        `;
        document.head.appendChild(style);

        // 4. Print
        setTimeout(() => {
            window.print();
            
            // 5. Cleanup (Clean up immediately after print dialog opens/closes)
            // Using a slightly longer timeout to ensure browser captures the render
            setTimeout(() => {
                if (document.body.contains(printPortal)) document.body.removeChild(printPortal);
                if (document.head.contains(style)) document.head.removeChild(style);
            }, 500);
        }, 100);

    } else {
        // --- NORMAL LIST PRINT STRATEGY ---
        window.print();
    }
  };

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
        margin: [10, 10, 10, 10], // mm
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
        Standard List Print Styles 
        Only active when NOT in preview mode (handlePrint handles preview mode manually)
      */}
      <style>{`
        @media print {
          @page { size: auto; margin: 0mm; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          /* Hide non-print elements globally */
          nav, aside, header, .print\\:hidden { display: none !important; }

          /* Default behaviour: Hide Modal stuff unless Portal is active (which is handled in JS) */
          #preview-modal-container { display: none !important; }
          #print-portal { display: block !important; }
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
            <p className="text-slate-500 text-sm mt-1">Selecione uma filial para visualizar e imprimir o quadro de funcionários.</p>
          </div>
          
          <div className="flex gap-2">
             <button 
                onClick={() => setShowPreview(true)}
                disabled={!selectedFilial || users.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold uppercase tracking-wider text-xs"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </button>

             <button 
                onClick={handlePrint}
                disabled={!selectedFilial || users.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold uppercase tracking-wider text-xs"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>

              <button 
                onClick={handleExportPDF}
                disabled={!selectedFilial || users.length === 0 || isExporting}
                className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wider text-xs w-40 justify-center"
              >
                {isExporting ? <Spinner size="sm" variant="white" /> : <FileDown className="w-4 h-4" />}
                {isExporting ? 'Gerando...' : 'Exportar PDF'}
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
                        <h1 className="text-2xl font-bold text-black uppercase tracking-tight">K-System Enterprise</h1>
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
                                <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} print:bg-transparent`}>
                                    <td className="p-3 font-mono font-bold text-slate-600 print:text-black print:border-b print:border-gray-200">{user.matricula}</td>
                                    <td className="p-3 font-medium text-slate-800 print:text-black print:border-b print:border-gray-200">{user.nomeCompleto}</td>
                                    {selectedFilial === 'TODAS' && (
                                        <td className="p-3 text-slate-600 print:text-black print:border-b print:border-gray-200">
                                            <span className="print:hidden inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 border border-slate-200">
                                                {user.filial}
                                            </span>
                                            <span className="hidden print:inline font-semibold">{user.filial}</span>
                                        </td>
                                    )}
                                    <td className="p-3 text-slate-600 print:text-black print:border-b print:border-gray-200">{user.departamento}</td>
                                    <td className="p-3 text-slate-600 print:text-black print:border-b print:border-gray-200">{user.setor}</td>
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
                <p>Gerado pelo K-System Enterprise</p>
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
                      <span className="text-sm font-semibold text-slate-300 pr-4 border-r border-slate-600">Visualização de Impressão</span>
                      
                      <button onClick={handlePrint} className="hover:text-primary-400 transition-colors flex items-center gap-1 text-sm font-medium">
                          <Printer className="w-4 h-4" /> Imprimir
                      </button>
                      
                      <button onClick={handleExportPDF} disabled={isExporting} className="hover:text-primary-400 transition-colors flex items-center gap-1 text-sm font-medium">
                           {isExporting ? <Spinner size="sm" variant="white" /> : <FileDown className="w-4 h-4" />} PDF
                      </button>

                      <button onClick={() => setShowPreview(false)} className="bg-slate-700 hover:bg-slate-600 rounded-full p-1 ml-2 transition-colors">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {/* A4 Paper Simulation */}
                  <div id="preview-paper" className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl relative animate-[scaleIn_0.3s_ease-out] text-black">
                      
                      {/* Header */}
                      <div className="flex flex-row justify-between items-start mb-8 border-b-2 border-black pb-4">
                        <div className="flex items-center gap-4">
                            <Logo className="w-12 h-12" variant="primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-black uppercase tracking-tight">K-System Enterprise</h1>
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
                                <th className="p-2 font-bold text-black text-xs uppercase text-left border-b border-gray-300">Departamento</th>
                                <th className="p-2 font-bold text-black text-xs uppercase text-left border-b border-gray-300">Setor</th>
                                <th className="p-2 font-bold text-black text-xs uppercase text-left border-b border-gray-300">Login</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sortedUsers.map((user) => (
                                <tr key={user.id} className="bg-transparent">
                                    <td className="p-2 text-black border-b border-gray-200 font-mono">{user.matricula}</td>
                                    <td className="p-2 text-black border-b border-gray-200">{user.nomeCompleto}</td>
                                    {selectedFilial === 'TODAS' && (
                                         <td className="p-2 text-black border-b border-gray-200 font-bold text-xs">{user.filial}</td>
                                    )}
                                    <td className="p-2 text-black border-b border-gray-200 text-xs">{user.departamento}</td>
                                    <td className="p-2 text-black border-b border-gray-200 text-xs">{user.setor}</td>
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
