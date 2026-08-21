export interface UC {
  id: string;
  codigo_cnuc?: string;
  nome: string;
  esfera: 'Federal' | 'Estadual' | 'Municipal' | string;
  grupo: 'Proteção Integral' | 'Uso Sustentável' | string;
  categoria: string;
  categoria_iucn?: string;
  cnuc: boolean;
  ano_criacao?: number | null;
  ano_ato_recente?: number | null;
  ato_criacao?: string;
  outros_atos?: string;
  municipios: string;
  municipio_principal?: string;
  mesorregiao?: string;
  area_ha: number;
  area_km2: number;
  bioma: string;
  tem_area_marinha?: boolean;
  plano_manejo: boolean;
  plano_manejo_detalhe?: string;
  link_plano_manejo?: string;
  conselho_gestor: boolean;
  conselho_gestor_detalhe?: string;
  orgao_gestor?: string;
  link_ato_criacao?: string;
  link_mapa?: string;
  observacoes?: string;
  encaminhamentos?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface RoteiroItem {
  id: string;
  nome: string;
  categoria: string;
  esfera: string;
  municipio: string;
  mesorregiao?: string;
  ato_criacao?: string;
  motivo_fora_cnuc?: string;
  limites_definidos?: string;
  plano_manejo?: string;
  conselho_gestor?: string;
  data_contato?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface NaoSNUCItem {
  id: string;
  nome: string;
  categoria: string;
  ano_criacao?: number | null;
  ato_criacao?: string;
  municipio: string;
  mesorregiao?: string;
  area_ha: number;
  plano_manejo?: string;
  mapa?: string;
  observacao?: string;
  encaminhamentos?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface MunicipioLegislacao {
  id: string;
  municipio: string;
  mesorregiao?: string;
  leismun_disponivel?: string;
  plano_diretor?: string;
  parcelamento?: string;
  saneamento?: string;
  recursos_hidricos?: string;
  politica_ambiental?: string;
  zonas_interesse_amb?: string;
  secretaria_ma?: string;
  conselho_ma?: string;
  fundacao_ma?: string;
  fundo_ma?: string;
  direito_animal?: string;
  patrimonio_natural?: string;
  leis_rppn?: string;
  leis_pnm?: string;
  leis_mona?: string;
  leis_apa?: string;
  leis_rebio?: string;
  orgao_ambiental?: string;
  telefone?: string;
  observacoes?: string;
  tem_plano_diretor: boolean;
  tem_saneamento: boolean;
  tem_recursos_hidricos: boolean;
  tem_politica_ambiental: boolean;
  tem_conselho_ma: boolean;
  tem_fundo_ma: boolean;
  tem_fundacao_secretaria: boolean;
  indice_governanca: number;
  lat?: number | null;
  lng?: number | null;
}

export interface RPPN {
  id: string;
  nome: string;
  ente_federativo: string;
  ano?: number | null;
  ato_legislativo?: string;
  municipio: string;
  mesorregiao?: string;
  area_ha: number;
  lat?: number | null;
  lng?: number | null;
}

export interface TerraIndigena {
  id: string;
  nome: string;
  ato_criacao_status?: string;
  area_ha: number;
  localizacao: string;
  mesorregiao?: string;
  observacoes?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface Quilombola {
  id: string;
  processo_incra?: string;
  comunidade: string;
  localizacao: string;
  mesorregiao?: string;
  area_ha: number;
  edital_rtid_dou?: string;
  portaria_dou?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface LegislacaoEstadual {
  id: string;
  tipo: string;
  numero: string;
  ano?: number | null;
  ementa: string;
}

export interface PopulacaoMesorregiao {
  mesorregiao: string;
  microrregiao: string;
  total_municipios: number;
  populacao_2022: number;
}

export interface SummaryData {
  total_ucs: number;
  total_area_ha: number;
  total_area_km2: number;
  sc_area_total_km2: number;
  pct_cobertura_sc: number;
  ucs_no_cnuc: number;
  ucs_fora_cnuc: number;
  ucs_com_plano_manejo: number;
  pct_plano_manejo: number;
  ucs_com_conselho_gestor: number;
  pct_conselho_gestor: number;
  total_terras_indigenas: number;
  area_ti_ha: number;
  total_quilombolas: number;
  area_quilombolas_ha: number;
  total_rppns: number;
  area_rppns_ha: number;
  total_municipios_sc: number;
  esferas: Record<string, { count: number; area_ha: number }>;
  grupos: Record<string, { count: number; area_ha: number }>;
  categorias: Record<string, number>;
  decadas?: Record<string, number>;
  ultima_atualizacao?: string;
}

export interface FilterState {
  searchQuery: string;
  esfera: string;
  grupo: string;
  categoria: string;
  statusCnuc: string;
  planoManejo: string;
  conselhoGestor: string;
  mesorregiao: string;
  municipio: string;
  anoMin?: number;
  anoMax?: number;
}

export type ActiveTab = 
  | 'visao-geral' 
  | 'mapa-interativo' 
  | 'diagnostico-cnuc' 
  | 'governanca-municipal' 
  | 'mosaico-socioambiental' 
  | 'explorador-ucs' 
  | 'demografia-territorio';
