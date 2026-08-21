import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { MunicipioLegislacao } from '../../types';
import {
  Building2,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  Search,
  Shield,
  Award,
  Sparkles,
} from 'lucide-react';

export const GovernancaMunicipal: React.FC = () => {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMeso, setSelectedMeso] = useState<string>('');
  const [selectedMun, setSelectedMun] = useState<MunicipioLegislacao | null>(null);

  const municipios = data?.municipios || [];

  // Summary indicators
  const stats = useMemo(() => {
    const total = municipios.length;
    const comPlano = municipios.filter((m) => m.tem_plano_diretor).length;
    const comConselho = municipios.filter((m) => m.tem_conselho_ma).length;
    const comFundo = municipios.filter((m) => m.tem_fundo_ma).length;
    const comSecretaria = municipios.filter((m) => m.tem_fundacao_secretaria).length;
    const comPolitica = municipios.filter((m) => m.tem_politica_ambiental).length;

    return {
      total,
      comPlano,
      pctPlano: total ? Math.round((comPlano / total) * 100) : 0,
      comConselho,
      pctConselho: total ? Math.round((comConselho / total) * 100) : 0,
      comFundo,
      pctFundo: total ? Math.round((comFundo / total) * 100) : 0,
      comSecretaria,
      pctSecretaria: total ? Math.round((comSecretaria / total) * 100) : 0,
      comPolitica,
      pctPolitica: total ? Math.round((comPolitica / total) * 100) : 0,
    };
  }, [municipios]);

  const filtered = useMemo(() => {
    return municipios.filter((m) => {
      if (searchTerm && !m.municipio.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedMeso && m.mesorregiao !== selectedMeso) return false;
      return true;
    });
  }, [municipios, searchTerm, selectedMeso]);

  const mesorregioes = [
    'Oeste Catarinense',
    'Norte Catarinense',
    'Grande Florianópolis',
    'Vale do Itajaí',
    'Sul Catarinense',
    'Serrana',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <Building2 className="w-4 h-4" />
          Governança Ambiental Municipal
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Maturidade Legislativa dos 295 Municípios de SC
        </h2>
        <p className="text-blue-100/90 text-sm mt-1 max-w-3xl">
          Mapeamento da infraestrutura jurídica e institucional de todos os 295 municípios catarinenses:
          Planos Diretores, Conselhos Municipais de Meio Ambiente (COMDEMA), Fundos, Secretarias e Leis de UCs.
        </p>
      </div>

      {/* Governance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Plano Diretor</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-blue-600">{stats.comPlano}</span>
            <span className="text-xs text-slate-400">/ {stats.total}</span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{stats.pctPlano}% dos municípios</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Conselho de MA</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-600">{stats.comConselho}</span>
            <span className="text-xs text-slate-400">/ {stats.total}</span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{stats.pctConselho}% dos municípios</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Fundo de MA</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-purple-600">{stats.comFundo}</span>
            <span className="text-xs text-slate-400">/ {stats.total}</span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{stats.pctFundo}% dos municípios</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Órgão Ambiental</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-teal-600">{stats.comSecretaria}</span>
            <span className="text-xs text-slate-400">/ {stats.total}</span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{stats.pctSecretaria}% com sec/fundação</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-slate-500 uppercase">Política Ambiental</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-indigo-600">{stats.comPolitica}</span>
            <span className="text-xs text-slate-400">/ {stats.total}</span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{stats.pctPolitica}% com lei municipal</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar cidade catarinense..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedMeso}
          onChange={(e) => setSelectedMeso(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 w-full sm:w-auto"
        >
          <option value="">Todas as Mesorregiões</option>
          {mesorregioes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Municipalities Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Quadro Comparativo de Legislação e Estrutura Ambiental
          </h3>
          <span className="text-xs text-slate-500">{filtered.length} municípios listados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Município</th>
                <th className="py-3 px-4">Índice Gov.</th>
                <th className="py-3 px-4 text-center">Plano Diretor</th>
                <th className="py-3 px-4 text-center">Conselho MA</th>
                <th className="py-3 px-4 text-center">Fundo MA</th>
                <th className="py-3 px-4 text-center">Política Amb.</th>
                <th className="py-3 px-4">Órgão Ambiental</th>
                <th className="py-3 px-4">Telefone / Contato</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {m.municipio}
                    {m.mesorregiao && (
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {m.mesorregiao}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold ${
                        m.indice_governanca >= 7
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : m.indice_governanca >= 4
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {m.indice_governanca}/10
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {m.tem_plano_diretor ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {m.tem_conselho_ma ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {m.tem_fundo_ma ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {m.tem_politica_ambiental ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 inline-block" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {m.orgao_ambiental || m.secretaria_ma || m.fundacao_ma || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{m.telefone || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedMun(m)}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40 font-semibold text-[11px] transition"
                    >
                      Ver Leis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Municipality Details Modal */}
      {selectedMun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-xs uppercase font-bold text-blue-600">
                  {selectedMun.mesorregiao || 'Santa Catarina'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedMun.municipio} (SC)
                </h3>
              </div>
              <button
                onClick={() => setSelectedMun(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Índice</span>
                <strong className="text-blue-600 text-sm">{selectedMun.indice_governanca}/10</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Plano Diretor</span>
                <strong>{selectedMun.plano_diretor || 'Não tem'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Conselho MA</span>
                <strong>{selectedMun.conselho_ma || 'Não tem'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">Fundo MA</span>
                <strong>{selectedMun.fundo_ma || 'Não tem'}</strong>
              </div>
            </div>

            {/* Laws breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">Leis Ambientais Específicas:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">POLÍTICA AMBIENTAL:</span>
                  <span>{selectedMun.politica_ambiental || 'Não identificada'}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">SANEAMENTO / RECURSOS HÍDRICOS:</span>
                  <span>{selectedMun.saneamento || selectedMun.recursos_hidricos || 'Não identificada'}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">LEIS DE RPPN / PARQUES:</span>
                  <span>{selectedMun.leis_rppn || selectedMun.leis_pnm || 'Não identificada'}</span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">LEIS DE APA / REBIO:</span>
                  <span>{selectedMun.leis_apa || selectedMun.leis_rebio || 'Não identificada'}</span>
                </div>
              </div>
            </div>

            {selectedMun.observacoes && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                <strong>Observações de Contato:</strong> {selectedMun.observacoes}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMun(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
