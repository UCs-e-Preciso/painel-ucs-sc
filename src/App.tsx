import React from 'react';
import { useData } from './context/DataContext';
import { Header } from './components/layout/Header';
import { GlobalFilters } from './components/layout/GlobalFilters';
import { VisaoGeral } from './components/dashboard/VisaoGeral';
import { MapaInterativo } from './components/map/MapaInterativo';
import { DiagnosticoCnuc } from './components/diagnostico/DiagnosticoCnuc';
import { GovernancaMunicipal } from './components/governanca/GovernancaMunicipal';
import { MosaicoSocioambiental } from './components/mosaico/MosaicoSocioambiental';
import { ExploradorUcs } from './components/explorador/ExploradorUcs';
import { DemografiaTerritorio } from './components/demografia/DemografiaTerritorio';
import { UcDetailModal } from './components/modals/UcDetailModal';
import { ShieldCheck, RefreshCw, AlertCircle, ExternalLink, Heart } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeTab, loading, error, syncLive, data } = useData();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Carregando Painel de UCs de Santa Catarina...
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Inicializando banco de dados geoespacial e cadastral
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-red-200 dark:border-red-900 shadow-xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Falha ao carregar dados
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
          <button
            onClick={syncLive}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header />
      <GlobalFilters />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'visao-geral' && <VisaoGeral />}
        {activeTab === 'mapa-interativo' && <MapaInterativo />}
        {activeTab === 'diagnostico-cnuc' && <DiagnosticoCnuc />}
        {activeTab === 'governanca-municipal' && <GovernancaMunicipal />}
        {activeTab === 'mosaico-socioambiental' && <MosaicoSocioambiental />}
        {activeTab === 'explorador-ucs' && <ExploradorUcs />}
        {activeTab === 'demografia-territorio' && <DemografiaTerritorio />}
      </main>

      <UcDetailModal />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Painel de Unidades de Conservação de Santa Catarina
            </span>
            <p className="text-[11px] text-slate-400">
              Base de dados integrada com a planilha oficial do projeto • Referência CNUC / MMA
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <a
              href="https://cnuc.mma.gov.br/powerbi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <span>Painel CNUC/MMA Oficial</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
