import React from 'react';
import { useData } from '../../context/DataContext';
import { ActiveTab } from '../../types';
import {
  Trees,
  Map,
  ClipboardCheck,
  Building2,
  Users,
  Search,
  PieChart,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
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
