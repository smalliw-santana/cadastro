import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { dbService } from '../services/dbService.ts';
import { User } from '../types.ts';
import { 
  Users, 
  Building2, 
  Filter, 
  BarChart3, 
  ArrowUpRight, 
  Sparkles, 
  FileText, 
  ChevronDown, 
  Globe, 
  Table2,
  Check
} from 'lucide-react';
import { Spinner } from './Spinner.tsx';

interface GradientDef {
  id: string;
  from: string;
  to: string;
  badge: string;
}

const BAR_GRADIENTS: GradientDef[] = [
  { id: 'bar-grad-0', from: '#ff3366', to: '#ff5c8a', badge: '#d90429' }, // Coral / Rose
  { id: 'bar-grad-1', from: '#0099ff', to: '#38bdf8', badge: '#0284c7' }, // Sky Blue
  { id: 'bar-grad-2', from: '#10b981', to: '#34d399', badge: '#059669' }, // Emerald
  { id: 'bar-grad-3', from: '#f59e0b', to: '#fbbf24', badge: '#d97706' }, // Amber / Gold
  { id: 'bar-grad-4', from: '#8b5cf6', to: '#a855f7', badge: '#7c3aed' }, // Purple
  { id: 'bar-grad-5', from: '#f43f5e', to: '#fb7185', badge: '#e11d48' }, // Pink
  { id: 'bar-grad-6', from: '#06b6d4', to: '#22d3ee', badge: '#0891b2' }, // Cyan
  { id: 'bar-grad-7', from: '#6366f1', to: '#818cf8', badge: '#4f46e5' }, // Indigo
];

const SECTOR_PIE_COLORS = [
  '#e11d48', // Rose / Red
  '#8b5cf6', // Purple / Violet
  '#3b82f6', // Royal Blue
  '#84cc16', // Lime Green
  '#f97316', // Vivid Orange
  '#06b6d4', // Teal Cyan
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const displayLabel = typeof label === 'string' || typeof label === 'number' ? label : payload[0].name;
    const color = payload[0].color || payload[0].fill || '#f43f5e';
    return (
      <div className="bg-white dark:bg-dark-800 px-4 py-3 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-600 min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
        <p className="text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-dark-700 pb-1.5">
          {displayLabel}
        </p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: color, boxShadow: `0 0 0 3px ${color}33` }}
            />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Colaboradores</span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {payload[0].value}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// Custom shape that renders pill-shaped bars with gradient fill & floating count badge
const CustomBarShape = (props: any) => {
  const { x, y, width, height, value, index } = props;
  if (!height || height <= 0) return null;

  const grad = BAR_GRADIENTS[index % BAR_GRADIENTS.length];
  const barWidth = Math.min(Math.max(width * 0.65, 26), 44);
  const barX = x + (width - barWidth) / 2;
  const radius = Math.min(10, barWidth / 2);
  const badgeWidth = Math.max(String(value).length * 8 + 14, 28);
  const badgeHeight = 18;
  const badgeX = barX + (barWidth - badgeWidth) / 2;
  const badgeY = Math.max(y - 23, 2);

  return (
    <g className="transition-all duration-300">
      {/* Soft color glow underneath the bar */}
      <rect
        x={barX + 2}
        y={y + 6}
        width={barWidth - 4}
        height={height}
        rx={radius}
        fill={`url(#${grad.id})`}
        opacity={0.3}
        filter="blur(3px)"
      />
      {/* Main capsule-shaped bar */}
      <rect
        x={barX}
        y={y}
        width={barWidth}
        height={height}
        rx={radius}
        fill={`url(#${grad.id})`}
        className="hover:opacity-90 transition-opacity"
      />
      {/* Top Value Pill */}
      {value > 0 && (
        <g>
          <rect
            x={badgeX}
            y={badgeY}
            width={badgeWidth}
            height={badgeHeight}
            rx={badgeHeight / 2}
            fill={grad.badge}
            className="filter drop-shadow-sm"
          />
          <text
            x={badgeX + badgeWidth / 2}
            y={badgeY + 12}
            fill="#ffffff"
            textAnchor="middle"
            fontSize="10"
            fontWeight="800"
            fontFamily="Inter, sans-serif"
          >
            {value}
          </text>
        </g>
      )}
    </g>
  );
};

export const Dashboard: React.FC = () => {
  const [selectedFilial, setSelectedFilial] = useState<string>('TODAS');
  const [users, setUsers] = useState<User[]>([]);
  const [filialOptions, setFilialOptions] = useState<string[]>([]);
  const [logsCount, setLogsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [chartViewMode, setChartViewMode] = useState<'chart' | 'table'>('chart');
  const [showAllSectors, setShowAllSectors] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      const usersData = await dbService.getAllUsers();
      const filiaisData = await dbService.getFiliais();
      const logsData = await dbService.getLogs();
      setUsers(usersData);
      setFilialOptions(filiaisData);
      setLogsCount(logsData.length);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (selectedFilial === 'TODAS') return users;
    return users.filter(u => u.filial === selectedFilial);
  }, [selectedFilial, users]);

  const funcaoData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUsers.forEach(u => {
      counts[u.funcao] = (counts[u.funcao] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredUsers]);

  const sectorData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredUsers.forEach(u => {
      counts[u.setor] = (counts[u.setor] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return showAllSectors ? sorted : sorted.slice(0, 6);
  }, [filteredUsers, showAllSectors]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[440px] animate-[fadeIn_0.3s]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-400 rounded-full blur-3xl opacity-25 animate-pulse"></div>
            <Spinner size="lg" className="relative z-10" />
          </div>
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">Carregando Métricas do Painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 animate-[fadeIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
      
      {/* TOP FILTER CARD ("Controle de Visualização") */}
      <div className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/80 dark:border-dark-700 relative overflow-hidden transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            {/* Header pill badge */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 shadow-xs">
                <Filter className="w-3.5 h-3.5" />
                FILTROS GLOBAIS
              </span>
              <span className="text-slate-300 dark:text-dark-600 font-bold">•</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Atualizado há 3 minutos
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Controle de Visualização
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
              Filtre métricas e distribuições por unidade operacional, departamento ou turno em tempo real.
            </p>
          </div>

          {/* Right Select Pill */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-auto sm:min-w-[340px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                className="w-full bg-white dark:bg-dark-900 border border-slate-200 hover:border-slate-300 dark:border-dark-600 dark:hover:border-dark-500 text-slate-800 dark:text-slate-100 text-xs md:text-sm font-bold rounded-2xl pl-11 pr-10 py-3.5 appearance-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all cursor-pointer shadow-xs"
                value={selectedFilial}
                onChange={(e) => setSelectedFilial(e.target.value)}
              >
                <option value="TODAS">VISÃO GLOBAL - TODAS AS FILIAIS</option>
                {filialOptions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            {/* Subtle status indicator dot beside select as seen in reference */}
            <div 
              className="w-3 h-3 rounded-full border-2 border-slate-300 dark:border-dark-600 shrink-0 hidden sm:block" 
              title="Sincronizado"
            />
          </div>
        </div>
      </div>

      {/* 3 TOP METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: Total de Colaboradores (Rose/Pink Gradient) */}
        <div className="bg-gradient-to-br from-[#ffeef1] via-[#ffdbe2] to-[#ffccd6] dark:from-[#361318] dark:via-[#2b0e12] dark:to-[#1c080b] border border-rose-200/90 dark:border-rose-900/40 rounded-3xl p-6 md:p-7 shadow-[0_12px_28px_rgba(244,63,94,0.12)] relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(244,63,94,0.18)] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="w-12 h-12 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-rose-100/80 dark:border-rose-900/40 flex items-center justify-center text-rose-500 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-[#dcfce7] text-[#15803d] border border-green-200/80 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              ATIVOS (98.2%)
            </span>
          </div>

          <div>
            <div className="flex items-baseline flex-wrap gap-2 mb-1">
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {filteredUsers.length}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 dark:bg-dark-800 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60 shadow-xs">
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                +14 neste mês
              </span>
            </div>
            <p className="text-[11px] font-black tracking-widest text-rose-800/80 dark:text-rose-300/90 uppercase mt-2">
              TOTAL DE COLABORADORES
            </p>
          </div>
        </div>

        {/* CARD 2: Filiais Cadastradas (Sky/Blue Gradient) */}
        <div className="bg-gradient-to-br from-[#f0f5ff] via-[#e2edff] to-[#d4e4fc] dark:from-[#0d162b] dark:via-[#131b38] dark:to-[#0f172a] border border-blue-200/90 dark:border-blue-900/40 rounded-3xl p-6 md:p-7 shadow-[0_12px_28px_rgba(59,130,246,0.12)] relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(59,130,246,0.18)] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="w-12 h-12 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-black bg-[#4f46e5] text-white shadow-xs tracking-wider uppercase">
              UNIDADES
            </span>
          </div>

          <div>
            <div className="flex items-baseline flex-wrap gap-2 mb-1">
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {filialOptions.length}
              </h3>
              <span className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300 ml-1">
                unidades operando
              </span>
            </div>
            <p className="text-[11px] font-black tracking-widest text-blue-800/80 dark:text-blue-300/90 uppercase mt-2">
              FILIAIS CADASTRADAS
            </p>
          </div>
        </div>

        {/* CARD 3: Logs Recentes (Mint/Emerald Gradient) */}
        <div className="bg-gradient-to-br from-[#eefdf5] via-[#dcfce7] to-[#ccfbf1] dark:from-[#06201a] dark:via-[#092923] dark:to-[#042421] border border-emerald-200/90 dark:border-emerald-900/40 rounded-3xl p-6 md:p-7 shadow-[0_12px_28px_rgba(16,185,129,0.12)] relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(16,185,129,0.18)] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="w-12 h-12 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-emerald-100/80 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black bg-[#047857] text-white shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200"></span>
              Auditoria
            </span>
          </div>

          <div>
            <div className="flex items-baseline flex-wrap gap-2 mb-1">
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {logsCount}
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/95 dark:bg-dark-800 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60 shadow-xs ml-1">
                Hoje
              </span>
            </div>
            <p className="text-[11px] font-black tracking-widest text-emerald-800/80 dark:text-emerald-300/90 uppercase mt-2">
              LOGS RECENTES
            </p>
          </div>
        </div>

      </div>

      {/* 2 BOTTOM CARDS: Distribuição por Função & Distribuição por Setor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT CARD: Distribuição por Função */}
        <div className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 dark:border-dark-700 h-[560px] flex flex-col justify-between relative overflow-hidden transition-all">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-dark-700/80 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                  COLABORADORES POR FUNÇÃO
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Distribuição por Função
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Headcount ativo por função operacional e de liderança
              </p>
            </div>

            {/* Toggle view buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-200/70 dark:border-dark-700">
              <button 
                onClick={() => setChartViewMode('chart')}
                className={`p-2 rounded-lg transition-all ${chartViewMode === 'chart' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Visualização em Gráfico"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartViewMode('table')}
                className={`p-2 rounded-lg transition-all ${chartViewMode === 'table' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Visualização em Tabela"
              >
                <Table2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chart or Table Body */}
          <div className="flex-1 w-full min-h-0 pt-6">
            {chartViewMode === 'chart' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funcaoData} margin={{ top: 28, right: 10, left: -20, bottom: 20 }}>
                  {/* SVG Gradients for Custom Bars */}
                  <defs>
                    {BAR_GRADIENTS.map(g => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={g.to} />
                        <stop offset="100%" stopColor={g.from} />
                      </linearGradient>
                    ))}
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }} 
                    tickLine={false} 
                    tick={{ 
                      fill: '#475569', 
                      fontSize: 10, 
                      fontWeight: 800, 
                      fontFamily: 'Inter, sans-serif' 
                    }} 
                    interval={0} 
                    angle={-18}
                    textAnchor="end"
                    height={55}
                    tickFormatter={(val: string) => {
                      if (!val) return '';
                      return val.length > 11 ? `${val.substring(0, 9)}...`.toUpperCase() : val.toUpperCase();
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.6 }} />
                  <Bar 
                    dataKey="value" 
                    shape={<CustomBarShape />} 
                    animationDuration={1000}
                  >
                    {funcaoData.map((_, index) => (
                      <Cell key={`funcao-cell-${index}`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full overflow-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-dark-900/60 text-slate-500 uppercase tracking-wider font-extrabold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Posição / Função</th>
                      <th className="py-2.5 px-3 text-right">Headcount</th>
                      <th className="py-2.5 px-3 rounded-r-lg text-right">% do Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-700/60 font-semibold">
                    {funcaoData.map((item, idx) => {
                      const pct = filteredUsers.length > 0 ? ((item.value / filteredUsers.length) * 100).toFixed(1) : '0';
                      const grad = BAR_GRADIENTS[idx % BAR_GRADIENTS.length];
                      return (
                        <tr key={item.name} className="hover:bg-slate-50/60 dark:hover:bg-dark-900/40">
                          <td className="py-3 px-3 flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: grad.badge }} 
                            />
                            <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">{item.name}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
                            {item.value}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-500 dark:text-slate-400">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CARD: Distribuição por Setor */}
        <div className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-200/80 dark:border-dark-700 h-[560px] flex flex-col justify-between relative overflow-hidden transition-all">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-dark-700/80 shrink-0">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-[11px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                  VISÃO POR SETORES
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Distribuição por Setor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {showAllSectors ? 'Todos os setores cadastrados' : 'Top 6 áreas operacionais e administrativas'}
              </p>
            </div>

            {/* Globe / Network Icon Badge */}
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-100 dark:border-purple-800/60 shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
          </div>

          {/* Donut Chart Area */}
          <div className="flex-1 w-full min-h-0 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={74}
                  outerRadius={122}
                  paddingAngle={4}
                  dataKey="value"
                  cornerRadius={8}
                  stroke="none"
                >
                  {sectorData.map((_, index) => (
                    <Cell 
                      key={`sector-cell-${index}`} 
                      fill={SECTOR_PIE_COLORS[index % SECTOR_PIE_COLORS.length]} 
                      className="hover:opacity-85 transition-opacity duration-200 cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Central Badge Overlay inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {sectorData.length}
              </p>
              <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-1">
                SETORES
              </p>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-dark-700/80 flex items-center justify-between text-xs font-semibold shrink-0">
            <span className="text-slate-600 dark:text-slate-400 font-bold">
              Total: <span className="text-slate-900 dark:text-white font-black">{filteredUsers.length}</span> colaboradores
            </span>
            <button 
              onClick={() => setShowAllSectors(!showAllSectors)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              {showAllSectors ? 'Ver resumido' : 'Ver detalhado'} 
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
