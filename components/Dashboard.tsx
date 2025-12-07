import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { dbService } from '../services/dbService';
import { User, Filial } from '../types';
import { Select } from './Select';
import { generateFilialReport } from '../services/geminiService';
import { Bot, FileText, Loader2, Users, Building2, TrendingUp } from 'lucide-react';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-primary-600 font-bold">
          {payload[0].value} Colaboradores
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const [selectedFilial, setSelectedFilial] = useState<string>('TODAS');
  const [users, setUsers] = useState<User[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    setUsers(dbService.getAllUsers());
  }, []);

  const filteredUsers = useMemo(() => {
    if (selectedFilial === 'TODAS') return users;
    return users.filter(u => u.filial === selectedFilial);
  }, [selectedFilial, users]);

  // Data for Department Chart
  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUsers.forEach(u => {
      counts[u.departamento] = (counts[u.departamento] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredUsers]);

  // Data for Sector Pie Chart
  const sectorData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUsers.forEach(u => {
      counts[u.setor] = (counts[u.setor] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredUsers]);

  const COLORS = ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];

  const handleGenerateReport = async () => {
    if (filteredUsers.length === 0) return;
    setIsGeneratingReport(true);
    setAiReport(null);
    const report = await generateFilialReport(selectedFilial, filteredUsers);
    setAiReport(report);
    setIsGeneratingReport(false);
  };

  return (
    <div className="p-6 space-y-8 animate-[fadeIn_0.4s_ease-out]">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="w-full md:w-1/3">
           <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Building2 className="w-5 h-5 text-primary-500"/> 
             Filtro por Unidade
           </h2>
           <div className="relative">
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500 outline-none text-slate-700 font-medium"
                value={selectedFilial}
                onChange={(e) => {
                    setSelectedFilial(e.target.value);
                    setAiReport(null); // Clear old report
                }}
              >
                <option value="TODAS">TODAS AS FILIAIS</option>
                {Object.values(Filial).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
           </div>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Colaboradores</p>
              <p className="text-2xl font-bold text-blue-900">{filteredUsers.length}</p>
           </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500"/>
            Distribuição por Departamento
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1000}>
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary-500"/>
            Distribuição por Setor
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Report Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg">
                <Bot className="w-6 h-6 text-primary-300" />
             </div>
             <div>
               <h3 className="text-xl font-bold">Smart Analysis</h3>
               <p className="text-slate-400 text-sm">Relatório inteligente via Gemini AI</p>
             </div>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || filteredUsers.length === 0}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {isGeneratingReport ? 'Gerando Análise...' : 'Gerar Relatório IA'}
          </button>
        </div>

        <div className="bg-black/20 rounded-xl p-6 min-h-[100px] border border-white/5">
          {aiReport ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: aiReport.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          ) : (
            <div className="text-center text-slate-500 py-4">
              <p>Clique em "Gerar Relatório IA" para receber uma análise estratégica da filial selecionada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};