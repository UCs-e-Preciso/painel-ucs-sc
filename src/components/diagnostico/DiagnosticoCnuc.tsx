import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  ClipboardCheck,
  AlertTriangle,
  FileQuestion,
  PhoneCall,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Building,
} from 'lucide-react';

export const DiagnosticoCnuc: React.FC = () => {
  const { data } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'roteiro' | 'nao_snuc'>('roteiro');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const roteiroList = data?.roteiro || [];
  const naoSnucList = data?.naoSnuc || [];

  const filteredRoteiro = roteiroList.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.nome.toLowerCase().includes(q) ||
      r.municipio.toLowerCase().includes(q) ||
      (r.motivo_fora_cnuc || '').toLowerCase().includes(q)
    );
  });

  const filteredNaoSnuc = naoSnucList.filter((n) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      n.nome.toLowerCase().includes(q) ||
      n.municipio.toLowerCase().includes(q) ||
      (n.observacao || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <ClipboardCheck className="w-4 h-4" />
          Diagnóstico de Regularização Municipal
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          UCs Municipais Fora do CNUC & Diagnóstico de Campo
        </h2>
        <p className="text-amber-100/90 text-sm mt-1 max-w-3xl">
          Levantamento das Unidades de Conservação municipais catarinenses que ainda não constam
          no Cadastro Nacional (CNUC/MMA), identificação dos gargalos legais e histórico de contatos com as prefeituras.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase">UCs no Roteiro</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {roteiroList.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Mapeadas com diagnóstico de contato</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase">Não SNUC / Pendentes</span>
            <FileQuestion className="w-5 h-5 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {naoSnucList.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Áreas municipais sem enquadramento formal</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase">Principal Gargalo</span>
            <Building className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="mt-2 text-base font-extrabold text-slate-900 dark:text-white truncate">
            Limites Indefinidos
          </div>
          <p className="text-xs text-slate-500 mt-1">Ausência de georreferenciamento formal</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase">Plano de Manejo</span>
            <PhoneCall className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            &lt; 15%
          </div>
          <p className="text-xs text-slate-500 mt-1">Com instrumento de manejo aprovado</p>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveSubTab('roteiro')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
              activeSubTab === 'roteiro'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Roteiro de Regularização ({roteiroList.length})
          </button>
          <button
            onClick={() => setActiveSubTab('nao_snuc')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition ${
              activeSubTab === 'nao_snuc'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Áreas Municipais Não SNUC ({naoSnucList.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome ou cidade..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Roteiro Table */}
      {activeSubTab === 'roteiro' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Acompanhamento de UCs Municipais & Regularização CNUC
            </h3>
            <span className="text-xs text-slate-500">{filteredRoteiro.length} registros</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Nome da UC</th>
                  <th className="py-3 px-4">Município</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Ato Legal</th>
                  <th className="py-3 px-4">Por que não está no CNUC?</th>
                  <th className="py-3 px-4">Limites Definidos?</th>
                  <th className="py-3 px-4">Plano de Manejo?</th>
                  <th className="py-3 px-4">Conselho Gestor?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredRoteiro.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredRoteiro.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {item.nome}
                      </td>
                      <td className="py-3 px-4">{item.municipio}</td>
                      <td className="py-3 px-4">{item.categoria}</td>
                      <td className="py-3 px-4 text-slate-500">{item.ato_criacao || '-'}</td>
                      <td className="py-3 px-4 text-amber-700 dark:text-amber-400 font-medium">
                        {item.motivo_fora_cnuc || 'Pendente de cadastro'}
                      </td>
                      <td className="py-3 px-4">{item.limites_definidos || '-'}</td>
                      <td className="py-3 px-4">{item.plano_manejo || '-'}</td>
                      <td className="py-3 px-4">{item.conselho_gestor || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Não SNUC Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Áreas Protegidas Municipais Não Enquadradas no SNUC
            </h3>
            <span className="text-xs text-slate-500">{filteredNaoSnuc.length} registros</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Nome da Área Protegida</th>
                  <th className="py-3 px-4">Município</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Ano Criação</th>
                  <th className="py-3 px-4">Ato de Criação</th>
                  <th className="py-3 px-4">Área (ha)</th>
                  <th className="py-3 px-4">Observações & Encaminhamentos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredNaoSnuc.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 italic">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredNaoSnuc.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {item.nome}
                      </td>
                      <td className="py-3 px-4">{item.municipio}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.ano_criacao || '-'}</td>
                      <td className="py-3 px-4 text-slate-500">{item.ato_criacao || '-'}</td>
                      <td className="py-3 px-4 font-medium">
                        {item.area_ha > 0 ? `${item.area_ha.toLocaleString('pt-BR')} ha` : 'n/inf'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate" title={`${item.observacao} ${item.encaminhamentos}`}>
                        {item.observacao || item.encaminhamentos || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
