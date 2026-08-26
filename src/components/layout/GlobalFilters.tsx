import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';

export const GlobalFilters: React.FC = () => {
  const { filters, setFilters, resetFilters, data, filteredUcs } = useData();
  const [expanded, setExpanded] = useState<boolean>(false);

  const activeFilterCount = [
    filters.esfera,
    filters.grupo,
    filters.categoria,
    filters.statusCnuc,
    filters.planoManejo,
    filters.conselhoGestor,
    filters.mesorregiao,
    filters.municipio,
    filters.searchQuery,
  ].filter(Boolean).length;

  const mesorregioes = [
    'Oeste Catarinense',
    'Norte Catarinense',
    'Grande Florianópolis',
    'Vale do Itajaí',
    'Sul Catarinense',
    'Serrana',
  ];

  // Get unique categories from data
  const categories = React.useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    data.ucs.forEach((u) => {
      if (u.categoria) set.add(u.categoria);
    });
    return Array.from(set).sort();
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top Row: Search + Quick Selects + Toggle */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Buscar por nome da UC, município, ato legal ou categoria..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Selects */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
            {/* Esfera */}
            <CustomSelect
              value={filters.esfera}
              onChange={(val) => setFilters((prev) => ({ ...prev, esfera: val }))}
              options={[
                { value: '', label: 'Esfera: Todas' },
                { value: 'Municipal', label: 'Municipal' },
                { value: 'Estadual', label: 'Estadual' },
                { value: 'Federal', label: 'Federal' },
              ]}
              placeholder="Esfera: Todas"
              className="min-w-[130px]"
            />

            {/* Grupo SNUC */}
            <CustomSelect
              value={filters.grupo}
              onChange={(val) => setFilters((prev) => ({ ...prev, grupo: val }))}
              options={[
                { value: '', label: 'Grupo: Todos' },
                { value: 'Proteção Integral', label: 'Proteção Integral' },
                { value: 'Uso Sustentável', label: 'Uso Sustentável' },
              ]}
              placeholder="Grupo: Todos"
              className="min-w-[140px]"
            />

            {/* Status CNUC */}
            <CustomSelect
              value={filters.statusCnuc}
              onChange={(val) => setFilters((prev) => ({ ...prev, statusCnuc: val }))}
              options={[
                { value: '', label: 'CNUC: Todos' },
                { value: 'sim', label: 'No CNUC (Cadastrada)' },
                { value: 'nao', label: 'Fora do CNUC (Pendente)' },
              ]}
              placeholder="CNUC: Todos"
              className="min-w-[140px]"
            />

            {/* More Filters Toggle */}
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition whitespace-nowrap ${
                expanded || activeFilterCount > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                title="Limpar todos os filtros"
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {expanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
            {/* Categoria */}
            <CustomSelect
              label="Categoria de Manejo"
              value={filters.categoria}
              onChange={(val) => setFilters((prev) => ({ ...prev, categoria: val }))}
              options={[
                { value: '', label: 'Todas as Categorias' },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
              placeholder="Todas as Categorias"
            />

            {/* Plano de Manejo */}
            <CustomSelect
              label="Plano de Manejo"
              value={filters.planoManejo}
              onChange={(val) => setFilters((prev) => ({ ...prev, planoManejo: val }))}
              options={[
                { value: '', label: 'Todos' },
                { value: 'sim', label: 'Possui Plano de Manejo' },
                { value: 'nao', label: 'Não Possui / Sem Info' },
              ]}
              placeholder="Todos"
            />

            {/* Conselho Gestor */}
            <CustomSelect
              label="Conselho Gestor"
              value={filters.conselhoGestor}
              onChange={(val) => setFilters((prev) => ({ ...prev, conselhoGestor: val }))}
              options={[
                { value: '', label: 'Todos' },
                { value: 'sim', label: 'Possui Conselho Gestor' },
                { value: 'nao', label: 'Não Possui / Sem Info' },
              ]}
              placeholder="Todos"
            />

            {/* Mesorregião */}
            <CustomSelect
              label="Mesorregião de SC"
              value={filters.mesorregiao}
              onChange={(val) => setFilters((prev) => ({ ...prev, mesorregiao: val }))}
              options={[
                { value: '', label: 'Todas as Mesorregiões' },
                ...mesorregioes.map((m) => ({ value: m, label: m })),
              ]}
              placeholder="Todas as Mesorregiões"
            />
          </div>
        )}

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between mt-2 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
          <span>
            Exibindo <strong className="text-emerald-700 dark:text-emerald-400">{filteredUcs.length}</strong> de{' '}
            {data?.ucs.length || 0} Unidades de Conservação filtradas
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline"
            >
              Limpar Filtros ({activeFilterCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
