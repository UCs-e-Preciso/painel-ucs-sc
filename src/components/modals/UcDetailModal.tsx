import React from 'react';
import { useData } from '../../context/DataContext';
import {
  Trees,
  X,
  ExternalLink,
  Shield,
  Building,
  MapPin,
  Calendar,
  FileCheck,
  Users,
  FileText,
  AlertCircle,
} from 'lucide-react';

export const UcDetailModal: React.FC = () => {
  const { selectedUc, setSelectedUc } = useData();

  if (!selectedUc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedUc.esfera === 'Federal'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    : selectedUc.esfera === 'Estadual'
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}
              >
                {selectedUc.esfera}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {selectedUc.grupo}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedUc.cnuc
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {selectedUc.cnuc ? 'Cadastrada no CNUC' : 'Fora do CNUC (Pendente)'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {selectedUc.nome}
            </h3>
            {selectedUc.codigo_cnuc && (
              <p className="text-xs text-slate-400 font-mono">
                Código CNUC: {selectedUc.codigo_cnuc} • ID: {selectedUc.id}
              </p>
            )}
          </div>

          <button
            onClick={() => setSelectedUc(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Categoria</span>
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {selectedUc.categoria}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Área Protegida</span>
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {selectedUc.area_ha.toLocaleString('pt-BR')} ha
            </strong>
            <span className="text-[10px] text-slate-400 block">
              ({selectedUc.area_km2.toLocaleString('pt-BR')} km²)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ano de Criação</span>
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {selectedUc.ano_criacao || 'Não informado'}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Bioma</span>
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {selectedUc.bioma}
            </strong>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Localização & Abrangência Territorial
          </h4>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div>
              <span className="text-slate-400">Município(s) abrangido(s):</span>{' '}
              <strong className="text-slate-900 dark:text-slate-100">{selectedUc.municipios}</strong>
            </div>
            {selectedUc.mesorregiao && (
              <div>
                <span className="text-slate-400">Mesorregião de SC:</span>{' '}
                <strong className="text-slate-900 dark:text-slate-100">{selectedUc.mesorregiao}</strong>
              </div>
            )}
            {selectedUc.orgao_gestor && (
              <div>
                <span className="text-slate-400">Órgão Gestor:</span>{' '}
                <strong className="text-slate-900 dark:text-slate-100">{selectedUc.orgao_gestor}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Management & Governance Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Instrumentos de Gestão Ambiental
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Plano de Manejo */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Plano de Manejo</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedUc.plano_manejo
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {selectedUc.plano_manejo ? 'Sim / Elaborado' : 'Não Possui'}
                </span>
              </div>
              {selectedUc.plano_manejo_detalhe && (
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {selectedUc.plano_manejo_detalhe}
                </p>
              )}
              {selectedUc.link_plano_manejo && (
                <a
                  href={selectedUc.link_plano_manejo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  Acessar Plano de Manejo
                </a>
              )}
            </div>

            {/* Conselho Gestor */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Conselho Gestor</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedUc.conselho_gestor
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {selectedUc.conselho_gestor ? 'Sim / Ativo' : 'Não Possui'}
                </span>
              </div>
              {selectedUc.conselho_gestor_detalhe && (
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {selectedUc.conselho_gestor_detalhe}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Legal Acts */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600" />
            Atos Legais e Documentos
          </h4>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div>
              <span className="text-slate-400 block text-[10px]">ATO DE CRIAÇÃO:</span>
              <strong className="text-slate-900 dark:text-slate-100">
                {selectedUc.ato_criacao || 'Não localizado'}
              </strong>
            </div>

            {selectedUc.outros_atos && (
              <div>
                <span className="text-slate-400 block text-[10px]">OUTROS ATOS LEGAIS / TACs:</span>
                <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                  {selectedUc.outros_atos}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {selectedUc.link_ato_criacao && (
                <a
                  href={selectedUc.link_ato_criacao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Abrir Ato de Criação Oficial
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Observations & Field Notes */}
        {(selectedUc.observacoes || selectedUc.encaminhamentos) && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs space-y-1">
            <h5 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Observações & Encaminhamentos de Campo
            </h5>
            {selectedUc.observacoes && (
              <p className="text-amber-800 dark:text-amber-300">{selectedUc.observacoes}</p>
            )}
            {selectedUc.encaminhamentos && (
              <p className="text-amber-800 dark:text-amber-300 font-semibold mt-1">
                Encaminhamento: {selectedUc.encaminhamentos}
              </p>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedUc(null)}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
