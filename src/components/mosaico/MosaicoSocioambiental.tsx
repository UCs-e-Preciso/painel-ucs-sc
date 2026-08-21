import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Users,
  Compass,
  TreePine,
  Search,
  Shield,
  FileCheck2,
  MapPin,
} from 'lucide-react';

export const MosaicoSocioambiental: React.FC = () => {
  const { data } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'ti' | 'quilombo' | 'rppn'>('ti');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const tis = data?.terrasIndigenas || [];
  const quilombos = data?.quilombolas || [];
  const rppns = data?.rppns || [];

  const totalAreaTi = Math.round(tis.reduce((a, b) => a + b.area_ha, 0));
  const totalAreaQuilombo = Math.round(quilombos.reduce((a, b) => a + b.area_ha, 0));
  const totalAreaRppn = Math.round(rppns.reduce((a, b) => a + b.area_ha, 0));

  const filteredTis = tis.filter((t) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return t.nome.toLowerCase().includes(q) || t.localizacao.toLowerCase().includes(q);
  });

  const filteredQuilombos = quilombos.filter((qu) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return qu.comunidade.toLowerCase().includes(q) || qu.localizacao.toLowerCase().includes(q);
  });

  const filteredRppns = rppns.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return r.nome.toLowerCase().includes(q) || r.municipio.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <Users className="w-4 h-4" />
          Mosaico Socioambiental de Santa Catarina
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Terras Indígenas, Comunidades Quilombolas & RPPNs
        </h2>
        <p className="text-teal-100/90 text-sm mt-1 max-w-3xl">
          Povos e comunidades tradicionais, territórios ancestrais e conservação voluntária em terras privadas
          que compõem a matriz de preservação da Mata Atlântica em território catarinense.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TIs */}
        <div
          onClick={() => setActiveSubTab('ti')}
          className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
            activeSubTab === 'ti'
              ? 'bg-orange-50/70 border-orange-300 dark:bg-orange-950/30 dark:border-orange-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-300'
          }`}
        >
          <div className="flex justify-between items-center text-orange-600">
            <span className="text-xs font-bold uppercase tracking-wider">Terras Indígenas</span>
            <Compass className="w-5 h-5" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {tis.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-semibold">
            {totalAreaTi.toLocaleString('pt-BR')} ha protegidos
          </div>
        </div>

        {/* Quilombos */}
        <div
          onClick={() => setActiveSubTab('quilombo')}
          className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
            activeSubTab === 'quilombo'
              ? 'bg-purple-50/70 border-purple-300 dark:bg-purple-950/30 dark:border-purple-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          <div className="flex justify-between items-center text-purple-600">
            <span className="text-xs font-bold uppercase tracking-wider">Comunidades Quilombolas</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {quilombos.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-semibold">
            {totalAreaQuilombo.toLocaleString('pt-BR')} ha em processos INCRA
          </div>
        </div>

        {/* RPPNs */}
        <div
          onClick={() => setActiveSubTab('rppn')}
          className={`p-5 rounded-2xl border cursor-pointer transition shadow-sm ${
            activeSubTab === 'rppn'
              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex justify-between items-center text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider">RPPNs (Reservas Privadas)</span>
            <TreePine className="w-5 h-5" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            {rppns.length}
          </div>
          <div className="mt-1 text-xs text-slate-500 font-semibold">
            {totalAreaRppn.toLocaleString('pt-BR')} ha reconhecidos
          </div>
        </div>
      </div>

      {/* Sub Tabs + Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('ti')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'ti'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Terras Indígenas ({tis.length})
          </button>
          <button
            onClick={() => setActiveSubTab('quilombo')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'quilombo'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Quilombos ({quilombos.length})
          </button>
          <button
            onClick={() => setActiveSubTab('rppn')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeSubTab === 'rppn'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            RPPNs ({rppns.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou cidade..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table: Terras Indígenas */}
      {activeSubTab === 'ti' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Terras Indígenas em Santa Catarina (44 Áreas)
            </h3>
            <span className="text-xs text-slate-500">{filteredTis.length} listadas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Terra Indígena</th>
                  <th className="py-3 px-4">Localização / Município</th>
                  <th className="py-3 px-4">Status / Ato de Criação</th>
                  <th className="py-3 px-4">Área Declarada (ha)</th>
                  <th className="py-3 px-4">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTis.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {t.nome}
                    </td>
                    <td className="py-3 px-4">{t.localizacao}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                        {t.ato_criacao_status || 'Em estudo / sem providência'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {t.area_ha > 0 ? `${t.area_ha.toLocaleString('pt-BR')} ha` : 'n/inf'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{t.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: Quilombolas */}
      {activeSubTab === 'quilombo' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Comunidades Quilombolas em Santa Catarina (10 Áreas)
            </h3>
            <span className="text-xs text-slate-500">{filteredQuilombos.length} listadas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Comunidade</th>
                  <th className="py-3 px-4">Município / Localização</th>
                  <th className="py-3 px-4">Processo INCRA</th>
                  <th className="py-3 px-4">Área (ha)</th>
                  <th className="py-3 px-4">Edital RTID / DOU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredQuilombos.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {q.comunidade}
                    </td>
                    <td className="py-3 px-4">{q.localizacao}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{q.processo_incra || '-'}</td>
                    <td className="py-3 px-4 font-semibold">
                      {q.area_ha > 0 ? `${q.area_ha.toLocaleString('pt-BR')} ha` : 'n/inf'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{q.edital_rtid_dou || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: RPPNs */}
      {activeSubTab === 'rppn' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Reservas Particulares do Patrimônio Natural (137 RPPNs em SC)
            </h3>
            <span className="text-xs text-slate-500">{filteredRppns.length} listadas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Nome da RPPN</th>
                  <th className="py-3 px-4">Município</th>
                  <th className="py-3 px-4">Ente Federativo</th>
                  <th className="py-3 px-4">Ano</th>
                  <th className="py-3 px-4">Área (ha)</th>
                  <th className="py-3 px-4">Ato Legislativo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredRppns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {r.nome}
                    </td>
                    <td className="py-3 px-4">{r.municipio}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                        {r.ente_federativo}
                      </span>
                    </td>
                    <td className="py-3 px-4">{r.ano || '-'}</td>
                    <td className="py-3 px-4 font-semibold">
                      {r.area_ha > 0 ? `${r.area_ha.toLocaleString('pt-BR')} ha` : 'n/inf'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={r.ato_legislativo}>
                      {r.ato_legislativo || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
