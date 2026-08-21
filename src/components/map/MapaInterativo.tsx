import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { UC, MunicipioLegislacao } from '../../types';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  CircleMarker,
  Popup,
  useMap,
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
  'Serrana': '#15803d',
};

const MESO_CODES: Record<string, string> = {
  '4201': 'Oeste Catarinense',
  '4202': 'Norte Catarinense',
  '4203': 'Serrana',
  '4204': 'Vale do Itajaí',
  '4205': 'Grande Florianópolis',
  '4206': 'Sul Catarinense',
};

// Map controller for smooth animated zoom
const MapController: React.FC<{ targetBounds: L.LatLngBoundsExpression | null }> = ({ targetBounds }) => {
  const map = useMap();
  useEffect(() => {
    if (targetBounds) {
      map.flyToBounds(targetBounds, { padding: [50, 50], maxZoom: 10, duration: 0.8 });
    }
  }, [targetBounds, map]);
  return null;
};

export const MapaInterativo: React.FC = () => {
  const {
    filteredUcs,
    data,
    setSelectedUc,
    setFilters,
    setActiveTab,
    darkMode,
  } = useData();

  const [colorMode, setColorMode] = useState<'esfera' | 'grupo' | 'cnuc' | 'territorio'>('territorio');
  const [selectedTerritorio, setSelectedTerritorio] = useState<string>('');
  const [hoveredTerritorio, setHoveredTerritorio] = useState<string>('');
  const [hoveredMunInfo, setHoveredMunInfo] = useState<{ name: string; mesorregiao: string; ucsCount: number } | null>(null);
  const [showMesoLayer, setShowMesoLayer] = useState<boolean>(true);
  const [showRppns, setShowRppns] = useState<boolean>(true);
  const [showTis, setShowTis] = useState<boolean>(true);
  const [showQuilombos, setShowQuilombos] = useState<boolean>(true);
  const [showChoropleth, setShowChoropleth] = useState<boolean>(true);
  const [selectedMunInfo, setSelectedMunInfo] = useState<any | null>(null);
  const [mapTargetBounds, setMapTargetBounds] = useState<L.LatLngBoundsExpression | null>(null);

  const ucsWithCoords = useMemo(() => {
    return filteredUcs.filter((u) => {
      if (!u.lat || !u.lng) return false;
      if (selectedTerritorio && u.mesorregiao !== selectedTerritorio) return false;
      return true;
    });
  }, [filteredUcs, selectedTerritorio]);

  // Aggregate UCs count by municipality name
  const ucsCountByMun = useMemo(() => {
    const map: Record<string, number> = {};
    if (!data) return map;
    data.ucs.forEach((u) => {
      const m = u.municipio_principal || u.municipios;
      if (m) {
        map[m.toLowerCase()] = (map[m.toLowerCase()] || 0) + 1;
      }
    });
    return map;
  }, [data]);

  // Lookup municipality code to mesorregiao
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

  const getMunStyle = (feature: any) => {
    const cod = feature?.properties?.codarea;
    const meso = munToMesoMap[cod] || '';

    const isMesoSelected = !selectedTerritorio || meso === selectedTerritorio;
    const isMesoHovered = hoveredTerritorio && meso === hoveredTerritorio;

    if (colorMode === 'territorio') {
      const mesoColor = MESO_COLORS[meso] || '#94a3b8';
      return {
        fillColor: mesoColor,
        weight: isMesoHovered ? 2 : isMesoSelected ? 1.2 : 0.5,
        opacity: isMesoSelected || isMesoHovered ? 0.9 : 0.25,
        color: isMesoHovered ? '#ffffff' : darkMode ? '#1e293b' : '#ffffff',
        fillOpacity: isMesoHovered ? 0.65 : isMesoSelected ? 0.38 : 0.08,
      };
    }

    if (!showChoropleth) {
      return {
        fillColor: '#cbd5e1',
        weight: 1,
        opacity: 0.7,
        color: darkMode ? '#475569' : '#94a3b8',
        fillOpacity: 0.15,
      };
    }

    // Count of UCs in this municipality
    let count = 0;
    if (data?.municipios) {
      const found = data.municipios.find((m) => m.id === cod || feature.properties?.nome === m.municipio);
      if (found) {
        count = ucsCountByMun[found.municipio.toLowerCase()] || 0;
      }
    }

    let fillColor = '#f8fafc';
    if (count > 5) fillColor = '#047857';
    else if (count >= 3) fillColor = '#10b981';
    else if (count >= 1) fillColor = '#6ee7b7';
    else fillColor = darkMode ? '#1e293b' : '#f1f5f9';

    return {
      fillColor,
      weight: isMesoHovered ? 2 : 1,
      opacity: 0.8,
      color: isMesoHovered ? '#10b981' : darkMode ? '#334155' : '#cbd5e1',
      fillOpacity: isMesoHovered ? 0.8 : count > 0 ? 0.6 : 0.2,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const cod = feature?.properties?.codarea;
    const mun = data?.municipios?.find((m) => m.id === cod);
    const name = mun ? mun.municipio : `Município (${cod})`;
    const meso = mun?.mesorregiao || munToMesoMap[cod] || 'Santa Catarina';
    const ucsCount = ucsCountByMun[name.toLowerCase()] || 0;
    const mesoColor = MESO_COLORS[meso] || '#10b981';

    // Bind rich tooltip that appears on hover
    (layer as L.Path).bindTooltip(
      `
      <div style="font-family: inherit; min-width: 140px;">
        <div style="font-weight: 800; font-size: 13px; color: ${darkMode ? '#f8fafc' : '#0f172a'}; margin-bottom: 2px;">
          ${name}
        </div>
        <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: ${mesoColor}; margin-bottom: 4px;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${mesoColor};"></span>
          ${meso}
        </div>
        <div style="font-size: 11px; color: ${darkMode ? '#cbd5e1' : '#334155'}; border-top: 1px solid ${darkMode ? '#334155' : '#e2e8f0'}; padding-top: 4px; display: flex; justify-content: space-between;">
          <span>Unidades de Conservação:</span>
          <strong style="color: #10b981; margin-left: 8px;">${ucsCount}</strong>
        </div>
        ${mun?.indice_governanca !== undefined ? `
        <div style="font-size: 11px; color: ${darkMode ? '#cbd5e1' : '#334155'}; display: flex; justify-content: space-between;">
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
        l.setStyle({
          weight: 3,
          color: '#fbbf24', // golden highlight border
          fillOpacity: 0.8,
        });
        if (typeof l.bringToFront === 'function') {
          l.bringToFront();
        }
        setHoveredMunInfo({
          name,
          mesorregiao: meso,
          ucsCount,
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getMunStyle(feature));
        setHoveredMunInfo(null);
      },
      click: (e: any) => {
        const l = e.target;
        if (typeof l.getBounds === 'function') {
          setMapTargetBounds(l.getBounds());
        }
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
      fillOpacity: isHovered ? 0.15 : 0.03,
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

  return (
    <div className="space-y-4">
      {/* Territórios / Mesorregiões Quick Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Mesorregiões & Territórios de Santa Catarina
              </h3>
              <p className="text-[11px] text-slate-500">
                Passe o mouse para destacar ou clique para filtrar os municípios e UCs da região
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hoveredMunInfo && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold animate-fadeIn">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{hoveredMunInfo.name}</span>
                <span className="text-slate-400">({hoveredMunInfo.mesorregiao})</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px]">
                  {hoveredMunInfo.ucsCount} UCs
                </span>
              </div>
            )}

            {selectedTerritorio && (
              <button
                onClick={() => setSelectedTerritorio('')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline"
              >
                Ver Todo o Estado
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
                onClick={() => setSelectedTerritorio(isSelected ? '' : t.nome)}
                onMouseEnter={() => setHoveredTerritorio(t.nome)}
                onMouseLeave={() => setHoveredTerritorio('')}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 shadow-md bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-400'
                    : isHovered
                    ? 'shadow-md border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
                    : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0 transition-transform group-hover:scale-125"
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

      {/* Map Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Controle de Camadas & Cores
          </span>
          <span className="text-xs text-slate-500">
            ({ucsWithCoords.length} UCs ativas)
          </span>
        </div>

        {/* Layer & Color Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Color Mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Cor:</span>
            <button
              onClick={() => setColorMode('territorio')}
              className={`px-2 py-1 rounded font-medium transition ${
                colorMode === 'territorio'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Território
            </button>
            <button
              onClick={() => setColorMode('esfera')}
              className={`px-2 py-1 rounded font-medium transition ${
                colorMode === 'esfera'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Esfera
            </button>
            <button
              onClick={() => setColorMode('grupo')}
              className={`px-2 py-1 rounded font-medium transition ${
                colorMode === 'grupo'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Grupo
            </button>
            <button
              onClick={() => setColorMode('cnuc')}
              className={`px-2 py-1 rounded font-medium transition ${
                colorMode === 'cnuc'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              CNUC
            </button>
          </div>

          {/* Toggle Mesoregions Contour */}
          <label className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showMesoLayer}
              onChange={(e) => setShowMesoLayer(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Limites Territoriais</span>
          </label>

          {/* Additional Layers */}
          <label className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showRppns}
              onChange={(e) => setShowRppns(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>RPPNs ({data?.rppns.length || 0})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showTis}
              onChange={(e) => setShowTis(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Terras Indígenas ({data?.terrasIndigenas.length || 0})</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showQuilombos}
              onChange={(e) => setShowQuilombos(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Quilombolas ({data?.quilombolas.length || 0})</span>
          </label>
        </div>
      </div>

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
                key={`mun-layer-${colorMode}-${selectedTerritorio}-${hoveredTerritorio}`}
                data={data.geoJsonSc}
                style={getMunStyle}
                onEachFeature={onEachFeature}
              />
            )}

            {/* Mesorregiões Outline Layer */}
            {showMesoLayer && data?.geoJsonMesorregioes && (
              <GeoJSON
                key={`meso-outline-layer-${hoveredTerritorio}-${selectedTerritorio}`}
                data={data.geoJsonMesorregioes}
                style={getMesoOutlineStyle}
              />
            )}

            {/* UCs Markers */}
            {ucsWithCoords.map((u) => {
              const color = getColorByUc(u);
              return (
                <CircleMarker
                  key={u.id}
                  center={[u.lat!, u.lng!]}
                  radius={u.area_ha > 10000 ? 10 : u.area_ha > 1000 ? 8 : 6}
                  pathOptions={{
                    fillColor: color,
                    color: '#ffffff',
                    weight: 1.5,
                    fillOpacity: 0.9,
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 space-y-2 max-w-xs">
                      <div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white mb-1`}
                          style={{ backgroundColor: color }}
                        >
                          {u.esfera} • {u.categoria}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">
                          {u.nome}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {u.municipios} {u.mesorregiao ? `(${u.mesorregiao})` : ''}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div>
                          <span className="text-slate-400 block text-[9px]">ÁREA</span>
                          <strong>{u.area_ha.toLocaleString('pt-BR')} ha</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">CNUC</span>
                          <strong className={u.cnuc ? 'text-emerald-600' : 'text-amber-600'}>
                            {u.cnuc ? 'Cadastrada' : 'Fora/Pendente'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">PLANO MANEJO</span>
                          <span>{u.plano_manejo ? 'Sim' : 'Não'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">CONSELHO</span>
                          <span>{u.conselho_gestor ? 'Sim' : 'Não'}</span>
                        </div>
                      </div>

                      {u.ato_criacao && (
                        <p className="text-[10px] text-slate-600 italic">
                          Ato: {u.ato_criacao}
                        </p>
                      )}

                      <button
                        onClick={() => setSelectedUc(u)}
                        className="w-full mt-2 py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                      >
                        Ver Ficha Completa
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* RPPNs Layer Markers */}
            {showRppns &&
              data?.rppns
                ?.filter((r) => r.lat && r.lng)
                .map((r) => (
                  <CircleMarker
                    key={r.id}
                    center={[r.lat!, r.lng!]}
                    radius={4}
                    pathOptions={{
                      fillColor: '#14b8a6',
                      color: '#ffffff',
                      weight: 1,
                      fillOpacity: 0.75,
                    }}
                  >
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
                ))}

            {/* Terras Indígenas Markers */}
            {showTis &&
              data?.terrasIndigenas
                ?.filter((t) => t.lat && t.lng)
                .map((t) => (
                  <CircleMarker
                    key={t.id}
                    center={[t.lat!, t.lng!]}
                    radius={5}
                    pathOptions={{
                      fillColor: '#f97316',
                      color: '#ffffff',
                      weight: 1,
                      fillOpacity: 0.85,
                    }}
                  >
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
                ))}

            {/* Quilombolas Markers */}
            {showQuilombos &&
              data?.quilombolas
                ?.filter((q) => q.lat && q.lng)
                .map((q) => (
                  <CircleMarker
                    key={q.id}
                    center={[q.lat!, q.lng!]}
                    radius={5}
                    pathOptions={{
                      fillColor: '#a855f7',
                      color: '#ffffff',
                      weight: 1,
                      fillOpacity: 0.85,
                    }}
                  >
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
                ))}
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
                    onClick={() => setSelectedTerritorio(selectedTerritorio === nome ? '' : nome)}
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
                  className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition"
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
