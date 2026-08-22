import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Trees,
  Maximize2,
  Percent,
  FileCheck,
  Users2,
  Database,
  Building,
  Landmark,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g style={{ outline: 'none' }}>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 7}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35))',
          cursor: 'pointer',
          outline: 'none',
        }}
      />
    </g>
  );
};

export const VisaoGeral: React.FC = () => {
  const { filteredUcs, data, setActiveTab } = useData();
  const [activeEsferaIndex, setActiveEsferaIndex] = useState<number | undefined>(undefined);
  const [activeGrupoIndex, setActiveGrupoIndex] = useState<number | undefined>(undefined);

  // Calculate dynamic KPIs from filteredUcs
  const stats = useMemo(() => {
    const total = filteredUcs.length;
    const totalAreaHa = filteredUcs.reduce((acc, u) => acc + u.area_ha, 0);
    const totalAreaKm2 = Math.round((totalAreaHa / 100) * 100) / 100;
    const scAreaTotalKm2 = 95730;
    const pctCobertura = Math.round((totalAreaKm2 / scAreaTotalKm2) * 10000) / 100;

    const noCnuc = filteredUcs.filter((u) => u.cnuc).length;
    const foraCnuc = total - noCnuc;

    const comPm = filteredUcs.filter((u) => u.plano_manejo).length;
    const pctPm = total ? Math.round((comPm / total) * 1000) / 10 : 0;

    const comCg = filteredUcs.filter((u) => u.conselho_gestor).length;
    const pctCg = total ? Math.round((comCg / total) * 1000) / 10 : 0;

    return {
      total,
      totalAreaHa: Math.round(totalAreaHa).toLocaleString('pt-BR'),
      totalAreaKm2: totalAreaKm2.toLocaleString('pt-BR'),
      pctCobertura,
      noCnuc,
      foraCnuc,
      comPm,
      pctPm,
      comCg,
      pctCg,
    };
  }, [filteredUcs]);

  // Esfera Breakdown
  const esferaData = useMemo(() => {
    const map: Record<string, { count: number; area: number }> = {};
    filteredUcs.forEach((u) => {
      const e = u.esfera || 'Outra';
      map[e] = map[e] || { count: 0, area: 0 };
      map[e].count += 1;
      map[e].area += u.area_ha;
    });
    return Object.entries(map).map(([name, val]) => ({
      name,
      count: val.count,
      area_km2: Math.round(val.area / 100),
    }));
  }, [filteredUcs]);

  // Grupo Breakdown
  const grupoData = useMemo(() => {
    const map: Record<string, { count: number; area: number }> = {};
    filteredUcs.forEach((u) => {
      const g = u.grupo || 'Outro';
      map[g] = map[g] || { count: 0, area: 0 };
      map[g].count += 1;
      map[g].area += u.area_ha;
    });
    return Object.entries(map).map(([name, val]) => ({
      name,
      count: val.count,
      area_km2: Math.round(val.area / 100),
    }));
  }, [filteredUcs]);

  // Categorias Top
  const categoriaData = useMemo(() => {
    const map: Record<string, { count: number; area_ha: number }> = {};
    filteredUcs.forEach((u) => {
      const c = u.categoria || 'Não classificada';
      map[c] = map[c] || { count: 0, area_ha: 0 };
      map[c].count += 1;
      map[c].area_ha += u.area_ha;
    });
    return Object.entries(map)
      .map(([name, val]) => ({
        name,
        fullName: name,
        count: val.count,
        area_ha: Math.round(val.area_ha),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredUcs]);

  // Timeline Decade data
  const timelineData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredUcs.forEach((u) => {
      if (u.ano_criacao && u.ano_criacao >= 1950) {
        const dec = `${Math.floor(u.ano_criacao / 10) * 10}s`;
        map[dec] = (map[dec] || 0) + 1;
      }
    });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([decada, count]) => ({ decada, ucs: count }));
  }, [filteredUcs]);

  const COLORS_ESFERA = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
  const COLORS_GRUPO = ['#059669', '#0284c7'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Context */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold backdrop-blur-sm border border-emerald-500/30 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Observatório Estadual do SNUC Santa Catarina
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Panorama das Unidades de Conservação em SC
            </h2>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
              Consolidação de dados do CNUC, cadastros estaduais e municipais de Santa Catarina.
              Análise territorial, atos legais de criação e maturidade de gestão ambiental.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('mapa-interativo')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition"
            >
              <span>Ver no Mapa Interativo</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total UCs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total de UCs</span>
            <Trees className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.total}
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
              {stats.noCnuc}
            </span>{' '}
            no CNUC •{' '}
            <span className="text-amber-600 dark:text-amber-400 font-semibold mx-1">
              {stats.foraCnuc}
            </span>{' '}
            fora
          </div>
        </div>

        {/* Área Protegida (ha) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Área Protegida</span>
            <Maximize2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
              {stats.totalAreaHa}
            </span>
            <span className="text-xs text-slate-500 font-bold">ha</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            ≈ {stats.totalAreaKm2} km² protegidos
          </div>
        </div>

        {/* % Cobertura SC */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">% Território SC</span>
            <Percent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.pctCobertura}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            do território catarinense
          </div>
        </div>

        {/* Plano de Manejo */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Plano de Manejo</span>
            <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.pctPm}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.comPm} UCs com plano formal
          </div>
        </div>

        {/* Conselho Gestor */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Conselho Gestor</span>
            <Users2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.pctCg}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.comCg} UCs com conselho ativo
          </div>
        </div>

        {/* Áreas Tradicionais & RPPNs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Mosaico Compl.</span>
            <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {(data?.terrasIndigenas.length || 0) + (data?.quilombolas.length || 0) + (data?.rppns.length || 0)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {data?.terrasIndigenas.length || 0} TIs • {data?.quilombolas.length || 0} Quil. • {data?.rppns.length || 0} RPPNs
          </div>
        </div>
      </div>

      {/* Charts Grid Row 1: Esferas & Grupos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Esfera Administrativa */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                Por Esfera Administrativa
              </h3>
              <p className="text-xs text-slate-500">Distribuição entre Municipal, Estadual e Federal</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Pie
                  data={esferaData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  activeIndex={activeEsferaIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveEsferaIndex(index)}
                  onMouseLeave={() => setActiveEsferaIndex(undefined)}
                  labelLine={false}
                  label={({ percent }) => (percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                >
                  {esferaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS_ESFERA[index % COLORS_ESFERA.length]}
                      className="cursor-pointer transition-all duration-200"
                      style={{ outline: 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} UCs (${item.payload.area_km2.toLocaleString('pt-BR')} km²) - ${((Number(value) / (stats.total || 1)) * 100).toFixed(1)}%`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            {esferaData.map((e, idx) => {
              const pct = stats.total ? Math.round((e.count / stats.total) * 100) : 0;
              const isActive = activeEsferaIndex === idx;
              return (
                <div
                  key={e.name}
                  onMouseEnter={() => setActiveEsferaIndex(idx)}
                  onMouseLeave={() => setActiveEsferaIndex(undefined)}
                  className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 scale-105 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS_ESFERA[idx % COLORS_ESFERA.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-200 font-bold text-xs truncate">
                      {e.name}
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {e.count} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">({pct}%)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{e.area_km2.toLocaleString('pt-BR')} km²</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grupo SNUC: PI vs US */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                Por Grupo do SNUC
              </h3>
              <p className="text-xs text-slate-500">Proteção Integral vs Uso Sustentável</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <Pie
                  data={grupoData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  activeIndex={activeGrupoIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={(_, index) => setActiveGrupoIndex(index)}
                  onMouseLeave={() => setActiveGrupoIndex(undefined)}
                  labelLine={false}
                  label={({ percent }) => (percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                >
                  {grupoData.map((entry, index) => (
                    <Cell
                      key={`cell-grp-${index}`}
                      fill={COLORS_GRUPO[index % COLORS_GRUPO.length]}
                      className="cursor-pointer transition-all duration-200"
                      style={{ outline: 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} UCs (${item.payload.area_km2.toLocaleString('pt-BR')} km²) - ${((Number(value) / (stats.total || 1)) * 100).toFixed(1)}%`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
            {grupoData.map((g, idx) => {
              const pct = stats.total ? Math.round((g.count / stats.total) * 100) : 0;
              const isActive = activeGrupoIndex === idx;
              return (
                <div
                  key={g.name}
                  onMouseEnter={() => setActiveGrupoIndex(idx)}
                  onMouseLeave={() => setActiveGrupoIndex(undefined)}
                  className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 scale-105 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS_GRUPO[idx % COLORS_GRUPO.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-200 font-bold text-xs truncate">
                      {g.name}
                    </span>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {g.count} <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">({pct}%)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{g.area_km2.toLocaleString('pt-BR')} km²</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evolução Histórica / Linha do Tempo */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Criação de UCs por Década
              </h3>
              <p className="text-xs text-slate-500">Histórico de instituição legal em SC</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDecada" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="decada" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={35} />
                <Tooltip />
                <Area type="monotone" dataKey="ucs" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDecada)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
            Forte expansão registrada a partir dos anos 2000 (Lei do SNUC nº 9.985/2000)
          </div>
        </div>
      </div>

      {/* Categorias Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Principais Categorias de Manejo em Santa Catarina
            </h3>
            <p className="text-xs text-slate-500">Número de unidades por tipologia do SNUC</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoriaData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={270} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  `${val} unidades (${item.payload.area_ha.toLocaleString('pt-BR')} ha)`,
                  'Total de UCs',
                ]}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
