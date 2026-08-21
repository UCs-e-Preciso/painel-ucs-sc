import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
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
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
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
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Esfera */}
            <select
              value={filters.esfera}
              onChange={(e) => setFilters((prev) => ({ ...prev, esfera: e.target.value }))}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="">Esfera: Todas</option>
              <option value="Municipal">Municipal</option>
              <option value="Estadual">Estadual</option>
              <option value="Federal">Federal</option>
            </select>

            {/* Grupo SNUC */}
            <select
              value={filters.grupo}
              onChange={(e) => setFilters((prev) => ({ ...prev, grupo: e.target.value }))}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="">Grupo: Todos</option>
              <option value="Proteção Integral">Proteção Integral</option>
              <option value="Uso Sustentável">Uso Sustentável</option>
            </select>

            {/* Status CNUC */}
            <select
              value={filters.statusCnuc}
              onChange={(e) => setFilters((prev) => ({ ...prev, statusCnuc: e.target.value }))}
              className="px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="">CNUC: Todos</option>
              <option value="sim">No CNUC (Cadastrada)</option>
              <option value="nao">Fora do CNUC (Pendente)</option>
            </select>

            {/* More Filters Toggle */}
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition whitespace-nowrap ${
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
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
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
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Categoria de Manejo
              </label>
              <select
                value={filters.categoria}
                onChange={(e) => setFilters((prev) => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Todas as Categorias</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Plano de Manejo */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Plano de Manejo
              </label>
              <select
                value={filters.planoManejo}
                onChange={(e) => setFilters((prev) => ({ ...prev, planoManejo: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Todos</option>
                <option value="sim">Possui Plano de Manejo</option>
                <option value="nao">Não Possui / Sem Info</option>
              </select>
            </div>

            {/* Conselho Gestor */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Conselho Gestor
              </label>
              <select
                value={filters.conselhoGestor}
                onChange={(e) => setFilters((prev) => ({ ...prev, conselhoGestor: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Todos</option>
                <option value="sim">Possui Conselho Gestor</option>
                <option value="nao">Não Possui / Sem Info</option>
              </select>
            </div>

            {/* Mesorregião */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Mesorregião de SC
              </label>
              <select
                value={filters.mesorregiao}
                onChange={(e) => setFilters((prev) => ({ ...prev, mesorregiao: e.target.value }))}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Todas as Mesorregiões</option>
                {mesorregioes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
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
