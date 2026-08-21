import React from 'react';
import { useData } from '../../context/DataContext';
import { ActiveTab } from '../../types';
import { GOOGLE_SHEETS_URL } from '../../services/dataService';
import {
  Trees,
  Map,
  ClipboardCheck,
  Building2,
  Users,
  Search,
  PieChart,
  RefreshCw,
  ExternalLink,
  Sun,
  Moon,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    data,
    syncing,
    syncLive,
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
  } = useData();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'visao-geral', label: 'Visão Geral', icon: <Trees className="w-4 h-4" /> },
    { id: 'mapa-interativo', label: 'Mapa Interativo', icon: <Map className="w-4 h-4" /> },
    { id: 'diagnostico-cnuc', label: 'Diagnóstico CNUC', icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'governanca-municipal', label: 'Legislação Municipal', icon: <Building2 className="w-4 h-4" /> },
    { id: 'mosaico-socioambiental', label: 'Mosaico Socioambiental', icon: <Users className="w-4 h-4" /> },
    { id: 'explorador-ucs', label: 'Explorador de UCs', icon: <Search className="w-4 h-4" /> },
    { id: 'demografia-territorio', label: 'Demografia & Território', icon: <PieChart className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Painel de UCs de Santa Catarina
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  SC • SNUC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Cadastro e Governança de Unidades de Conservação e Áreas Protegidas • Inspiração CNUC/MMA
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sync Status Badge */}
            <div className="hidden md:flex flex-col items-end text-xs mr-2">
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">Origem dos Dados:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {data?.source === 'online-sync'
                  ? 'Google Sheets (Ao Vivo)'
                  : data?.source === 'custom-upload'
                  ? 'Planilha Customizada'
                  : 'Google Sheets (Cache)'}
              </span>
            </div>

            {/* Sync Live Button */}
            <button
              onClick={syncLive}
              disabled={syncing}
              title="Sincronizar com a planilha oficial do Google Sheets"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar Dados'}
            </button>

            {/* Google Sheets Link */}
            <a
              href={GOOGLE_SHEETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir planilha original no Google Docs"
              className="inline-flex items-center p-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition"
              title={darkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
