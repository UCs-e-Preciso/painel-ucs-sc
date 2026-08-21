import * as XLSX from 'xlsx';
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
} from '../types';

export const GOOGLE_SHEETS_URL =
  'https://docs.google.com/spreadsheets/d/1nCkAPo3RVINOzlyTt0pBBoAZ_P84becD/edit?usp=sharing';

export const GOOGLE_SHEETS_EXPORT_URL =
  'https://docs.google.com/spreadsheets/d/1nCkAPo3RVINOzlyTt0pBBoAZ_P84becD/export?format=xlsx';

export interface AppData {
  ucs: UC[];
  roteiro: RoteiroItem[];
  naoSnuc: NaoSNUCItem[];
  municipios: MunicipioLegislacao[];
  rppns: RPPN[];
  terrasIndigenas: TerraIndigena[];
  quilombolas: Quilombola[];
  legislacaoEstadual: LegislacaoEstadual[];
  populacao: PopulacaoMesorregiao[];
  summary: SummaryData;
  geoJsonSc?: any;
  geoJsonMesorregioes?: any;
  source: 'local' | 'online-sync' | 'custom-upload';
  lastUpdated: string;
}

export const loadInitialData = async (): Promise<AppData> => {
  try {
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;

    const [
      ucsRes,
      roteiroRes,
      naoSnucRes,
      munRes,
      rppnRes,
      tiRes,
      quilRes,
      legEstRes,
      popRes,
      sumRes,
      geoRes,
      geoMesoRes,
    ] = await Promise.all([
      fetch(`${base}data/ucs.json`),
      fetch(`${base}data/roteiro.json`),
      fetch(`${base}data/nao_snuc.json`),
      fetch(`${base}data/legislacao_municipal.json`),
      fetch(`${base}data/rppns.json`),
      fetch(`${base}data/terras_indigenas.json`),
      fetch(`${base}data/quilombolas.json`),
      fetch(`${base}data/legislacao_estadual.json`),
      fetch(`${base}data/populacao_mesorregiao.json`),
      fetch(`${base}data/summary.json`),
      fetch(`${base}data/sc_municipios.geojson`).catch(() => null),
      fetch(`${base}data/sc_mesorregioes.geojson`).catch(() => null),
    ]);

    const ucs: UC[] = await ucsRes.json();
    const roteiro: RoteiroItem[] = await roteiroRes.json();
    const naoSnuc: NaoSNUCItem[] = await naoSnucRes.json();
    const municipios: MunicipioLegislacao[] = await munRes.json();
    const rppns: RPPN[] = await rppnRes.json();
    const terrasIndigenas: TerraIndigena[] = await tiRes.json();
    const quilombolas: Quilombola[] = await quilRes.json();
    const legislacaoEstadual: LegislacaoEstadual[] = await legEstRes.json();
    const populacao: PopulacaoMesorregiao[] = await popRes.json();
    const summary: SummaryData = await sumRes.json();
    const geoJsonSc = geoRes ? await geoRes.json() : undefined;
    const geoJsonMesorregioes = geoMesoRes ? await geoMesoRes.json() : undefined;

    return {
      ucs,
      roteiro,
      naoSnuc,
      municipios,
      rppns,
      terrasIndigenas,
      quilombolas,
      legislacaoEstadual,
      populacao,
      summary,
      geoJsonSc,
      geoJsonMesorregioes,
      source: 'local',
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Erro ao carregar dados iniciais locais:', err);
    throw err;
  }
};

export const syncDataFromGoogleSheets = async (
  currentAppData?: AppData
): Promise<AppData> => {
  try {
    // Attempt to download the xlsx binary via proxy or direct export URL
    const res = await fetch(GOOGLE_SHEETS_EXPORT_URL, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) {
      throw new Error(`Falha ao conectar com o Google Sheets: HTTP ${res.status}`);
    }
    const buffer = await res.arrayBuffer();
    return parseXlsxBuffer(buffer, 'online-sync', currentAppData?.geoJsonSc);
  } catch (err) {
    console.warn('Sync direto com Google Sheets falhou (possível CORS ou offline), tentando fallback local:', err);
    // Return current data with updated timestamp or reload initial data
    if (currentAppData) {
      return {
        ...currentAppData,
        source: 'local',
        lastUpdated: new Date().toISOString(),
      };
    }
    return loadInitialData();
  }
};

export const parseXlsxBuffer = (
  buffer: ArrayBuffer,
  sourceType: 'online-sync' | 'custom-upload' = 'custom-upload',
  existingGeoJson?: any
): AppData => {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetNames = wb.SheetNames;

  const parseSheetJson = (sheetName: string): any[] => {
    const matched = sheetNames.find(
      (s) => s.toLowerCase().trim() === sheetName.toLowerCase().trim()
    );
    if (!matched) return [];
    const ws = wb.Sheets[matched];
    return XLSX.utils.sheet_to_json(ws, { defval: '' });
  };

  const cleanNum = (val: any): number => {
    if (!val) return 0;
    const str = String(val).replace(/R\$|ha|km²|km2/gi, '').trim();
    if (!str || /n\/inf|n\/i|n\/a|não encontrada/i.test(str)) return 0;
    const match = str.match(/[-+]?\d*[.,]?\d+/);
    if (!match) return 0;
    return parseFloat(match[0].replace(',', '.')) || 0;
  };

  const cleanYr = (val: any): number | null => {
    if (!val) return null;
    const match = String(val).match(/\b(19\d{2}|20\d{2})\b/);
    return match ? parseInt(match[1]) : null;
  };

  // 1. UCs
  const ucsRaw = parseSheetJson('UCs');
  const ucs: UC[] = ucsRaw.map((r: any, idx: number) => {
    const nome = String(r['Nome da UC'] || '').trim();
    const areaHa = cleanNum(r['Área Ato Legal de Criação'] || r['Área soma biomas'] || r['Bioma Área (ha)']);
    const cnucVal = String(r['CNUC?'] || '').toUpperCase().trim();
    const isCnuc = ['S', 'SIM', 'TRUE', '1'].includes(cnucVal);

    const pmVal = String(r['Plano de manejo'] || '').toUpperCase().trim();
    const hasPm = ['SIM', 'S', 'POSSUI', 'TRUE', '1'].includes(pmVal) || (pmVal.includes('SIM') && !pmVal.includes('NÃO'));

    const cgVal = String(r['Conselho gestor'] || '').toUpperCase().trim();
    const hasCg = ['SIM', 'S', 'POSSUI', 'TRUE', '1'].includes(cgVal) || (cgVal.includes('SIM') && !cgVal.includes('NÃO'));

    let grupo = String(r['Grupo'] || '').trim();
    if (!grupo || ['0', '1'].includes(grupo)) {
      const cat = String(r['Categoria de Manejo'] || '').toLowerCase();
      if (/parque|reserva biológica|estação ecológica|monumento natural|refúgio/.test(cat)) {
        grupo = 'Proteção Integral';
      } else {
        grupo = 'Uso Sustentável';
      }
    }

    return {
      id: String(r['ID_UC'] || `UC-SC-${idx + 1}`),
      codigo_cnuc: String(r['CÓDIGO_UC'] || ''),
      nome,
      esfera: String(r['Esfera Administrativa'] || 'Municipal').trim(),
      grupo,
      categoria: String(r['Categoria de Manejo'] || 'Outra').trim(),
      categoria_iucn: String(r['Categoria IUCN'] || '').trim(),
      cnuc: isCnuc,
      ano_criacao: cleanYr(r['Ano de Criação']),
      ano_ato_recente: cleanYr(r['Ano do ato legal mais recente']),
      ato_criacao: String(r['ato de criação'] || '').trim(),
      outros_atos: String(r['Outros atos legais'] || '').trim(),
      municipios: String(r['Municípios abrangidos'] || '').trim(),
      area_ha: areaHa,
      area_km2: Math.round((areaHa / 100) * 100) / 100,
      bioma: String(r['Bioma declarado'] || 'Mata Atlântica').trim(),
      plano_manejo: hasPm,
      plano_manejo_detalhe: String(r['INSTRUMENTO PLANO DE MANEJO'] || r['Plano de manejo'] || '').trim(),
      link_plano_manejo: String(r[' LINK PLANO DE MANEJO'] || '').trim(),
      conselho_gestor: hasCg,
      conselho_gestor_detalhe: String(r['Conselho gestor'] || '').trim(),
      orgao_gestor: String(r['Órgão gestor'] || '').trim(),
      link_ato_criacao: String(r['LINK PARA ATO DE CRIAÇÃO'] || '').trim(),
      link_mapa: String(r['MAPA'] || '').trim(),
      observacoes: String(r['observações'] || '').trim(),
      encaminhamentos: String(r['Encaminhamentos'] || '').trim(),
    };
  }).filter((u) => u.nome.length > 0);

  // 2. Roteiro
  const rotRaw = parseSheetJson('Roteiro');
  const roteiro: RoteiroItem[] = rotRaw.map((r: any, idx: number) => ({
    id: `ROT-${idx + 1}`,
    nome: String(r['Nome da UC'] || '').trim(),
    categoria: String(r['Categoria de Manejo'] || '').trim(),
    esfera: String(r['Esfera Administrativa'] || 'Municipal').trim(),
    municipio: String(r['Município'] || r['Município '] || '').trim(),
    ato_criacao: String(r['Ato de criação'] || '').trim(),
    motivo_fora_cnuc: String(r['Porque não está no CNUC?'] || '').trim(),
    limites_definidos: String(r['Limites definidos'] || '').trim(),
    plano_manejo: String(r['Plano de Manejo?'] || '').trim(),
    conselho_gestor: String(r['Conselho Gestor?'] || r['Conselho Gestor? '] || '').trim(),
    data_contato: String(r['Data do contato'] || r['Data do contato '] || '').trim(),
  })).filter((r) => r.nome.length > 0);

  // 3. N SNUC
  const nsnucRaw = parseSheetJson('N SNUC');
  const naoSnuc: NaoSNUCItem[] = nsnucRaw.map((r: any, idx: number) => ({
    id: `NSNUC-${idx + 1}`,
    nome: String(r['UC MUNICIPAL'] || '').trim(),
    categoria: String(r['Categoria'] || '').trim(),
    ano_criacao: cleanYr(r['ANO DE CRIAÇÃO']),
    ato_criacao: String(r['ATO DE CRIAÇÃO'] || '').trim(),
    municipio: String(r['MUNICÍPIO'] || '').trim(),
    area_ha: cleanNum(r['ÁREA (ha)']),
    plano_manejo: String(r['PLANO DE MANEJO'] || '').trim(),
    mapa: String(r['MAPA'] || '').trim(),
    observacao: String(r['Observação'] || '').trim(),
    encaminhamentos: String(r['Encaminhamentos'] || r['Encaminhamentos '] || '').trim(),
  })).filter((n) => n.nome.length > 0);

  // 4. Municípios / Legislação
  const munRaw = parseSheetJson('Legislação');
  const municipios: MunicipioLegislacao[] = munRaw.map((r: any, idx: number) => {
    const munNome = String(r['MUNICÍPIOS de SC'] || '').trim();
    const temPlanoDiretor = Boolean(r['Plano diretor'] && !/não tem/i.test(String(r['Plano diretor'])));
    const temSaneamento = Boolean(r['Saneamento'] && !/não tem/i.test(String(r['Saneamento'])));
    const temRecursosHidricos = Boolean(r['recursos Hídricos'] && !/não tem/i.test(String(r['recursos Hídricos'])));
    const temPoliticaAmb = Boolean(r['Política ambiental'] && !/não tem/i.test(String(r['Política ambiental'])));
    const temConselho = Boolean(r['Conselho MA'] && !/não tem/i.test(String(r['Conselho MA'])));
    const temFundo = Boolean(r['Fundo MA'] && !/não tem/i.test(String(r['Fundo MA'])));
    const temSecretaria = Boolean(r['Secretaria MA'] || r['Fundação MA'] || r['Órgão ambiental']);

    const score =
      (temPlanoDiretor ? 2 : 0) +
      (temSaneamento ? 1 : 0) +
      (temRecursosHidricos ? 1 : 0) +
      (temPoliticaAmb ? 2 : 0) +
      (temConselho ? 2 : 0) +
      (temFundo ? 1 : 0) +
      (temSecretaria ? 1 : 0);

    return {
      id: `MUN-${idx + 1}`,
      municipio: munNome,
      leismun_disponivel: String(r['LEG DISPONIVEL NO LEISMUN'] || '').trim(),
      plano_diretor: String(r['Plano diretor'] || '').trim(),
      parcelamento: String(r['Parcelamento'] || '').trim(),
      saneamento: String(r['Saneamento'] || '').trim(),
      recursos_hidricos: String(r['recursos Hídricos'] || '').trim(),
      politica_ambiental: String(r['Política ambiental'] || '').trim(),
      zonas_interesse_amb: String(r['Zonas interesse amb'] || '').trim(),
      secretaria_ma: String(r['Secretaria MA'] || '').trim(),
      conselho_ma: String(r['Conselho MA'] || '').trim(),
      fundacao_ma: String(r['Fundação MA'] || '').trim(),
      fundo_ma: String(r['Fundo MA'] || '').trim(),
      direito_animal: String(r['Direito animal'] || '').trim(),
      patrimonio_natural: String(r['Patr. natural'] || '').trim(),
      leis_rppn: String(r['RPPN'] || '').trim(),
      leis_pnm: String(r['PNM'] || '').trim(),
      leis_mona: String(r['MONA'] || '').trim(),
      leis_apa: String(r['APA'] || '').trim(),
      leis_rebio: String(r['REBIO'] || '').trim(),
      orgao_ambiental: String(r['Órgão ambiental'] || '').trim(),
      telefone: String(r['Telefone'] || '').trim(),
      observacoes: String(r['Observações'] || '').trim(),
      tem_plano_diretor: temPlanoDiretor,
      tem_saneamento: temSaneamento,
      tem_recursos_hidricos: temRecursosHidricos,
      tem_politica_ambiental: temPoliticaAmb,
      tem_conselho_ma: temConselho,
      tem_fundo_ma: temFundo,
      tem_fundacao_secretaria: temSecretaria,
      indice_governanca: score,
    };
  }).filter((m) => m.municipio.length > 0);

  // 5. RPPNs
  const rppnRaw = parseSheetJson('RPPNS');
  const rppns: RPPN[] = rppnRaw.map((r: any, idx: number) => ({
    id: `RPPN-${idx + 1}`,
    nome: String(r['UNIDADE'] || '').trim(),
    ente_federativo: String(r['ENTE FEDERATIVO'] || '').trim(),
    ano: cleanYr(r['ANO']),
    ato_legislativo: String(r['ATO LEGISLATIVO'] || '').trim(),
    municipio: String(r['MUNICÍPIO'] || '').trim(),
    area_ha: cleanNum(r['ÁREA']),
  })).filter((r) => r.nome.length > 0);

  // 6. Terras Indígenas
  const tiRaw = parseSheetJson('Terras Indígenas');
  const terrasIndigenas: TerraIndigena[] = tiRaw.map((r: any, idx: number) => ({
    id: `TI-${idx + 1}`,
    nome: String(r['ÁREAS PROTEGIDAS NÃO ENQUADRADAS NO SNUC'] || '').trim(),
    ato_criacao_status: String(r['ATO DE CRIAÇÃO'] || '').trim(),
    area_ha: cleanNum(r['ÁREA']),
    localizacao: String(r['LOCALIZAÇÃO'] || '').trim(),
    observacoes: String(r['Coluna1'] || '').trim(),
  })).filter((t) => t.nome.length > 0);

  // 7. Quilombolas
  const quilRaw = parseSheetJson('Quilombolas');
  const quilombolas: Quilombola[] = quilRaw.map((r: any, idx: number) => ({
    id: `QUILOMBO-${idx + 1}`,
    processo_incra: String(r['Nº Processo'] || '').trim(),
    comunidade: String(r['Comunidade'] || '').trim(),
    localizacao: String(r['Localização'] || '').trim(),
    area_ha: cleanNum(r['Área']),
    edital_rtid_dou: String(r['Edital RTID no DOU'] || '').trim(),
    portaria_dou: String(r['Portaria no DOU'] || '').trim(),
  })).filter((q) => q.comunidade.length > 0);

  // 8. Leg Estadual
  const legEstRaw = parseSheetJson('Leg. Estadual');
  const legislacaoEstadual: LegislacaoEstadual[] = legEstRaw.map((r: any, idx: number) => ({
    id: `LEGEST-${idx + 1}`,
    tipo: String(r['TIPO'] || '').trim(),
    numero: String(r['Nº'] || '').trim(),
    ano: cleanYr(r['ANO']),
    ementa: String(r['EMENTA'] || '').trim(),
  })).filter((l) => l.ementa.length > 0);

  // Summary calculations
  const totalUcs = ucs.length;
  const totalAreaHa = ucs.reduce((acc, u) => acc + u.area_ha, 0);
  const totalAreaKm2 = Math.round((totalAreaHa / 100) * 100) / 100;
  const scAreaKm2 = 95730;
  const ucsCnuc = ucs.filter((u) => u.cnuc).length;
  const ucsPm = ucs.filter((u) => u.plano_manejo).length;
  const ucsCg = ucs.filter((u) => u.conselho_gestor).length;

  const esferas: Record<string, { count: number; area_ha: number }> = {};
  const grupos: Record<string, { count: number; area_ha: number }> = {};
  const categorias: Record<string, number> = {};
  const decadas: Record<string, number> = {};

  ucs.forEach((u) => {
    esferas[u.esfera] = esferas[u.esfera] || { count: 0, area_ha: 0 };
    esferas[u.esfera].count += 1;
    esferas[u.esfera].area_ha += u.area_ha;

    grupos[u.grupo] = grupos[u.grupo] || { count: 0, area_ha: 0 };
    grupos[u.grupo].count += 1;
    grupos[u.grupo].area_ha += u.area_ha;

    categorias[u.categoria] = (categorias[u.categoria] || 0) + 1;

    if (u.ano_criacao) {
      const dec = `${Math.floor(u.ano_criacao / 10) * 10}s`;
      decadas[dec] = (decadas[dec] || 0) + 1;
    }
  });

  const summary: SummaryData = {
    total_ucs: totalUcs,
    total_area_ha: Math.round(totalAreaHa * 100) / 100,
    total_area_km2: totalAreaKm2,
    sc_area_total_km2: scAreaKm2,
    pct_cobertura_sc: Math.round((totalAreaKm2 / scAreaKm2) * 10000) / 100,
    ucs_no_cnuc: ucsCnuc,
    ucs_fora_cnuc: totalUcs - ucsCnuc,
    ucs_com_plano_manejo: ucsPm,
    pct_plano_manejo: totalUcs ? Math.round((ucsPm / totalUcs) * 1000) / 10 : 0,
    ucs_com_conselho_gestor: ucsCg,
    pct_conselho_gestor: totalUcs ? Math.round((ucsCg / totalUcs) * 1000) / 10 : 0,
    total_terras_indigenas: terrasIndigenas.length,
    area_ti_ha: Math.round(terrasIndigenas.reduce((a, b) => a + b.area_ha, 0)),
    total_quilombolas: quilombolas.length,
    area_quilombolas_ha: Math.round(quilombolas.reduce((a, b) => a + b.area_ha, 0)),
    total_rppns: rppns.length,
    area_rppns_ha: Math.round(rppns.reduce((a, b) => a + b.area_ha, 0)),
    total_municipios_sc: municipios.length,
    esferas,
    grupos,
    categorias,
    decadas,
    ultima_atualizacao: new Date().toISOString(),
  };

  return {
    ucs,
    roteiro,
    naoSnuc,
    municipios,
    rppns,
    terrasIndigenas,
    quilombolas,
    legislacaoEstadual,
    populacao: [],
    summary,
    geoJsonSc: existingGeoJson,
    source: sourceType,
    lastUpdated: new Date().toISOString(),
  };
};

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToCsv = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
