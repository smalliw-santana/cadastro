import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService.ts';
import { SystemLog } from '../types.ts';
import { ScrollText, Search, Clock, User, Activity, Database, FileText } from 'lucide-react';
import { Input } from './Input.tsx';

export const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      setLogs(await dbService.getLogs());
    };
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE': return 'bg-green-100 text-green-700 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      case 'LOGIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'LOGOUT': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100">
        <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shadow-inner">
                <ScrollText className="w-8 h-8 text-red-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">Logs do Sistema</h1>
                <p className="text-slate-500 text-sm font-medium">Auditoria e rastreabilidade de operações CRUD.</p>
            </div>
        </div>
        
        <div className="w-full md:w-96">
            <Input 
                icon={Search}
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[2rem] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                        <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5"/> Data/Hora</div>
                        </th>
                        <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            <div className="flex items-center gap-2"><User className="w-3.5 h-3.5"/> Usuário</div>
                        </th>
                        <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> Ação</div>
                        </th>
                        <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            <div className="flex items-center gap-2"><Database className="w-3.5 h-3.5"/> Recurso</div>
                        </th>
                        <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-full">
                            <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5"/> Detalhes</div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap font-medium">
                                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                                </td>
                                <td className="py-4 px-6 text-sm font-bold text-slate-700 whitespace-nowrap">
                                    {log.userName}
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-600 font-medium whitespace-nowrap">
                                    {log.resource}
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-500">
                                    {log.details}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="py-16 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <ScrollText className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-base font-medium text-slate-500">Nenhum log encontrado</p>
                                    <p className="text-sm mt-1">Tente ajustar seus filtros de busca.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
