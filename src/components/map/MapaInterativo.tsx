import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { UC, MunicipioLegislacao } from '../../types';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  Info,
  Trees,
  Maximize2,
  FileCheck,
  Users2,
  ExternalLink,
  ShieldCheck,
  Filter,
  MapPin,
  Compass,
  ArrowRight,
  Search,
  Building,
  CheckCircle2,
  Sparkles,
  X,
  SlidersHorizontal,
  Check,
  Layers2,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
} from 'lucide-react';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MESO_COLORS: Record<string, string> = {
  'Oeste Catarinense': '#f59e0b',
  'Grande Florianópolis': '#10b981',
  'Norte Catarinense': '#0284c7',
  'Vale do Itajaí': '#8b5cf6',
  'Sul Catarinense': '#ec4899',
  'Serrana': '#16a34a',
};

const MESO_CODES: Record<string, string> = {
  '4201': 'Oeste Catarinense',
  '4202': 'Norte Catarinense',
  '4203': 'Serrana',
  '4204': 'Vale do Itajaí',
  '4205': 'Grande Florianópolis',
  '4206': 'Sul Catarinense',
};

// Map controller for animated zooming/fitting bounds
const MapController: React.FC<{ targetBounds: L.LatLngBoundsExpression | null }> = ({ targetBounds }) => {
  const map = useMap();
  useEffect(() => {
    if (targetBounds) {
      map.flyToBounds(targetBounds, { padding: [40, 40], maxZoom: 10, duration: 0.8 });
    }
  }, [targetBounds, map]);
  return null;
};

// Map click, movement and popup close listener
const MapEventsHandler: React.FC<{ onClearSelection: () => void }> = ({ onClearSelection }) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const closeAllTooltips = () => {
      map.closeTooltip();
      map.eachLayer((layer: any) => {
        if (typeof layer.closeTooltip === 'function') {
          try {
            layer.closeTooltip();
          } catch (err) {}
        }
      });
      const tooltips = container.querySelectorAll('.leaflet-tooltip');
      tooltips.forEach((t: any) => {
        try {
          t.remove();
        } catch (e) {}
      });
    };

    container.addEventListener('mousedown', closeAllTooltips, true);
    container.addEventListener('dragstart', closeAllTooltips, true);
    container.addEventListener('touchstart', closeAllTooltips, { capture: true, passive: true });

    return () => {
      container.removeEventListener('mousedown', closeAllTooltips, true);
      container.removeEventListener('dragstart', closeAllTooltips, true);
      container.removeEventListener('touchstart', closeAllTooltips, true);
    };
  }, [map]);

  useMapEvents({
    movestart: () => {
      map.closeTooltip();
      map.eachLayer((layer: any) => {
        if (typeof layer.closeTooltip === 'function') {
          try {
            layer.closeTooltip();
          } catch (err) {}
        }
      });
    },
    dragstart: () => {
      map.closeTooltip();
      map.eachLayer((layer: any) => {
        if (typeof layer.closeTooltip === 'function') {
          try {
            layer.closeTooltip();
          } catch (err) {}
        }
      });
    },
    zoomstart: () => {
      map.closeTooltip();
    },
    mousedown: () => {
      map.closeTooltip();
    },
    click: () => {
      map.closeTooltip();
      onClearSelection();
    },
    popupclose: () => {
      onClearSelection();
    },
  });
  return null;
};

export const MapaInterativo: React.FC = () => {
  const {
    filteredUcs,
    filteredRppns,
    filteredTerrasIndigenas,
    filteredQuilombolas,
    data,
    selectedUc,
    setSelectedUc,
    filters,
    setFilters,
    resetFilters,
    setActiveTab,
    darkMode,
  } = useData();

  const [colorMode, setColorMode] = useState<'territorio' | 'esfera' | 'grupo' | 'cnuc'>('territorio');
  const [selectedTerritorio, setSelectedTerritorio] = useState<string>('');
  const [hoveredTerritorio, setHoveredTerritorio] = useState<string>('');
  const [hoveredMunName, setHoveredMunName] = useState<string>('');

  // Granular layer toggles
  const [showFederal, setShowFederal] = useState<boolean>(true);
  const [showEstadual, setShowEstadual] = useState<boolean>(true);
  const [showMunicipal, setShowMunicipal] = useState<boolean>(true);
  const [showProtecaoIntegral, setShowProtecaoIntegral] = useState<boolean>(true);
  const [showUsoSustentavel, setShowUsoSustentavel] = useState<boolean>(true);
  const [showCnucCadastradas, setShowCnucCadastradas] = useState<boolean>(true);
  const [showCnucPendentes, setShowCnucPendentes] = useState<boolean>(true);
  const [showRppns, setShowRppns] = useState<boolean>(true);
  const [showTis, setShowTis] = useState<boolean>(true);
  const [showQuilombos, setShowQuilombos] = useState<boolean>(true);
  const [showChoropleth, setShowChoropleth] = useState<boolean>(true);
  const [showMesoLayer, setShowMesoLayer] = useState<boolean>(true);
  const [showLayersDrawer, setShowLayersDrawer] = useState<boolean>(true);

  const [selectedMunInfo, setSelectedMunInfo] = useState<any | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mapTargetBounds, setMapTargetBounds] = useState<L.LatLngBoundsExpression | null>(null);

  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const mesoLayerRef = useRef<L.GeoJSON | null>(null);

  // UCs with coordinates after applying all filters and layer toggles
  const ucsWithCoords = useMemo(() => {
    return filteredUcs.filter((u) => {
      if (!u.lat || !u.lng) return false;
      if (selectedTerritorio && u.mesorregiao !== selectedTerritorio) return false;
      if (!showFederal && u.esfera === 'Federal') return false;
      if (!showEstadual && u.esfera === 'Estadual') return false;
      if (!showMunicipal && u.esfera === 'Municipal') return false;
      if (!showProtecaoIntegral && u.grupo === 'Proteção Integral') return false;
      if (!showUsoSustentavel && u.grupo === 'Uso Sustentável') return false;
      if (!showCnucCadastradas && u.cnuc) return false;
      if (!showCnucPendentes && !u.cnuc) return false;
      return true;
    });
  }, [
    filteredUcs,
    selectedTerritorio,
    showFederal,
    showEstadual,
    showMunicipal,
    showProtecaoIntegral,
    showUsoSustentavel,
    showCnucCadastradas,
    showCnucPendentes,
  ]);

  // Dynamic UCs count per municipality based on active filtered UCs
  const ucsCountByMun = useMemo(() => {
    const map: Record<string, number> = {};
    ucsWithCoords.forEach((u) => {
      const m = u.municipio_principal || u.municipios;
      if (m) {
        m.split(',').forEach((city) => {
          const clean = city.trim().toLowerCase();
          if (clean) {
            map[clean] = (map[clean] || 0) + 1;
          }
        });
      }
    });
    return map;
  }, [ucsWithCoords]);

  // Layer statistics counts
  const layerStats = useMemo(() => {
    const totalUcs = data?.ucs.length || 0;
    const fed = data?.ucs.filter((u) => u.esfera === 'Federal').length || 0;
    const est = data?.ucs.filter((u) => u.esfera === 'Estadual').length || 0;
    const mun = data?.ucs.filter((u) => u.esfera === 'Municipal').length || 0;
    const pi = data?.ucs.filter((u) => u.grupo === 'Proteção Integral').length || 0;
    const us = data?.ucs.filter((u) => u.grupo === 'Uso Sustentável').length || 0;
    const cnucYes = data?.ucs.filter((u) => u.cnuc).length || 0;
    const cnucNo = data?.ucs.filter((u) => !u.cnuc).length || 0;
    const rppns = filteredRppns.filter((r) => r.lat && r.lng).length;
    const tis = filteredTerrasIndigenas.filter((t) => t.lat && t.lng).length;
    const quilombos = filteredQuilombolas.filter((q) => q.lat && q.lng).length;

    return { totalUcs, fed, est, mun, pi, us, cnucYes, cnucNo, rppns, tis, quilombos };
  }, [data, filteredRppns, filteredTerrasIndigenas, filteredQuilombolas]);

  // Lookup map: municipality code/name -> mesorregiao
  const munToMesoMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!data?.municipios) return map;
    data.municipios.forEach((m) => {
      if (m.mesorregiao) {
        map[m.id] = m.mesorregiao;
        map[m.municipio.toLowerCase()] = m.mesorregiao;
      }
    });
    return map;
  }, [data]);

  // Auto-focus map if search query matches a municipality
  useEffect(() => {
    if (filters.searchQuery && data?.geoJsonSc) {
      const q = filters.searchQuery.toLowerCase().trim();
      if (q.length >= 3) {
        const matched = data.geoJsonSc.features?.find(
          (f: any) => f.properties?.nome?.toLowerCase() === q || f.properties?.nome?.toLowerCase().startsWith(q)
        );
        if (matched && geoJsonLayerRef.current) {
          geoJsonLayerRef.current.eachLayer((l: any) => {
            if (l.feature?.properties?.nome?.toLowerCase() === matched.properties?.nome?.toLowerCase()) {
              if (typeof l.getBounds === 'function') {
                setMapTargetBounds(l.getBounds());
              }
            }
          });
        }
      }
    }
  }, [filters.searchQuery, data]);

  const getColorByUc = (u: UC): string => {
    if (colorMode === 'territorio') {
      return MESO_COLORS[u.mesorregiao || ''] || '#10b981';
    }
    if (colorMode === 'esfera') {
      if (u.esfera === 'Federal') return '#8b5cf6';
      if (u.esfera === 'Estadual') return '#0284c7';
      return '#10b981';
    }
    if (colorMode === 'grupo') {
      return u.grupo === 'Proteção Integral' ? '#059669' : '#0ea5e9';
    }
    return u.cnuc ? '#10b981' : '#f59e0b';
  };

  // Base styling for each municipality polygon
  const getMunStyle = (feature: any) => {
    const meso = feature?.properties?.mesorregiao || '';
    const name = feature?.properties?.nome || '';

    const isMesoSelected = !selectedTerritorio || meso === selectedTerritorio;
    const isMesoHovered = hoveredTerritorio && meso === hoveredTerritorio;

    if (colorMode === 'territorio') {
      const mesoColor = MESO_COLORS[meso] || '#94a3b8';
      return {
        fillColor: mesoColor,
        weight: isMesoHovered ? 2.5 : isMesoSelected ? 1.2 : 0.6,
        opacity: isMesoHovered ? 1 : isMesoSelected ? 0.85 : 0.25,
        color: isMesoHovered ? '#ffffff' : darkMode ? '#1e293b' : '#ffffff',
        fillOpacity: isMesoHovered ? 0.75 : isMesoSelected ? 0.42 : 0.08,
        className: 'sc-municipality-polygon',
      };
    }

    if (!showChoropleth) {
      return {
        fillColor: '#94a3b8',
        weight: isMesoHovered ? 2.5 : 1,
        opacity: 0.8,
        color: isMesoHovered ? '#10b981' : darkMode ? '#334155' : '#cbd5e1',
        fillOpacity: isMesoHovered ? 0.6 : 0.15,
        className: 'sc-municipality-polygon',
      };
    }

    // Count of UCs in this municipality
    const count = ucsCountByMun[name.toLowerCase()] || 0;

    let fillColor = '#f8fafc';
    if (count > 5) fillColor = '#047857';
    else if (count >= 3) fillColor = '#10b981';
    else if (count >= 1) fillColor = '#6ee7b7';
    else fillColor = darkMode ? '#1e293b' : '#f1f5f9';

    return {
      fillColor,
      weight: isMesoHovered ? 2.5 : 1,
      opacity: 0.8,
      color: isMesoHovered ? '#10b981' : darkMode ? '#334155' : '#cbd5e1',
      fillOpacity: isMesoHovered ? 0.85 : count > 0 ? 0.65 : 0.2,
      className: 'sc-municipality-polygon',
    };
  };

  const currentHoveredLayerRef = useRef<any>(null);

  // Dynamically update styles without re-creating the entire GeoJSON layer (avoids flickering)
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((layer: any) => {
        if (layer.feature && layer !== currentHoveredLayerRef.current) {
          layer.setStyle(getMunStyle(layer.feature));
        }
      });
    }
  }, [colorMode, selectedTerritorio, hoveredTerritorio, darkMode, showChoropleth, ucsCountByMun]);

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const cod = feature?.properties?.code || feature?.properties?.codarea;
    const name = feature?.properties?.nome || `Município (${cod})`;
    const meso = feature?.properties?.mesorregiao || 'Santa Catarina';
    const mun = data?.municipios?.find(
      (m) => m.municipio.toLowerCase() === name.toLowerCase() || m.id === cod
    );
    const ucsCount = ucsCountByMun[name.toLowerCase()] || 0;
    const mesoColor = MESO_COLORS[meso] || '#10b981';

    // Rich floating tooltip attached to polygon
    (layer as L.Path).bindTooltip(
      `
      <div style="font-family: inherit; min-width: 150px; padding: 2px;">
        <div style="font-weight: 800; font-size: 13px; color: ${darkMode ? '#f8fafc' : '#0f172a'}; margin-bottom: 2px;">
          ${name}
        </div>
        <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: ${mesoColor}; margin-bottom: 5px;">
          <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: ${mesoColor};"></span>
          ${meso}
        </div>
        <div style="font-size: 11px; color: ${darkMode ? '#cbd5e1' : '#334155'}; border-top: 1px solid ${darkMode ? '#334155' : '#e2e8f0'}; padding-top: 4px; display: flex; justify-content: space-between;">
          <span>Unidades de Conservação:</span>
          <strong style="color: #10b981; margin-left: 8px;">${ucsCount}</strong>
        </div>
        ${mun?.indice_governanca !== undefined ? `
        <div style="font-size: 11px; color: ${darkMode ? '#cbd5e1' : '#334155'}; display: flex; justify-content: space-between; margin-top: 2px;">
          <span>Índice Governança:</span>
          <strong style="color: #0284c7; margin-left: 8px;">${mun.indice_governanca}/10</strong>
        </div>` : ''}
      </div>
      `,
      {
        sticky: true,
        direction: 'top',
        opacity: 0.98,
        className: 'custom-leaflet-tooltip',
      }
    );

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        if (currentHoveredLayerRef.current && currentHoveredLayerRef.current !== l) {
          try {
            currentHoveredLayerRef.current.setStyle(getMunStyle(currentHoveredLayerRef.current.feature));
            currentHoveredLayerRef.current.closeTooltip();
          } catch (err) {}
        }
        currentHoveredLayerRef.current = l;
        l.setStyle({
          weight: 3,
          color: '#fbbf24', // bright golden highlight
          fillOpacity: 0.85,
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        try {
          l.closeTooltip();
        } catch (err) {}
        if (currentHoveredLayerRef.current === l) {
          l.setStyle(getMunStyle(feature));
          currentHoveredLayerRef.current = null;
        }
      },
      mousedown: (e: any) => {
        const l = e.target;
        try {
          l.closeTooltip();
        } catch (err) {}
      },
      click: (e: any) => {
        const l = e.target;
        try {
          l.closeTooltip();
        } catch (err) {}
        if (typeof l.getBounds === 'function') {
          setMapTargetBounds(l.getBounds());
        }
        setSelectedMarkerId(null);
        setSelectedUc(null);
        setSelectedMunInfo({
          code: cod,
          name,
          mesorregiao: meso,
          mun,
          ucsInMun: data?.ucs.filter((u) => u.municipios.toLowerCase().includes(name.toLowerCase())) || [],
        });
      },
    });
  };

  // Mesorregioes layer style
  const getMesoOutlineStyle = (feature: any) => {
    const code = feature?.properties?.codarea;
    const name = feature?.properties?.nome || MESO_CODES[code] || '';
    const color = MESO_COLORS[name] || '#10b981';
    const isHovered = hoveredTerritorio && hoveredTerritorio === name;
    const isSelected = selectedTerritorio && selectedTerritorio === name;

    return {
      fillColor: color,
      weight: isHovered || isSelected ? 3.5 : 2,
      opacity: isHovered || isSelected ? 1 : 0.7,
      color: color,
      fillOpacity: isHovered ? 0.2 : 0.03,
      dashArray: isHovered || isSelected ? undefined : '5, 5',
    };
  };

  // Territory stats summary
  const territorioSummary = useMemo(() => {
    if (!data) return [];
    const map: Record<string, { ucs: number; area: number; munCount: number }> = {};
    Object.keys(MESO_COLORS).forEach((m) => {
      map[m] = { ucs: 0, area: 0, munCount: 0 };
    });

    data.municipios.forEach((m) => {
      if (m.mesorregiao && map[m.mesorregiao]) {
        map[m.mesorregiao].munCount += 1;
      }
    });

    data.ucs.forEach((u) => {
      if (u.mesorregiao && map[u.mesorregiao]) {
        map[u.mesorregiao].ucs += 1;
        map[u.mesorregiao].area += u.area_ha;
      }
    });

    return Object.entries(map).map(([nome, val]) => ({
      nome,
      ucs: val.ucs,
      area_km2: Math.round(val.area / 100),
      munCount: val.munCount,
      color: MESO_COLORS[nome],
    }));
  }, [data]);

  const handleFilterByCity = (cityName: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: cityName }));
    setActiveTab('explorador-ucs');
  };

  const handleClearMarkerSelection = () => {
    setSelectedMarkerId(null);
    setSelectedUc(null);
  };

  const handleSelectTerritorio = (nome: string) => {
    setSelectedMarkerId(null);
    setSelectedUc(null);
    if (selectedTerritorio === nome) {
      setSelectedTerritorio('');
      setMapTargetBounds([[-29.4, -53.9], [-25.9, -48.3]]);
    } else {
      setSelectedTerritorio(nome);
      // Zoom into selected territory
      if (data?.geoJsonMesorregioes && mesoLayerRef.current) {
        mesoLayerRef.current.eachLayer((l: any) => {
          if (l.feature?.properties?.nome === nome && typeof l.getBounds === 'function') {
            setMapTargetBounds(l.getBounds());
          }
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Territórios / Mesorregiões Quick Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Territórios & Mesorregiões de Santa Catarina</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Interativo
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Passe o mouse sobre um território para iluminar todos os seus municípios no mapa ou clique para aproximar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hoveredMunName && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-xs animate-fadeIn">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>{hoveredMunName}</span>
              </div>
            )}

            {selectedTerritorio && (
              <button
                onClick={() => handleSelectTerritorio(selectedTerritorio)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 transition"
              >
                ✕ Limpar Filtro ({selectedTerritorio})
              </button>
            )}
          </div>
        </div>

        {/* 6 Territory Interactive Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {territorioSummary.map((t) => {
            const isSelected = selectedTerritorio === t.nome;
            const isHovered = hoveredTerritorio === t.nome;
            return (
              <button
                key={t.nome}
                onClick={() => handleSelectTerritorio(t.nome)}
                onMouseEnter={() => setHoveredTerritorio(t.nome)}
                onMouseLeave={() => setHoveredTerritorio('')}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400'
                    : isHovered
                    ? 'shadow-md border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 -translate-y-0.5'
                    : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0 transition-transform group-hover:scale-125 shadow-xs"
                    style={{ backgroundColor: t.color }}
                  ></span>
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {t.nome}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>{t.ucs} UCs</span>
                  <span>{t.munCount} Cidades</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Search & Quick Filter Bar on Map */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Buscar UC por nome, município, categoria ou ato no mapa..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Select Filter Badges & Toggle Layers Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowLayersDrawer(!showLayersDrawer)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                showLayersDrawer
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
              title={showLayersDrawer ? 'Recolher quadro de seleção de camadas' : 'Expandir quadro de seleção de camadas'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showLayersDrawer ? 'Recolher Opções de Camadas' : 'Abrir Opções de Camadas'}</span>
              {showLayersDrawer ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            {(filters.searchQuery || filters.esfera || filters.grupo || filters.statusCnuc || selectedTerritorio) && (
              <button
                onClick={() => {
                  resetFilters();
                  setSelectedTerritorio('');
                  setShowFederal(true);
                  setShowEstadual(true);
                  setShowMunicipal(true);
                  setShowProtecaoIntegral(true);
                  setShowUsoSustentavel(true);
                  setShowCnucCadastradas(true);
                  setShowCnucPendentes(true);
                  setShowRppns(true);
                  setShowTis(true);
                  setShowQuilombos(true);
                  setMapTargetBounds([[-29.4, -53.9], [-25.9, -48.3]]);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 transition shadow-xs cursor-pointer"
                title="Limpar todos os filtros e restaurar mapa"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Restaurar</span>
              </button>
            )}
          </div>
        </div>

        {/* Counter of active matching UCs and color selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Exibindo <strong className="text-emerald-600 dark:text-emerald-400">{ucsWithCoords.length}</strong> de {data?.ucs.length || 0} UCs georreferenciadas
            </span>
            {selectedTerritorio && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                {selectedTerritorio}
              </span>
            )}
            {filters.searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold text-[10px]">
                Busca: "{filters.searchQuery}"
              </span>
            )}
          </div>

          {/* Marker Color Mode Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Cor:</span>
            {(['territorio', 'esfera', 'grupo', 'cnuc'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                className={`px-2 py-0.5 rounded text-[11px] capitalize font-medium transition ${
                  colorMode === mode
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {mode === 'cnuc' ? 'CNUC' : mode === 'territorio' ? 'Território' : mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Multi-Layer Toggle Drawer */}
      {showLayersDrawer && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Camadas e Filtros do Mapa
                </h4>
                <p className="text-[11px] text-slate-500">
                  Marque ou desmarque para personalizar quais pontos e dados aparecem no mapa
                </p>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => {
                  setShowFederal(true);
                  setShowEstadual(true);
                  setShowMunicipal(true);
                  setShowProtecaoIntegral(true);
                  setShowUsoSustentavel(true);
                  setShowCnucCadastradas(true);
                  setShowCnucPendentes(true);
                  setShowRppns(true);
                  setShowTis(true);
                  setShowQuilombos(true);
                  setShowChoropleth(true);
                  setShowMesoLayer(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-[11px] text-slate-700 dark:text-slate-300 transition"
              >
                ✓ Marcar Todas
              </button>

              <button
                onClick={() => {
                  setShowFederal(false);
                  setShowEstadual(false);
                  setShowMunicipal(false);
                  setShowProtecaoIntegral(false);
                  setShowUsoSustentavel(false);
                  setShowCnucCadastradas(false);
                  setShowCnucPendentes(false);
                  setShowRppns(false);
                  setShowTis(false);
                  setShowQuilombos(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-[11px] text-slate-700 dark:text-slate-300 transition"
              >
                ✕ Desmarcar Todas
              </button>

              <button
                onClick={() => {
                  setShowFederal(true);
                  setShowEstadual(true);
                  setShowMunicipal(true);
                  setShowProtecaoIntegral(true);
                  setShowUsoSustentavel(true);
                  setShowCnucCadastradas(true);
                  setShowCnucPendentes(true);
                  setShowRppns(false);
                  setShowTis(false);
                  setShowQuilombos(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] transition"
              >
                Apenas UCs
              </button>

              <button
                onClick={() => {
                  setShowFederal(false);
                  setShowEstadual(false);
                  setShowMunicipal(false);
                  setShowRppns(true);
                  setShowTis(true);
                  setShowQuilombos(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold text-[11px] transition"
              >
                Apenas Socioambiental
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Column 1: Esferas */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between text-[11px] uppercase tracking-wider">
                <span>Esfera da UC</span>
                <span className="text-slate-400 font-normal text-[10px]">({layerStats.fed + layerStats.est + layerStats.mun})</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showFederal}
                      onChange={(e) => setShowFederal(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                      Federal
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {layerStats.fed}
                  </span>
                </label>

                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showEstadual}
                      onChange={(e) => setShowEstadual(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                      Estadual
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {layerStats.est}
                  </span>
                </label>

                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showMunicipal}
                      onChange={(e) => setShowMunicipal(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                      Municipal
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {layerStats.mun}
                  </span>
                </label>
              </div>
            </div>

            {/* Column 2: Grupos SNUC */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between text-[11px] uppercase tracking-wider">
                <span>Grupo do SNUC</span>
                <span className="text-slate-400 font-normal text-[10px]">({layerStats.pi + layerStats.us})</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showProtecaoIntegral}
                      onChange={(e) => setShowProtecaoIntegral(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                      Proteção Integral
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {layerStats.pi}
                  </span>
                </label>

                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showUsoSustentavel}
                      onChange={(e) => setShowUsoSustentavel(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span>
                      Uso Sustentável
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                    {layerStats.us}
                  </span>
                </label>

                {/* CNUC Status Subgroup */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-1">
                  <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showCnucCadastradas}
                        onChange={(e) => setShowCnucCadastradas(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Cadastradas CNUC
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {layerStats.cnucYes}
                    </span>
                  </label>

                  <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showCnucPendentes}
                        onChange={(e) => setShowCnucPendentes(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        Pendentes / Fora
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      {layerStats.cnucNo}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Column 3: Mosaico Socioambiental */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between text-[11px] uppercase tracking-wider">
                <span>Socioambiental</span>
                <span className="text-slate-400 font-normal text-[10px]">({layerStats.rppns + layerStats.tis + layerStats.quilombos})</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showRppns}
                      onChange={(e) => setShowRppns(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></span>
                      RPPNs
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                    {layerStats.rppns}
                  </span>
                </label>

                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showTis}
                      onChange={(e) => setShowTis(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
                      Terras Indígenas
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
                    {layerStats.tis}
                  </span>
                </label>

                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showQuilombos}
                      onChange={(e) => setShowQuilombos(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span>
                      Quilombolas
                    </span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {layerStats.quilombos}
                  </span>
                </label>
              </div>
            </div>

            {/* Column 4: Cartografia & Polígonos */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between text-[11px] uppercase tracking-wider">
                <span>Cartografia Base</span>
                <span className="text-slate-400 font-normal text-[10px]">IBGE SC</span>
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showChoropleth}
                      onChange={(e) => setShowChoropleth(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Colorir Cidades por UCs
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">295 Mun.</span>
                </label>

                <label className="flex items-center justify-between gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showMesoLayer}
                      onChange={(e) => setShowMesoLayer(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Contornos Regionais
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">6 Regiões</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map + Detail Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet Map */}
        <div className="lg:col-span-3 h-[620px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md relative z-0">
          <MapContainer
            center={[-27.2423, -50.2189]}
            zoom={7}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <MapController targetBounds={mapTargetBounds} />
            <MapEventsHandler onClearSelection={handleClearMarkerSelection} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={
                darkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
              }
            />

            {/* Municipalities GeoJSON Layer */}
            {data?.geoJsonSc && (
              <GeoJSON
                key="sc-municipios-geojson-layer"
                ref={geoJsonLayerRef}
                data={data.geoJsonSc}
                style={getMunStyle}
                onEachFeature={onEachFeature}
              />
            )}

            {/* Mesorregiões Outline Layer (visual only, allows pointer events to pass through) */}
            {showMesoLayer && data?.geoJsonMesorregioes && (
              <GeoJSON
                key="sc-mesorregioes-geojson-layer"
                ref={mesoLayerRef}
                data={data.geoJsonMesorregioes}
                style={getMesoOutlineStyle}
                interactive={false}
              />
            )}

            {/* UCs Markers */}
            {ucsWithCoords.map((u) => {
              const color = getColorByUc(u);
              const isSelected = String(selectedMarkerId) === String(u.id) || (selectedUc && String(selectedUc.id) === String(u.id));
              const baseRadius = u.area_ha > 10000 ? 9 : u.area_ha > 1000 ? 7 : 5;
              const radius = isSelected ? baseRadius + 4 : baseRadius;

              return (
                <React.Fragment key={u.id}>
                  {/* Pulsing selection halo when active */}
                  {isSelected && (
                    <CircleMarker
                      center={[u.lat!, u.lng!]}
                      radius={radius + 8}
                      pane="markerPane"
                      pathOptions={{
                        fillColor: '#fbbf24',
                        fillOpacity: 0.35,
                        color: '#f59e0b',
                        weight: 2.5,
                        dashArray: '3, 3',
                        className: 'uc-selection-halo',
                      }}
                    />
                  )}

                  <CircleMarker
                    center={[u.lat!, u.lng!]}
                    radius={radius}
                    pane="markerPane"
                    pathOptions={{
                      fillColor: color,
                      color: isSelected ? '#fbbf24' : '#ffffff',
                      weight: isSelected ? 4 : 2,
                      fillOpacity: 1,
                      className: isSelected ? 'uc-selected-marker uc-marker-circle' : 'uc-marker-circle',
                    }}
                    eventHandlers={{
                      click: (e) => {
                        try { e.target.closeTooltip(); } catch (err) {}
                        setSelectedMarkerId(String(u.id));
                        setSelectedUc(u);
                      },
                      mousedown: (e) => {
                        try { e.target.closeTooltip(); } catch (err) {}
                      },
                      popupopen: (e) => {
                        try { e.target.closeTooltip(); } catch (err) {}
                        setSelectedMarkerId(String(u.id));
                        setSelectedUc(u);
                      },
                      mouseover: (e) => {
                        const m = e.target;
                        m.setRadius(radius + 4);
                        m.setStyle({
                          weight: 4,
                          color: '#ffffff',
                          fillOpacity: 1,
                        });
                        if (typeof m.bringToFront === 'function') {
                          m.bringToFront();
                        }
                      },
                      mouseout: (e) => {
                        const m = e.target;
                        try { m.closeTooltip(); } catch (err) {}
                        m.setRadius(radius);
                        m.setStyle({
                          weight: isSelected ? 4 : 2,
                          color: isSelected ? '#fbbf24' : '#ffffff',
                          fillOpacity: 1,
                        });
                      },
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -radius - 3]} opacity={0.96}>
                      <div style={{ fontFamily: 'inherit', padding: '1px' }}>
                        <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>{u.nome}</div>
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
                          {u.categoria} • {u.esfera} ({u.area_ha.toLocaleString('pt-BR')} ha)
                        </div>
                      </div>
                    </Tooltip>

                    <Popup className="custom-popup">
                      <div className="p-1 space-y-2 max-w-xs">
                        <div>
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white mb-1"
                            style={{ backgroundColor: color }}
                          >
                            {u.esfera} • {u.categoria}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{u.nome}</h4>
                          <p className="text-xs text-slate-500 font-medium">{u.municipios} (SC)</p>
                        </div>

                        <div className="text-xs space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div>Área: <strong>{u.area_ha.toLocaleString('pt-BR')} ha</strong></div>
                          <div>Grupo: <strong>{u.grupo}</strong></div>
                          <div>Status CNUC: <strong className={u.cnuc ? 'text-emerald-600' : 'text-amber-600'}>
                            {u.cnuc ? 'Cadastrada no CNUC' : 'Pendente / Não Cadastrada'}
                          </strong></div>
                        </div>

                        <div className="flex gap-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedUc(u)}
                            className="flex-1 py-1 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer text-center"
                          >
                            Ver Ficha Completa
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* RPPNs Layer Markers */}
            {showRppns &&
              filteredRppns
                ?.filter((r) => r.lat && r.lng)
                .map((r) => {
                  const isSelected = String(selectedMarkerId) === String(r.id);
                  const radius = isSelected ? 9 : 5;
                  return (
                    <React.Fragment key={r.id}>
                      {isSelected && (
                        <CircleMarker
                          center={[r.lat!, r.lng!]}
                          radius={radius + 7}
                          pane="markerPane"
                          pathOptions={{
                            fillColor: '#14b8a6',
                            fillOpacity: 0.35,
                            color: '#0d9488',
                            weight: 2.5,
                            dashArray: '3, 3',
                            className: 'uc-selection-halo',
                          }}
                        />
                      )}
                      <CircleMarker
                        center={[r.lat!, r.lng!]}
                        radius={radius}
                        pane="markerPane"
                        pathOptions={{
                          fillColor: '#14b8a6',
                          color: isSelected ? '#fbbf24' : '#ffffff',
                          weight: isSelected ? 3.5 : 1.5,
                          fillOpacity: 0.9,
                          className: isSelected ? 'uc-selected-marker rppn-marker-circle' : 'rppn-marker-circle',
                        }}
                        eventHandlers={{
                          click: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                            setSelectedMarkerId(String(r.id));
                          },
                          mousedown: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                          },
                          popupopen: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                            setSelectedMarkerId(String(r.id));
                          },
                          mouseover: (e) => {
                            const m = e.target;
                            m.setRadius(radius + 4);
                            m.setStyle({ weight: 3.5, color: '#ffffff', fillOpacity: 1 });
                            if (typeof m.bringToFront === 'function') m.bringToFront();
                          },
                          mouseout: (e) => {
                            const m = e.target;
                            try { m.closeTooltip(); } catch (err) {}
                            m.setRadius(radius);
                            m.setStyle({
                              weight: isSelected ? 3.5 : 1.5,
                              color: isSelected ? '#fbbf24' : '#ffffff',
                              fillOpacity: 0.9,
                            });
                          },
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -radius - 3]} opacity={0.96}>
                          <div style={{ fontFamily: 'inherit', padding: '1px' }}>
                            <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>{r.nome}</div>
                            <div style={{ fontSize: '10px', color: '#0d9488', fontWeight: 600 }}>
                              RPPN • {r.ente_federativo} ({r.area_ha.toLocaleString('pt-BR')} ha)
                            </div>
                          </div>
                        </Tooltip>
                        <Popup>
                          <div className="p-1 text-xs">
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              RPPN • {r.ente_federativo}
                            </span>
                            <h4 className="font-bold text-xs mt-1">{r.nome}</h4>
                            <p className="text-slate-500 text-[11px]">{r.municipio} (SC)</p>
                            <p className="text-[11px] mt-1">
                              Área: <strong>{r.area_ha.toLocaleString('pt-BR')} ha</strong>
                            </p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </React.Fragment>
                  );
                })}

            {/* Terras Indígenas Markers */}
            {showTis &&
              filteredTerrasIndigenas
                ?.filter((t) => t.lat && t.lng)
                .map((t) => {
                  const isSelected = String(selectedMarkerId) === String(t.id);
                  const radius = isSelected ? 10 : 6;
                  return (
                    <React.Fragment key={t.id}>
                      {isSelected && (
                        <CircleMarker
                          center={[t.lat!, t.lng!]}
                          radius={radius + 7}
                          pane="markerPane"
                          pathOptions={{
                            fillColor: '#f97316',
                            fillOpacity: 0.35,
                            color: '#ea580c',
                            weight: 2.5,
                            dashArray: '3, 3',
                            className: 'uc-selection-halo',
                          }}
                        />
                      )}
                      <CircleMarker
                        center={[t.lat!, t.lng!]}
                        radius={radius}
                        pane="markerPane"
                        pathOptions={{
                          fillColor: '#f97316',
                          color: isSelected ? '#fbbf24' : '#ffffff',
                          weight: isSelected ? 3.5 : 1.5,
                          fillOpacity: 0.95,
                          className: isSelected ? 'uc-selected-marker ti-marker-circle' : 'ti-marker-circle',
                        }}
                        eventHandlers={{
                          click: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                            setSelectedMarkerId(String(t.id));
                          },
                          mousedown: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                          },
                          popupopen: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                            setSelectedMarkerId(String(t.id));
                          },
                          mouseover: (e) => {
                            const m = e.target;
                            m.setRadius(radius + 4);
                            m.setStyle({ weight: 3.5, color: '#ffffff', fillOpacity: 1 });
                            if (typeof m.bringToFront === 'function') m.bringToFront();
                          },
                          mouseout: (e) => {
                            const m = e.target;
                            try { m.closeTooltip(); } catch (err) {}
                            m.setRadius(radius);
                            m.setStyle({
                              weight: isSelected ? 3.5 : 1.5,
                              color: isSelected ? '#fbbf24' : '#ffffff',
                              fillOpacity: 0.95,
                            });
                          },
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -radius - 3]} opacity={0.96}>
                          <div style={{ fontFamily: 'inherit', padding: '1px' }}>
                            <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>{t.nome}</div>
                            <div style={{ fontSize: '10px', color: '#ea580c', fontWeight: 600 }}>
                              Terra Indígena • {t.ato_criacao_status || 'Em processo'}
                            </div>
                          </div>
                        </Tooltip>
                        <Popup>
                          <div className="p-1 text-xs">
                            <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Terra Indígena
                            </span>
                            <h4 className="font-bold text-xs mt-1">{t.nome}</h4>
                            <p className="text-slate-500 text-[11px]">{t.localizacao}</p>
                            <p className="text-[11px]">
                              Status: <strong>{t.ato_criacao_status || 'Em processo'}</strong>
                            </p>
                            <p className="text-[11px]">
                              Área: <strong>{t.area_ha.toLocaleString('pt-BR')} ha</strong>
                            </p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </React.Fragment>
                  );
                })}

            {/* Quilombolas Markers */}
            {showQuilombos &&
              filteredQuilombolas
                ?.filter((q) => q.lat && q.lng)
                .map((q) => {
                  const isSelected = String(selectedMarkerId) === String(q.id);
                  const radius = isSelected ? 10 : 6;
                  return (
                    <React.Fragment key={q.id}>
                      {isSelected && (
                        <CircleMarker
                          center={[q.lat!, q.lng!]}
                          radius={radius + 7}
                          pane="markerPane"
                          pathOptions={{
                            fillColor: '#a855f7',
                            fillOpacity: 0.35,
                            color: '#9333ea',
                            weight: 2.5,
                            dashArray: '3, 3',
                            className: 'uc-selection-halo',
                          }}
                        />
                      )}
                      <CircleMarker
                        center={[q.lat!, q.lng!]}
                        radius={radius}
                        pane="markerPane"
                        pathOptions={{
                          fillColor: '#a855f7',
                          color: isSelected ? '#fbbf24' : '#ffffff',
                          weight: isSelected ? 3.5 : 1.5,
                          fillOpacity: 0.95,
                          className: isSelected ? 'uc-selected-marker quilombo-marker-circle' : 'quilombo-marker-circle',
                        }}
                        eventHandlers={{
                          click: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                            setSelectedMarkerId(String(q.id));
                          },
                          mousedown: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                          },
                          popupopen: (e) => {
                            try { e.target.closeTooltip(); } catch (err) {}
                            setSelectedMarkerId(String(q.id));
                          },
                          mouseover: (e) => {
                            const m = e.target;
                            m.setRadius(radius + 4);
                            m.setStyle({ weight: 3.5, color: '#ffffff', fillOpacity: 1 });
                            if (typeof m.bringToFront === 'function') m.bringToFront();
                          },
                          mouseout: (e) => {
                            const m = e.target;
                            try { m.closeTooltip(); } catch (err) {}
                            m.setRadius(radius);
                            m.setStyle({
                              weight: isSelected ? 3.5 : 1.5,
                              color: isSelected ? '#fbbf24' : '#ffffff',
                              fillOpacity: 0.95,
                            });
                          },
                        }}
                      >
                        <Tooltip direction="top" offset={[0, -radius - 3]} opacity={0.96}>
                          <div style={{ fontFamily: 'inherit', padding: '1px' }}>
                            <div style={{ fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>{q.comunidade}</div>
                            <div style={{ fontSize: '10px', color: '#9333ea', fontWeight: 600 }}>
                              Comunidade Quilombola ({q.area_ha.toLocaleString('pt-BR')} ha)
                            </div>
                          </div>
                        </Tooltip>
                        <Popup>
                          <div className="p-1 text-xs">
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Comunidade Quilombola
                            </span>
                            <h4 className="font-bold text-xs mt-1">{q.comunidade}</h4>
                            <p className="text-slate-500 text-[11px]">{q.localizacao}</p>
                            <p className="text-[11px] mt-1">
                              Área: <strong>{q.area_ha.toLocaleString('pt-BR')} ha</strong>
                            </p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </React.Fragment>
                  );
                })}
          </MapContainer>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-[11px] z-[1000] backdrop-blur-xs space-y-1.5 max-w-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block text-[10px] uppercase tracking-wider">
              {colorMode === 'territorio'
                ? 'Legenda: Territórios / Mesorregiões'
                : colorMode === 'esfera'
                ? 'Legenda: Esfera Administrativa'
                : colorMode === 'grupo'
                ? 'Legenda: Grupo SNUC'
                : 'Legenda: Status CNUC'}
            </span>

            {colorMode === 'territorio' ? (
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {Object.entries(MESO_COLORS).map(([nome, color]) => (
                  <div
                    key={nome}
                    onMouseEnter={() => setHoveredTerritorio(nome)}
                    onMouseLeave={() => setHoveredTerritorio('')}
                    onClick={() => handleSelectTerritorio(nome)}
                    className="flex items-center gap-1.5 cursor-pointer hover:font-bold transition"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                    <span className="truncate">{nome}</span>
                  </div>
                ))}
              </div>
            ) : colorMode === 'esfera' ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Municipal ({data?.summary?.esferas?.Municipal?.count || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                  <span>Estadual ({data?.summary?.esferas?.Estadual?.count || 0})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
                  <span>Federal ({data?.summary?.esferas?.Federal?.count || 0})</span>
                </div>
              </div>
            ) : colorMode === 'grupo' ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block"></span>
                  <span>Proteção Integral</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                  <span>Uso Sustentável</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                  <span>No CNUC (Regularizada)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                  <span>Fora do CNUC (Pendente)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Details of selected Municipality / UC */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          {selectedMunInfo ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Município Selecionado
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedMunInfo.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: MESO_COLORS[selectedMunInfo.mesorregiao] || '#10b981' }}
                  ></span>
                  Território: <strong>{selectedMunInfo.mesorregiao}</strong>
                </p>

                {/* Quick Action to Filter whole Dashboard */}
                <button
                  onClick={() => handleFilterByCity(selectedMunInfo.name)}
                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Explorar UCs de {selectedMunInfo.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Governance badge */}
              {selectedMunInfo.mun && (
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-600 dark:text-slate-400">Índice Governança:</span>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      {selectedMunInfo.mun.indice_governanca}/10
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                    <div>Plano Diretor: <strong>{selectedMunInfo.mun.tem_plano_diretor ? 'Sim' : 'Não'}</strong></div>
                    <div>Conselho MA: <strong>{selectedMunInfo.mun.tem_conselho_ma ? 'Sim' : 'Não'}</strong></div>
                    <div>Fundo MA: <strong>{selectedMunInfo.mun.tem_fundo_ma ? 'Sim' : 'Não'}</strong></div>
                    {selectedMunInfo.mun.telefone && (
                      <div>Telefone: <strong>{selectedMunInfo.mun.telefone}</strong></div>
                    )}
                  </div>
                </div>
              )}

              {/* UCs list in this municipality */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>UCs na Cidade ({selectedMunInfo.ucsInMun.length}):</span>
                </h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedMunInfo.ucsInMun.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhuma UC listada nesta cidade.</p>
                  ) : (
                    selectedMunInfo.ucsInMun.map((u: UC) => (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUc(u)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition text-xs group"
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600">
                          {u.nome}
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                          <span>{u.categoria}</span>
                          <span>{u.area_ha.toLocaleString('pt-BR')} ha</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 h-full my-auto text-slate-400">
              <Info className="w-8 h-8 text-emerald-500 opacity-60 animate-pulse" />
              <p className="text-xs leading-relaxed">
                Passe o mouse sobre qualquer <strong>cidade</strong> ou <strong>território</strong> para ver o destaque em tempo real, ou clique para dar zoom e abrir a ficha completa do município.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Malha Cartográfica: IBGE • Interação Geoespacial com Zoom Automático
          </div>
        </div>
      </div>
    </div>
  );
};
