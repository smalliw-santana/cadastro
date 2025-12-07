
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { Users, Building2, TrendingUp } from 'lucide-react';

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
  const [filialOptions, setFilialOptions] = useState<string[]>([]);

  useEffect(() => {
    setUsers(dbService.getAllUsers());
    setFilialOptions(dbService.getFiliais());
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
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredUsers]);

  const sectorData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUsers.forEach(u => {
      counts[u.setor] = (counts[u.setor] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredUsers]);

  const COLORS = ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];

  return (
    <div className="p-6 space-y-8 animate-[fadeIn_0.4s_ease-out]">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="w-full md:w-1/3">
           <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Building2 className="w-5 h-5 text-primary-500"/> 
             Filtro por Filial
           </h2>
           <div className="relative">
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500 outline-none text-slate-700 font-medium"
                value={selectedFilial}
                onChange={(e) => {
                    setSelectedFilial(e.target.value);
                }}
              >
                <option value="TODAS">TODAS AS FILIAIS</option>
                {filialOptions.map(f => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
};
