import React from 'react';
import { useData } from '../../context/DataContext';
import {
  PieChart as PieChartIcon,
  Users,
  MapPin,
  Scale,
  FileText,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export const DemografiaTerritorio: React.FC = () => {
  const { data } = useData();

  const popList = data?.populacao || [];
  const legEst = data?.legislacaoEstadual || [];

  // Group population by mesoregion
  const mesoPopData = React.useMemo(() => {
    const map: Record<string, { total_mun: number; pop: number }> = {};
    popList.forEach((p) => {
      const m = p.mesorregiao || 'Outra';
      map[m] = map[m] || { total_mun: 0, pop: 0 };
      map[m].total_mun += p.total_municipios;
      map[m].pop += p.populacao_2022;
    });
    return Object.entries(map).map(([mesorregiao, val]) => ({
      mesorregiao,
      municipios: val.total_mun,
      populacao: val.pop,
      pop_format: (val.pop / 1000).toFixed(0) + ' mil',
    }));
  }, [popList]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <PieChartIcon className="w-4 h-4" />
          Análise Territorial & Demográfica
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          População Regional & Cobertura de Conservação
        </h2>
        <p className="text-emerald-100/90 text-sm mt-1 max-w-3xl">
          Cruzamento dos dados demográficos do Censo IBGE 2022 com a proporção de área protegida
          nas mesorregiões de Santa Catarina e arcabouço legal estadual.
        </p>
      </div>

      {/* Population by Mesoregion Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            População por Mesorregião (Censo IBGE 2022)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Número de habitantes por macrorregião de SC</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mesoPopData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <XAxis dataKey="mesorregiao" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [
                    `${Number(val).toLocaleString('pt-BR')} habitantes`,
                    'População',
                  ]}
                />
                <Bar dataKey="populacao" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Territory Facts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Scale className="w-4 h-4 text-teal-600" />
              Proporção Territorial do Estado de Santa Catarina
            </h3>
            <p className="text-xs text-slate-500 mb-4">Métricas consolidadas de conservação territorial</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span>Área Total do Estado de SC:</span>
                <strong className="text-sm">95.730 km²</strong>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex justify-between items-center text-emerald-900 dark:text-emerald-200">
                <span>Área Protegida por UCs (soma):</span>
                <strong className="text-sm">{data?.summary?.total_area_km2.toLocaleString('pt-BR')} km²</strong>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex justify-between items-center text-blue-900 dark:text-blue-200">
                <span>% de Cobertura Territorial Estadual:</span>
                <strong className="text-sm">{data?.summary?.pct_cobertura_sc}%</strong>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex justify-between items-center text-purple-900 dark:text-purple-200">
                <span>Total de Municípios Catarinenses:</span>
                <strong className="text-sm">295 cidades</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Dados cruzados: IBGE Censo Demográfico / MMA Cadastro Nacional de UCs
          </div>
        </div>
      </div>

      {/* State Legislation Section */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Legislação Estadual de Referência (Santa Catarina)
            </h3>
            <p className="text-xs text-slate-500">
              Principais leis e decretos que regulamentam o Código Ambiental e o Sistema Estadual de UCs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {legEst.map((l) => (
            <div
              key={l.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1"
            >
              <div className="flex justify-between items-center font-bold text-slate-900 dark:text-slate-100">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px]">
                  {l.tipo} {l.numero} / {l.ano}
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed pt-1">
                {l.ementa}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
