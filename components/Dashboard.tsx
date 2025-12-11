
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { dbService } from '../services/dbService.ts';
import { User } from '../types.ts';
import { Users, Building2, Filter, BarChart3, PieChart as PieIcon, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { Spinner } from './Spinner.tsx';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 min-w-[180px] animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{label}</p>
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-600 ring-4 ring-primary-50"></span>
                <span className="text-sm font-semibold text-slate-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight leading-none">
            {payload[0].value}
            </p>
        </div>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const [selectedFilial, setSelectedFilial] = useState<string>('TODAS');
  const [users, setUsers] = useState<User[]>([]);
  const [filialOptions, setFilialOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate Data Fetching
    const loadData = async () => {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
        setUsers(dbService.getAllUsers());
        setFilialOptions(dbService.getFiliais());
        setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (selectedFilial === 'TODAS') return users;
    return users.filter(u => u.filial === selectedFilial);
  }, [selectedFilial, users]);

  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUsers.forEach(u => {
      counts[u.departamento] = (counts[u.departamento] || 0) + 1;
    });
    // Sort by value desc
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8); // Top 8
  }, [filteredUsers]);

  const sectorData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUsers.forEach(u => {
      counts[u.setor] = (counts[u.setor] || 0) + 1;
    });
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6
  }, [filteredUsers]);

  // Enhanced Modern Palette
  const COLORS = [
      '#4f46e5', // Primary 600 (Deep Indigo)
      '#818cf8', // Primary 400 (Soft Indigo)
      '#06b6d4', // Cyan 500
      '#10b981', // Emerald 500
      '#f59e0b', // Amber 500
      '#ec4899', // Pink 500
      '#6366f1'  // Indigo 500
  ];

  if (isLoading) {
      return (
          <div className="flex h-full items-center justify-center min-h-[400px] animate-[fadeIn_0.3s]">
              <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                     <div className="absolute inset-0 bg-primary-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                     <Spinner size="lg" className="relative z-10" />
                  </div>
                  <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">Carregando Dashboard...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 animate-[fadeIn_0.6s_cubic-bezier(0.16,1,0.3,1)]">
      
      {/* Top Section: KPIs and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Filter Card */}
        <div className="md:col-span-8 bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-center relative overflow-hidden group hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] transition-all duration-500">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-slate-50 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none transition-transform duration-700 group-hover:scale-110 opacity-60"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                            <Filter className="w-5 h-5"/>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filtros Globais</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Controle de Visualização</h2>
                </div>
                
                <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 pointer-events-none" />
                    <select
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold rounded-2xl pl-12 pr-10 py-4 appearance-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all cursor-pointer shadow-sm"
                        value={selectedFilial}
                        onChange={(e) => setSelectedFilial(e.target.value)}
                    >
                        <option value="TODAS">VISÃO GLOBAL - TODAS AS FILIAIS</option>
                        {filialOptions.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
        </div>

        {/* KPI Card */}
        <div className="md:col-span-4 bg-gradient-to-br from-primary-600 via-indigo-700 to-indigo-900 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.35)] p-8 text-white relative overflow-hidden flex flex-col justify-between group">
             {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/10 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                     <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg shadow-black/5">
                        <Users className="w-6 h-6 text-white" />
                     </div>
                     <span className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-100 px-3 py-1.5 rounded-full border border-emerald-400/20 backdrop-blur-sm">
                        <Activity className="w-3 h-3" /> ATIVOS
                     </span>
                </div>
                
                <div className="mt-auto">
                    <h2 className="text-6xl font-bold tracking-tighter mb-1 drop-shadow-sm">{filteredUsers.length}</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-indigo-100 font-medium text-sm tracking-wide opacity-90">Total de Colaboradores</p>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                            <ArrowUpRight className="w-4 h-4 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100 h-[520px] flex flex-col relative overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] transition-all duration-500 group">
           <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    Distribuição por Departamento
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 font-medium">Quantidade de colaboradores por área</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                 <BarChart3 className="w-5 h-5" />
              </div>
           </div>
           
           <div className="flex-1 w-full min-h-0 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600, fontFamily: 'Inter'}} 
                        interval={0} 
                        angle={-15}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500, fontFamily: 'Inter'}} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', opacity: 0.8}} />
                    <Bar dataKey="value" fill="url(#colorBar)" radius={[6, 6, 0, 0]} barSize={48} animationDuration={1500} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.02)] border border-slate-100 h-[520px] flex flex-col relative overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)] transition-all duration-500 group">
           <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    Distribuição por Setor
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 font-medium">Top 6 setores com mais colaboradores</p>
              </div>
              <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                 <PieIcon className="w-5 h-5" />
              </div>
           </div>

           <div className="flex-1 w-full min-h-0 relative z-10 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={145}
                    paddingAngle={4}
                    dataKey="value"
                    cornerRadius={8}
                    stroke="none"
                >
                    {sectorData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="hover:opacity-80 transition-opacity duration-300 cursor-pointer outline-none focus:outline-none"
                    />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text for Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-14">
                 <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5 text-slate-400" />
                 </div>
                 <p className="text-4xl font-bold text-slate-800 tracking-tight">{sectorData.length}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Setores</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
