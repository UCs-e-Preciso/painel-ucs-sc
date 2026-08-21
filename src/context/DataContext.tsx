import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UC,
  RoteiroItem,
  NaoSNUCItem,
  MunicipioLegislacao,
  RPPN,
  TerraIndigena,
  Quilombola,
  LegislacaoEstadual,
  PopulacaoMesorregiao,
  SummaryData,
  FilterState,
  ActiveTab,
} from '../types';
import { loadInitialData, syncDataFromGoogleSheets, parseXlsxBuffer, AppData } from '../services/dataService';

interface DataContextType {
  data: AppData | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  filteredUcs: UC[];
  filteredMunicipios: MunicipioLegislacao[];
  filteredRppns: RPPN[];
  filteredTerrasIndigenas: TerraIndigena[];
  filteredQuilombolas: Quilombola[];
  selectedUc: UC | null;
  setSelectedUc: (uc: UC | null) => void;
  selectedMunicipio: MunicipioLegislacao | null;
  setSelectedMunicipio: (mun: MunicipioLegislacao | null) => void;
  syncLive: () => Promise<void>;
  handleFileUpload: (file: File) => Promise<void>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const initialFilters: FilterState = {
  searchQuery: '',
  esfera: '',
  grupo: '',
  categoria: '',
  statusCnuc: '',
  planoManejo: '',
  conselhoGestor: '',
  mesorregiao: '',
  municipio: '',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('visao-geral');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedUc, setSelectedUc] = useState<UC | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioLegislacao | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const appData = await loadInitialData();
        setData(appData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const syncLive = async () => {
    if (!data) return;
    try {
      setSyncing(true);
      const updated = await syncDataFromGoogleSheets(data);
      setData(updated);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setSyncing(true);
      const buffer = await file.arrayBuffer();
      const updated = parseXlsxBuffer(buffer, 'custom-upload', data?.geoJsonSc);
      setData(updated);
    } catch (err: any) {
      alert('Erro ao processar arquivo: ' + (err.message || 'Formato inválido'));
    } finally {
      setSyncing(false);
    }
  };

  const resetFilters = () => setFilters(initialFilters);

  // Filtered UCs
  const filteredUcs = useMemo(() => {
    if (!data) return [];
    return data.ucs.filter((uc) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = uc.nome.toLowerCase().includes(q);
        const matchMun = uc.municipios.toLowerCase().includes(q);
        const matchCat = uc.categoria.toLowerCase().includes(q);
        const matchAto = (uc.ato_criacao || '').toLowerCase().includes(q);
        if (!matchName && !matchMun && !matchCat && !matchAto) return false;
      }
      if (filters.esfera && uc.esfera !== filters.esfera) return false;
      if (filters.grupo && uc.grupo !== filters.grupo) return false;
      if (filters.categoria && uc.categoria !== filters.categoria) return false;
      if (filters.statusCnuc) {
        const isCnuc = filters.statusCnuc === 'sim';
        if (uc.cnuc !== isCnuc) return false;
      }
      if (filters.planoManejo) {
        const hasPm = filters.planoManejo === 'sim';
        if (uc.plano_manejo !== hasPm) return false;
      }
      if (filters.conselhoGestor) {
        const hasCg = filters.conselhoGestor === 'sim';
        if (uc.conselho_gestor !== hasCg) return false;
      }
      if (filters.mesorregiao && uc.mesorregiao !== filters.mesorregiao) return false;
      if (filters.municipio && !uc.municipios.toLowerCase().includes(filters.municipio.toLowerCase())) return false;
      if (filters.anoMin && uc.ano_criacao && uc.ano_criacao < filters.anoMin) return false;
      if (filters.anoMax && uc.ano_criacao && uc.ano_criacao > filters.anoMax) return false;
      return true;
    });
  }, [data, filters]);

  // Filtered Municípios
  const filteredMunicipios = useMemo(() => {
    if (!data) return [];
    return data.municipios.filter((m) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (!m.municipio.toLowerCase().includes(q)) return false;
      }
      if (filters.mesorregiao && m.mesorregiao !== filters.mesorregiao) return false;
      return true;
    });
  }, [data, filters]);

  // Filtered RPPNs
  const filteredRppns = useMemo(() => {
    if (!data) return [];
    return data.rppns.filter((r) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (!r.nome.toLowerCase().includes(q) && !r.municipio.toLowerCase().includes(q)) return false;
      }
      if (filters.mesorregiao && r.mesorregiao !== filters.mesorregiao) return false;
      return true;
    });
  }, [data, filters]);

  // Filtered Terras Indígenas
  const filteredTerrasIndigenas = useMemo(() => {
    if (!data) return [];
    return data.terrasIndigenas.filter((t) => {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (!t.nome.toLowerCase().includes(q) && !t.localizacao.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data, filters]);

  // Filtered Quilombolas
  const filteredQuilombolas = useMemo(() => {
    if (!data) return [];
    return data.quilombolas.filter((q) => {
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!q.comunidade.toLowerCase().includes(query) && !q.localizacao.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [data, filters]);

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        syncing,
        error,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        resetFilters,
        filteredUcs,
        filteredMunicipios,
        filteredRppns,
        filteredTerrasIndigenas,
        filteredQuilombolas,
        selectedUc,
        setSelectedUc,
        selectedMunicipio,
        setSelectedMunicipio,
        syncLive,
        handleFileUpload,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
