import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { UC } from '../../types';
import { exportToExcel, exportToCsv } from '../../services/dataService';
import {
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Eye,
  Building,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';

export const ExploradorUcs: React.FC = () => {
  const { filteredUcs, setSelectedUc } = useData();

  const [sortField, setSortField] = useState<keyof UC>('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const handleSort = (field: keyof UC) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedUcs = useMemo(() => {
    return [...filteredUcs].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        return sortDirection === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal), 'pt-BR')
        : String(bVal).localeCompare(String(aVal), 'pt-BR');
    });
  }, [filteredUcs, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedUcs.length / pageSize) || 1;
  const paginatedUcs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUcs.slice(start, start + pageSize);
  }, [sortedUcs, currentPage, pageSize]);

  const handleExportXlsx = () => {
    const exportData = filteredUcs.map((u) => ({
      'ID UC': u.id,
      'Código CNUC': u.codigo_cnuc || '',
      'Nome da UC': u.nome,
      'Esfera Administrativa': u.esfera,
      'Grupo SNUC': u.grupo,
      'Categoria de Manejo': u.categoria,
      'Cadastrada no CNUC?': u.cnuc ? 'Sim' : 'Não',
      'Ano de Criação': u.ano_criacao || '',
      'Ato Legal': u.ato_criacao || '',
      'Municípios Abrangidos': u.municipios,
      'Área (ha)': u.area_ha,
      'Área (km²)': u.area_km2,
      'Bioma': u.bioma,
      'Possui Plano de Manejo?': u.plano_manejo ? 'Sim' : 'Não',
      'Possui Conselho Gestor?': u.conselho_gestor ? 'Sim' : 'Não',
      'Órgão Gestor': u.orgao_gestor || '',
    }));
    exportToExcel(exportData, `UCs_Santa_Catarina_filtradas_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportCsv = () => {
    const exportData = filteredUcs.map((u) => ({
      'ID UC': u.id,
      'Código CNUC': u.codigo_cnuc || '',
      'Nome da UC': u.nome,
      'Esfera Administrativa': u.esfera,
      'Grupo SNUC': u.grupo,
      'Categoria de Manejo': u.categoria,
      'Cadastrada no CNUC?': u.cnuc ? 'Sim' : 'Não',
      'Ano de Criação': u.ano_criacao || '',
      'Ato Legal': u.ato_criacao || '',
      'Municípios Abrangidos': u.municipios,
      'Área (ha)': u.area_ha,
      'Área (km²)': u.area_km2,
      'Bioma': u.bioma,
      'Possui Plano de Manejo?': u.plano_manejo ? 'Sim' : 'Não',
      'Possui Conselho Gestor?': u.conselho_gestor ? 'Sim' : 'Não',
      'Órgão Gestor': u.orgao_gestor || '',
    }));
    exportToCsv(exportData, `UCs_Santa_Catarina_filtradas_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Action Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            Tabela Dinâmica de Unidades de Conservação de SC
          </h3>
          <p className="text-xs text-slate-500">
            Total de <strong>{filteredUcs.length}</strong> registros encontrados de acordo com os filtros aplicados.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportXlsx}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            Exportar Excel
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
          >
            <Download className="w-4 h-4 mr-1.5" />
            CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
              <tr>
                <th
                  onClick={() => handleSort('nome')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    Nome da UC
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('esfera')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    Esfera
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('grupo')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    Grupo
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('categoria')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    Categoria
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('municipios')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition"
                >
                  <div className="flex items-center gap-1">
                    Município(s)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('area_ha')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    Área (ha)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ano_criacao')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    Criação
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cnuc')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    CNUC
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('plano_manejo')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-600 transition text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    Plano Manejo
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedUcs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 italic">
                    Nenhuma Unidade de Conservação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedUcs.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => setSelectedUc(u)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 transition">
                        {u.nome}
                      </div>
                      {u.codigo_cnuc && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          CNUC: {u.codigo_cnuc}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.esfera === 'Federal'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            : u.esfera === 'Estadual'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {u.esfera}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        {u.grupo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                      {u.categoria}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                      {u.municipios}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {u.area_ha > 0 ? `${u.area_ha.toLocaleString('pt-BR')} ha` : 'n/inf'}
                    </td>
                    <td className="py-3 px-4 text-center font-medium">
                      {u.ano_criacao || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          u.cnuc
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {u.cnuc ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u.plano_manejo ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500 inline-block" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 inline-block" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedUc(u)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
                        title="Ver detalhes da UC"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 relative z-20">
          <div className="flex items-center gap-2">
            <span>Linhas por página:</span>
            <CustomSelect
              value={pageSize}
              direction="up"
              onChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
              options={[
                { value: 15, label: '15' },
                { value: 20, label: '20' },
                { value: 50, label: '50' },
                { value: 100, label: '100' },
              ]}
              className="w-20"
            />
            <span>
              Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
              {Math.min(currentPage * pageSize, sortedUcs.length)} de {sortedUcs.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
