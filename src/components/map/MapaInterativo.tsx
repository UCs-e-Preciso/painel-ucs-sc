import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { UC, MunicipioLegislacao } from '../../types';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  CircleMarker,
  LayersControl,
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
} from 'lucide-react';

// Fix Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const MapaInterativo: React.FC = () => {
  const {
    filteredUcs,
    data,
    setSelectedUc,
    darkMode,
  } = useData();

  const [colorMode, setColorMode] = useState<'esfera' | 'grupo' | 'cnuc'>('esfera');
  const [showRppns, setShowRppns] = useState<boolean>(true);
  const [showTis, setShowTis] = useState<boolean>(true);
  const [showQuilombos, setShowQuilombos] = useState<boolean>(true);
  const [showChoropleth, setShowChoropleth] = useState<boolean>(true);
  const [selectedMunInfo, setSelectedMunInfo] = useState<any | null>(null);

  const ucsWithCoords = useMemo(() => {
    return filteredUcs.filter((u) => u.lat && u.lng);
  }, [filteredUcs]);

  // Aggregate UCs count by municipality name for Choropleth
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

  const getColorByUc = (u: UC): string => {
    if (colorMode === 'esfera') {
      if (u.esfera === 'Federal') return '#8b5cf6';
      if (u.esfera === 'Estadual') return '#0284c7';
      return '#10b981';
    }
    if (colorMode === 'grupo') {
      return u.grupo === 'Proteção Integral' ? '#059669' : '#0ea5e9';
    }
    // CNUC
    return u.cnuc ? '#10b981' : '#f59e0b';
  };

  const getMunStyle = (feature: any) => {
    if (!showChoropleth) {
      return {
        fillColor: '#cbd5e1',
        weight: 1,
        opacity: 0.7,
        color: darkMode ? '#475569' : '#94a3b8',
        fillOpacity: 0.15,
      };
    }

    const cod = feature?.properties?.codarea;
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
      weight: 1,
      opacity: 0.8,
      color: darkMode ? '#334155' : '#cbd5e1',
      fillOpacity: count > 0 ? 0.6 : 0.2,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const cod = feature?.properties?.codarea;
    const mun = data?.municipios?.find((m) => m.id === cod);
    const name = mun ? mun.municipio : `Município (${cod})`;

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({
          weight: 2,
          color: '#10b981',
          fillOpacity: 0.8,
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getMunStyle(feature));
      },
      click: () => {
        setSelectedMunInfo({
          code: cod,
          name,
          mun,
          ucsInMun: data?.ucs.filter((u) => u.municipios.toLowerCase().includes(name.toLowerCase())) || [],
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Distribuição Geoespacial das UCs de Santa Catarina
          </h3>
          <span className="text-xs text-slate-500 hidden sm:inline">
            ({ucsWithCoords.length} pontos mapeados)
          </span>
        </div>

        {/* Layer & Color Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Color Mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Cor:</span>
            <button
              onClick={() => setColorMode('esfera')}
              className={`px-2 py-1 rounded font-medium ${
                colorMode === 'esfera'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Esfera
            </button>
            <button
              onClick={() => setColorMode('grupo')}
              className={`px-2 py-1 rounded font-medium ${
                colorMode === 'grupo'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Grupo
            </button>
            <button
              onClick={() => setColorMode('cnuc')}
              className={`px-2 py-1 rounded font-medium ${
                colorMode === 'cnuc'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              CNUC
            </button>
          </div>

          {/* Additional Layers */}
          <label className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showChoropleth}
              onChange={(e) => setShowChoropleth(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Densidade UCs</span>
          </label>

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
        <div className="lg:col-span-3 h-[600px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md relative z-0">
          <MapContainer
            center={[-27.2423, -50.2189]}
            zoom={7}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
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
                data={data.geoJsonSc}
                style={getMunStyle}
                onEachFeature={onEachFeature}
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
                    fillOpacity: 0.85,
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
                          {u.municipios}
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
                      fillOpacity: 0.7,
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
                      fillOpacity: 0.8,
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
                      fillOpacity: 0.8,
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
              Legenda do Mapa
            </span>
            {colorMode === 'esfera' ? (
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
                <p className="text-xs text-slate-500">
                  {selectedMunInfo.mun?.mesorregiao || 'Santa Catarina'}
                </p>
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
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  UCs no Município ({selectedMunInfo.ucsInMun.length}):
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedMunInfo.ucsInMun.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhuma UC listada nesta cidade.</p>
                  ) : (
                    selectedMunInfo.ucsInMun.map((u: UC) => (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUc(u)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition text-xs"
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
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
              <Info className="w-8 h-8 text-emerald-500 opacity-60" />
              <p className="text-xs">
                Clique em qualquer <strong>município</strong> ou <strong>marcador de UC</strong> no mapa para visualizar suas informações detalhadas, governança e lista de unidades.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Fonte Cartográfica: Malha Municipal IBGE / Dados CNUC & IMA-SC
          </div>
        </div>
      </div>
    </div>
  );
};
