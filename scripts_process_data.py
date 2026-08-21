import zipfile
import xml.etree.ElementTree as ET
import re
import json
import os
import unicodedata

def normalize_text(text):
    if not text:
        return ""
    text = str(text).strip()
    return unicodedata.normalize('NFKC', text)

def clean_number(val):
    if val is None:
        return 0.0
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ['n/inf', 'n/i', 'sem informação', 'não encontrada', 'n/a', '-', '', 'none']:
        return 0.0
    val_str = val_str.replace('R$', '').replace('ha', '').replace('km²', '').replace('km2', '').strip()
    if ',' in val_str and '.' in val_str:
        if val_str.find('.') < val_str.find(','):
            val_str = val_str.replace('.', '').replace(',', '.')
        else:
            val_str = val_str.replace(',', '')
    elif ',' in val_str:
        val_str = val_str.replace(',', '.')
    
    match = re.search(r'[-+]?\d*\.?\d+', val_str)
    if match:
        try:
            return round(float(match.group(0)), 2)
        except ValueError:
            return 0.0
    return 0.0

def clean_year(val):
    if not val:
        return None
    val_str = str(val).strip()
    match = re.search(r'\b(19\d{2}|20\d{2})\b', val_str)
    if match:
        return int(match.group(1))
    return None

def normalize_boolean(val):
    if not val:
        return False
    v = str(val).strip().upper()
    if v in ['SIM', 'S', 'TRUE', '1', 'SIM ']:
        return True
    return False

def get_sheet_rows(z, sheet_target, shared_strings):
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    if not sheet_target.startswith('xl/'):
        sheet_target = 'xl/' + sheet_target.lstrip('/')
    if sheet_target not in z.namelist():
        return []
    
    s_tree = ET.fromstring(z.read(sheet_target))
    rows_data = []
    for row in s_tree.findall('.//ns:row', ns):
        cols = {}
        for c in row.findall('ns:c', ns):
            r_ref = c.attrib.get('r')
            col_letter = re.match(r'([A-Z]+)', r_ref).group(1) if r_ref else ''
            t_attr = c.attrib.get('t')
            v_elem = c.find('ns:v', ns)
            val = v_elem.text if v_elem is not None else ''
            if t_attr == 's' and val.isdigit():
                idx = int(val)
                if idx < len(shared_strings):
                    val = shared_strings[idx]
            elif t_attr == 'b':
                val = 'TRUE' if val == '1' else 'FALSE'
            cols[col_letter] = normalize_text(val)
        rows_data.append(cols)
    return rows_data

def process_all_data(xlsx_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
          'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
    
    # Load centroids
    centroids = {}
    if os.path.exists('sc_municipios_centroids.json'):
        with open('sc_municipios_centroids.json', encoding='utf-8') as f:
            centroids = json.load(f)
            
    def name_key(n):
        if not n:
            return ""
        n = unicodedata.normalize('NFKD', n).encode('ASCII', 'ignore').decode('utf-8')
        return re.sub(r'[^a-zA-Z0-9]', '', n).lower()
        
    muni_name_to_centroid = {}
    for c_id, meta in centroids.items():
        k = name_key(meta['name'])
        muni_name_to_centroid[k] = meta
        
    # Track count of UCs per municipality for slight spatial dispersion
    mun_usage_counter = {}

    def find_coordinates(mun_str, name_str=""):
        combined = f"{mun_str} {name_str}"
        if not mun_str and not name_str:
            return None, None, "", ""
            
        # Special fallback lookups
        if 'campeche' in combined.lower():
            mun_str = 'Florianópolis'
        elif 'sumidouro' in combined.lower():
            mun_str = 'São Francisco do Sul'
        elif 'caminho das nascentes' in combined.lower() or 'nascentes' in combined.lower():
            mun_str = 'Alfredo Wagner'
        elif 'campos de palmas' in combined.lower():
            mun_str = 'Passos Maia'
            
        tokens = re.split(r'[/,;\-–\(\)]+', mun_str)
        for token in tokens:
            t_clean = token.strip()
            k = name_key(t_clean)
            if k in muni_name_to_centroid:
                m = muni_name_to_centroid[k]
                mun_name = m['name']
                count = mun_usage_counter.get(mun_name, 0)
                mun_usage_counter[mun_name] = count + 1
                
                # Apply slight deterministic radial offset if multiple UCs in same municipality
                lat = m['lat']
                lng = m['lng']
                if count > 0:
                    import math
                    angle = (count * 137.5) * (math.pi / 180.0) # Golden angle
                    radius = 0.008 * math.sqrt(count) # ~800m - 2km
                    lat = round(lat + radius * math.sin(angle), 6)
                    lng = round(lng + radius * math.cos(angle), 6)
                
                return lat, lng, m['name'], m['mesorregiao']
        return None, None, "", ""

    with zipfile.ZipFile(xlsx_path) as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in tree.findall('ns:si', ns):
                t = si.find('ns:t', ns)
                if t is not None:
                    shared_strings.append(t.text or '')
                else:
                    text_parts = [part.text for part in si.findall('.//ns:t', ns) if part.text]
                    shared_strings.append(''.join(text_parts))

        wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
        sheets = []
        for sheet in wb_tree.findall('ns:sheets/ns:sheet', ns):
            sheets.append((sheet.attrib.get('name'), sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')))
            
        wb_rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        rel_map = {rel.attrib['Id']: rel.attrib['Target'] for rel in wb_rels.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship')}

        sheet_rows = {}
        for s_name, r_id in sheets:
            if r_id in rel_map:
                rows = get_sheet_rows(z, rel_map[r_id], shared_strings)
                sheet_rows[s_name.strip()] = rows

        print(f"Loaded {len(sheet_rows)} sheets from {xlsx_path}")

        # 1. PROCESS 'UCs' SHEET
        ucs_data = []
        ucs_raw = sheet_rows.get('UCs', [])
        if ucs_raw:
            header = ucs_raw[0]
            col_map = {k: v.strip() for k, v in header.items()}
            for idx, r in enumerate(ucs_raw[1:], start=1):
                rec = {col_map.get(k, k): v.strip() for k, v in r.items() if k in col_map}
                nome_uc = rec.get('Nome da UC', '').strip()
                if not nome_uc:
                    continue
                
                area_ha = clean_number(rec.get('Área Ato Legal de Criação') or rec.get('Área soma biomas') or rec.get('Bioma Área (ha)'))
                area_km2 = round(area_ha / 100.0, 2) if area_ha > 0 else 0.0
                ano_criacao = clean_year(rec.get('Ano de Criação'))
                
                cnuc_raw = rec.get('CNUC?', '').upper().strip()
                is_cnuc = cnuc_raw in ['S', 'SIM', 'TRUE', '1']
                
                grupo_raw = rec.get('Grupo', '').strip()
                if not grupo_raw or grupo_raw in ['0', '1']:
                    cat = rec.get('Categoria de Manejo', '').lower()
                    if any(x in cat for x in ['parque', 'reserva biológica', 'estação ecológica', 'monumento natural', 'refúgio']):
                        grupo_raw = 'Proteção Integral'
                    else:
                        grupo_raw = 'Uso Sustentável'
                
                pm_raw = rec.get('Plano de manejo', '').strip().upper()
                has_pm = pm_raw in ['SIM', 'S', 'SIM ', 'POSSUI', 'TRUE', '1'] or ('SIM' in pm_raw and 'NÃO' not in pm_raw)
                
                cg_raw = rec.get('Conselho gestor', '').strip().upper()
                has_cg = cg_raw in ['SIM', 'S', 'SIM ', 'POSSUI', 'TRUE', '1'] or ('SIM' in cg_raw and 'NÃO' not in cg_raw)

                mun_abrang = rec.get('Municípios abrangidos', '').strip()
                lat, lng, mun_nome, mesorregiao = find_coordinates(mun_abrang, nome_uc)
                
                categoria = rec.get('Categoria de Manejo', '').strip() or 'Outra'
                esfera = rec.get('Esfera Administrativa', '').strip() or 'Municipal'
                bioma = rec.get('Bioma declarado', '').strip() or 'Mata Atlântica'
                
                uc_item = {
                    'id': rec.get('ID_UC', '').strip() or f"UC-SC-{idx}",
                    'codigo_cnuc': rec.get('CÓDIGO_UC', '').strip(),
                    'nome': nome_uc,
                    'esfera': esfera,
                    'grupo': grupo_raw,
                    'categoria': categoria,
                    'categoria_iucn': rec.get('Categoria IUCN', '').strip(),
                    'cnuc': is_cnuc,
                    'ano_criacao': ano_criacao,
                    'ano_ato_recente': clean_year(rec.get('Ano do ato legal mais recente')),
                    'ato_criacao': rec.get('ato de criação', '').strip(),
                    'outros_atos': rec.get('Outros atos legais', '').strip(),
                    'municipios': mun_abrang,
                    'municipio_principal': mun_nome,
                    'mesorregiao': mesorregiao,
                    'area_ha': area_ha,
                    'area_km2': area_km2,
                    'bioma': bioma,
                    'tem_area_marinha': clean_number(rec.get('Área Marinha')) > 0 or normalize_boolean(rec.get('Município Costeiro')),
                    'plano_manejo': has_pm,
                    'plano_manejo_detalhe': rec.get('INSTRUMENTO PLANO DE MANEJO', '').strip() or rec.get('Plano de manejo', '').strip(),
                    'link_plano_manejo': rec.get(' LINK PLANO DE MANEJO', '').strip(),
                    'conselho_gestor': has_cg,
                    'conselho_gestor_detalhe': rec.get('Conselho gestor', '').strip(),
                    'orgao_gestor': rec.get('Órgão gestor', '').strip(),
                    'link_ato_criacao': rec.get('LINK PARA ATO DE CRIAÇÃO', '').strip(),
                    'link_mapa': rec.get('MAPA', '').strip(),
                    'observacoes': rec.get('observações', '').strip(),
                    'encaminhamentos': rec.get('Encaminhamentos', '').strip(),
                    'lat': lat,
                    'lng': lng
                }
                ucs_data.append(uc_item)
                
        with open(os.path.join(output_dir, 'ucs.json'), 'w', encoding='utf-8') as f:
            json.dump(ucs_data, f, ensure_ascii=False, indent=2)
        print(f"Saved ucs.json with {len(ucs_data)} items")

        # 2. PROCESS 'Roteiro' SHEET
        roteiro_data = []
        roteiro_raw = sheet_rows.get('Roteiro', [])
        if roteiro_raw:
            header = roteiro_raw[0]
            col_map = {k: v.strip() for k, v in header.items()}
            for idx, r in enumerate(roteiro_raw[1:], start=1):
                rec = {col_map.get(k, k): v.strip() for k, v in r.items() if k in col_map}
                nome_uc = rec.get('Nome da UC', '').strip()
                if not nome_uc:
                    continue
                mun = rec.get('Município', '') or rec.get('Município ', '').strip()
                lat, lng, mun_nome, mesorregiao = find_coordinates(mun)
                
                item = {
                    'id': f"ROT-{idx}",
                    'nome': nome_uc,
                    'categoria': rec.get('Categoria de Manejo', '').strip(),
                    'esfera': rec.get('Esfera Administrativa', '').strip() or 'Municipal',
                    'municipio': mun,
                    'mesorregiao': mesorregiao,
                    'ato_criacao': rec.get('Ato de criação', '').strip(),
                    'motivo_fora_cnuc': rec.get('Porque não está no CNUC?', '').strip(),
                    'limites_definidos': rec.get('Limites definidos', '').strip(),
                    'plano_manejo': rec.get('Plano de Manejo?', '').strip(),
                    'conselho_gestor': rec.get('Conselho Gestor?', '') or rec.get('Conselho Gestor? ', '').strip(),
                    'data_contato': rec.get('Data do contato', '') or rec.get('Data do contato ', '').strip(),
                    'lat': lat,
                    'lng': lng
                }
                roteiro_data.append(item)
                
        with open(os.path.join(output_dir, 'roteiro.json'), 'w', encoding='utf-8') as f:
            json.dump(roteiro_data, f, ensure_ascii=False, indent=2)
        print(f"Saved roteiro.json with {len(roteiro_data)} items")

        # 3. PROCESS 'N SNUC' SHEET
        nsnuc_data = []
        nsnuc_raw = sheet_rows.get('N SNUC', [])
        if nsnuc_raw:
            header = nsnuc_raw[0]
            col_map = {k: v.strip() for k, v in header.items()}
            for idx, r in enumerate(nsnuc_raw[1:], start=1):
                rec = {col_map.get(k, k): v.strip() for k, v in r.items() if k in col_map}
                nome_uc = rec.get('UC MUNICIPAL', '').strip()
                if not nome_uc:
                    continue
                mun = rec.get('MUNICÍPIO', '').strip()
                lat, lng, mun_nome, mesorregiao = find_coordinates(mun)
                
                item = {
                    'id': f"NSNUC-{idx}",
                    'nome': nome_uc,
                    'categoria': rec.get('Categoria', '').strip(),
                    'ano_criacao': clean_year(rec.get('ANO DE CRIAÇÃO')),
                    'ato_criacao': rec.get('ATO DE CRIAÇÃO', '').strip(),
                    'municipio': mun,
                    'mesorregiao': mesorregiao,
                    'area_ha': clean_number(rec.get('ÁREA (ha)')),
                    'plano_manejo': rec.get('PLANO DE MANEJO', '').strip(),
                    'mapa': rec.get('MAPA', '').strip(),
                    'observacao': rec.get('Observação', '').strip(),
                    'encaminhamentos': rec.get('Encaminhamentos', '') or rec.get('Encaminhamentos ', '').strip(),
                    'lat': lat,
                    'lng': lng
                }
                nsnuc_data.append(item)
                
        with open(os.path.join(output_dir, 'nao_snuc.json'), 'w', encoding='utf-8') as f:
            json.dump(nsnuc_data, f, ensure_ascii=False, indent=2)
        print(f"Saved nao_snuc.json with {len(nsnuc_data)} items")

        # 4. PROCESS 'Legislação' SHEET (295 municípios)
        leg_data = []
        leg_raw = None
        for k in sheet_rows.keys():
            if 'Legisla' in k and 'Estadual' not in k:
                leg_raw = sheet_rows[k]
                break
        if leg_raw:
            header = leg_raw[0]
            col_map = {k: v.strip() for k, v in header.items()}
            for idx, r in enumerate(leg_raw[1:], start=1):
                rec = {col_map.get(k, k): v.strip() for k, v in r.items() if k in col_map}
                mun_nome = rec.get('MUNICÍPIOS de SC', '').strip()
                if not mun_nome:
                    continue
                    
                lat, lng, matched_name, mesorregiao = find_coordinates(mun_nome)
                
                tem_plano_diretor = bool(rec.get('Plano diretor', '').strip() and 'não tem' not in rec.get('Plano diretor', '').lower())
                tem_saneamento = bool(rec.get('Saneamento', '').strip() and 'não tem' not in rec.get('Saneamento', '').lower())
                tem_recursos_hidricos = bool(rec.get('recursos Hídricos', '').strip() and 'não tem' not in rec.get('recursos Hídricos', '').lower())
                tem_politica_ambiental = bool(rec.get('Política ambiental', '').strip() and 'não tem' not in rec.get('Política ambiental', '').lower())
                tem_conselho_ma = bool(rec.get('Conselho MA', '').strip() and 'não tem' not in rec.get('Conselho MA', '').lower())
                tem_fundo_ma = bool(rec.get('Fundo MA', '').strip() and 'não tem' not in rec.get('Fundo MA', '').lower())
                tem_fundacao_secretaria = bool(rec.get('Secretaria MA', '').strip() or rec.get('Fundação MA', '').strip() or rec.get('Órgão ambiental', '').strip())
                
                score = sum([
                    tem_plano_diretor * 2,
                    tem_saneamento * 1,
                    tem_recursos_hidricos * 1,
                    tem_politica_ambiental * 2,
                    tem_conselho_ma * 2,
                    tem_fundo_ma * 1,
                    tem_fundacao_secretaria * 1
                ])

                item = {
                    'id': f"MUN-{idx}",
                    'municipio': mun_nome,
                    'mesorregiao': mesorregiao,
                    'leismun_disponivel': rec.get('LEG DISPONIVEL NO LEISMUN', '').strip(),
                    'plano_diretor': rec.get('Plano diretor', '').strip(),
                    'parcelamento': rec.get('Parcelamento', '').strip(),
                    'saneamento': rec.get('Saneamento', '').strip(),
                    'recursos_hidricos': rec.get('recursos Hídricos', '').strip(),
                    'politica_ambiental': rec.get('Política ambiental', '').strip(),
                    'zonas_interesse_amb': rec.get('Zonas interesse amb', '').strip(),
                    'secretaria_ma': rec.get('Secretaria MA', '').strip(),
                    'conselho_ma': rec.get('Conselho MA', '').strip(),
                    'fundacao_ma': rec.get('Fundação MA', '').strip(),
                    'fundo_ma': rec.get('Fundo MA', '').strip(),
                    'direito_animal': rec.get('Direito animal', '').strip(),
                    'patrimonio_natural': rec.get('Patr. natural', '').strip(),
                    'leis_rppn': rec.get('RPPN', '').strip(),
                    'leis_pnm': rec.get('PNM', '').strip(),
                    'leis_mona': rec.get('MONA', '').strip(),
                    'leis_apa': rec.get('APA', '').strip(),
                    'leis_rebio': rec.get('REBIO', '').strip(),
                    'orgao_ambiental': rec.get('Órgão ambiental', '').strip(),
                    'telefone': rec.get('Telefone', '').strip(),
                    'observacoes': rec.get('Observações', '').strip(),
                    'tem_plano_diretor': tem_plano_diretor,
                    'tem_saneamento': tem_saneamento,
                    'tem_recursos_hidricos': tem_recursos_hidricos,
                    'tem_politica_ambiental': tem_politica_ambiental,
                    'tem_conselho_ma': tem_conselho_ma,
                    'tem_fundo_ma': tem_fundo_ma,
                    'tem_fundacao_secretaria': tem_fundacao_secretaria,
                    'indice_governanca': score,
                    'lat': lat,
                    'lng': lng
                }
                leg_data.append(item)
                
        with open(os.path.join(output_dir, 'legislacao_municipal.json'), 'w', encoding='utf-8') as f:
            json.dump(leg_data, f, ensure_ascii=False, indent=2)
        print(f"Saved legislacao_municipal.json with {len(leg_data)} items")

        # 5. PROCESS 'RPPNS' SHEET
        rppns_data = []
        rppns_raw = sheet_rows.get('RPPNS', [])
        if rppns_raw:
            header = rppns_raw[0]
            col_map = {k: v.strip() for k, v in header.items()}
            for idx, r in enumerate(rppns_raw[1:], start=1):
                rec = {col_map.get(k, k): v.strip() for k, v in r.items() if k in col_map}
                nome_rppn = rec.get('UNIDADE', '').strip()
                if not nome_rppn:
                    continue
                mun = rec.get('MUNICÍPIO', '').strip()
                lat, lng, mun_nome, mesorregiao = find_coordinates(mun)
                
                item = {
                    'id': f"RPPN-{idx}",
                    'nome': nome_rppn,
                    'ente_federativo': rec.get('ENTE FEDERATIVO', '').strip(),
                    'ano': clean_year(rec.get('ANO')),
                    'ato_legislativo': rec.get('ATO LEGISLATIVO', '').strip(),
                    'municipio': mun,
                    'mesorregiao': mesorregiao,
                    'area_ha': clean_number(rec.get('ÁREA')),
                    'lat': lat,
                    'lng': lng
                }
                rppns_data.append(item)
                
        with open(os.path.join(output_dir, 'rppns.json'), 'w', encoding='utf-8') as f:
            json.dump(rppns_data, f, ensure_ascii=False, indent=2)
        print(f"Saved rppns.json with {len(rppns_data)} items")

        # 6. PROCESS 'Terras Indígenas' SHEET
        ti_data = []
        ti_raw = sheet_rows.get('Terras Indígenas', [])
        if ti_raw:
            header = ti_raw[0]
            col_map = {k: v.strip() for k, v in header.items()}
            for idx, r in enumerate(ti_raw[1:], start=1):
                rec = {col_map.get(k, k): v.strip() for k, v in r.items() if k in col_map}
                nome_ti = rec.get('ÁREAS PROTEGIDAS NÃO ENQUADRADAS NO SNUC', '').strip()
                if not nome_ti:
                    continue
                loc = rec.get('LOCALIZAÇÃO', '').strip()
                lat, lng, mun_nome, mesorregiao = find_coordinates(loc)
                
                item = {
                    'id': f"TI-{idx}",
                    'nome': nome_ti,
                    'ato_criacao_status': rec.get('ATO DE CRIAÇÃO', '').strip(),
                    'area_ha': clean_number(rec.get('ÁREA')),
                    'localizacao': loc,
                    'mesorregiao': mesorregiao,
                    'observacoes': rec.get('Coluna1', '').strip(),
                    'lat': lat,
                    'lng': lng
                }
                ti_data.append(item)
                
        with open(os.path.join(output_dir, 'terras_indigenas.json'), 'w', encoding='utf-8') as f:
            json.dump(ti_data, f, ensure_ascii=False, indent=2)
        print(f"Saved terras_indigenas.json with {len(ti_data)} items")

        # 7. PROCESS 'Quilombolas' SHEET
        quilombo_data = []
        quilombo_raw = sheet_rows.get('Quilombolas', [])
        if quilombo_raw:
            header = quilombo_raw[0]
            col_map = {k: v.strip() for k, v in header.items()}
            for idx, r in enumerate(quilombo_raw[1:], start=1):
                rec = {col_map.get(k, k): v.strip() for k, v in r.items() if k in col_map}
                comunidade = rec.get('Comunidade', '').strip()
                if not comunidade:
                    continue
                loc = rec.get('Localização', '').strip()
                lat, lng, mun_nome, mesorregiao = find_coordinates(loc)
                
                item = {
                    'id': f"QUILOMBO-{idx}",
                    'processo_incra': rec.get('Nº Processo', '').strip(),
                    'comunidade': comunidade,
                    'localizacao': loc,
                    'mesorregiao': mesorregiao,
                    'area_ha': clean_number(rec.get('Área')),
                    'edital_rtid_dou': rec.get('Edital RTID no DOU', '').strip(),
                    'portaria_dou': rec.get('Portaria no DOU', '').strip(),
                    'lat': lat,
                    'lng': lng
                }
                quilombo_data.append(item)
                
        with open(os.path.join(output_dir, 'quilombolas.json'), 'w', encoding='utf-8') as f:
            json.dump(quilombo_data, f, ensure_ascii=False, indent=2)
        print(f"Saved quilombolas.json with {len(quilombo_data)} items")

        # 8. PROCESS 'Leg. Estadual' SHEET
        leg_est_data = []
        leg_est_raw = sheet_rows.get('Leg. Estadual', [])
        if leg_est_raw:
            header = leg_est_raw[0]
            col_map = {k: v.strip() for k, v in header.items()}
            for idx, r in enumerate(leg_est_raw[1:], start=1):
                rec = {col_map.get(k, k): v.strip() for k, v in r.items() if k in col_map}
                ementa = rec.get('EMENTA', '').strip()
                if not ementa:
                    continue
                item = {
                    'id': f"LEGEST-{idx}",
                    'tipo': rec.get('TIPO', '').strip(),
                    'numero': rec.get('Nº', '').strip(),
                    'ano': clean_year(rec.get('ANO')),
                    'ementa': ementa
                }
                leg_est_data.append(item)
                
        with open(os.path.join(output_dir, 'legislacao_estadual.json'), 'w', encoding='utf-8') as f:
            json.dump(leg_est_data, f, ensure_ascii=False, indent=2)
        print(f"Saved legislacao_estadual.json with {len(leg_est_data)} items")

        # 9. PROCESS 'População Mesorregião' SHEET
        pop_data = []
        pop_raw = sheet_rows.get('População Mesorregião', []) or sheet_rows.get(' População Mesorregião', [])
        if pop_raw:
            current_meso = "OESTE"
            for r in pop_raw:
                vals = list(r.values())
                txt = " ".join(vals)
                if 'Mesorregião' in txt:
                    match = re.search(r'Mesorregião\s+([A-ZÀ-Ú\s]+)', txt, re.IGNORECASE)
                    if match:
                        current_meso = match.group(1).strip()
                micro = r.get('B', '').strip()
                if micro and 'Microrregião' not in micro and 'Mesorregião' not in micro and 'Total' not in micro:
                    total_mun = clean_number(r.get('C', ''))
                    pop = clean_number(r.get('D', ''))
                    if pop > 0:
                        pop_data.append({
                            'mesorregiao': current_meso.title(),
                            'microrregiao': micro,
                            'total_municipios': int(total_mun),
                            'populacao_2022': int(pop)
                        })
                        
        with open(os.path.join(output_dir, 'populacao_mesorregiao.json'), 'w', encoding='utf-8') as f:
            json.dump(pop_data, f, ensure_ascii=False, indent=2)
        print(f"Saved populacao_mesorregiao.json with {len(pop_data)} items")

        # 10. GENERATE AGGREGATE SUMMARY & KPIS
        total_ucs = len(ucs_data)
        total_area_ha = sum(u['area_ha'] for u in ucs_data)
        total_area_km2 = round(total_area_ha / 100.0, 2)
        sc_area_total_km2 = 95730.0 # Total area of Santa Catarina
        pct_cobertura = round((total_area_km2 / sc_area_total_km2) * 100.0, 2)
        
        ucs_cnuc = sum(1 for u in ucs_data if u['cnuc'])
        ucs_fora_cnuc = total_ucs - ucs_cnuc
        
        ucs_com_pm = sum(1 for u in ucs_data if u['plano_manejo'])
        ucs_com_cg = sum(1 for u in ucs_data if u['conselho_gestor'])
        
        categorias_agg = {}
        for u in ucs_data:
            c = u['categoria']
            categorias_agg[c] = categorias_agg.get(c, 0) + 1
            
        esferas_agg = {}
        for u in ucs_data:
            e = u['esfera']
            esferas_agg[e] = esferas_agg.get(e, {'count': 0, 'area_ha': 0})
            esferas_agg[e]['count'] += 1
            esferas_agg[e]['area_ha'] += u['area_ha']
            
        grupos_agg = {}
        for u in ucs_data:
            g = u['grupo']
            grupos_agg[g] = grupos_agg.get(g, {'count': 0, 'area_ha': 0})
            grupos_agg[g]['count'] += 1
            grupos_agg[g]['area_ha'] += u['area_ha']

        # Temporal breakdown (by decade)
        temporal_agg = {}
        for u in ucs_data:
            ano = u['ano_criacao']
            if ano:
                dec = f"{ano // 10 * 10}s"
                temporal_agg[dec] = temporal_agg.get(dec, 0) + 1

        summary = {
            'total_ucs': total_ucs,
            'total_area_ha': round(total_area_ha, 2),
            'total_area_km2': total_area_km2,
            'sc_area_total_km2': sc_area_total_km2,
            'pct_cobertura_sc': pct_cobertura,
            'ucs_no_cnuc': ucs_cnuc,
            'ucs_fora_cnuc': ucs_fora_cnuc,
            'ucs_com_plano_manejo': ucs_com_pm,
            'pct_plano_manejo': round((ucs_com_pm / total_ucs) * 100.0, 1) if total_ucs else 0,
            'ucs_com_conselho_gestor': ucs_com_cg,
            'pct_conselho_gestor': round((ucs_com_cg / total_ucs) * 100.0, 1) if total_ucs else 0,
            'total_terras_indigenas': len(ti_data),
            'area_ti_ha': round(sum(t['area_ha'] for t in ti_data), 2),
            'total_quilombolas': len(quilombo_data),
            'area_quilombolas_ha': round(sum(q['area_ha'] for q in quilombo_data), 2),
            'total_rppns': len(rppns_data),
            'area_rppns_ha': round(sum(r['area_ha'] for r in rppns_data), 2),
            'total_municipios_sc': len(leg_data),
            'esferas': esferas_agg,
            'grupos': grupos_agg,
            'categorias': categorias_agg,
            'decadas': temporal_agg,
            'ultima_atualizacao': '2026-08-21T09:45:00'
        }

        with open(os.path.join(output_dir, 'summary.json'), 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        print("Saved summary.json successfully!")

if __name__ == '__main__':
    source_file = 'UCs de SC-completo.xlsx'
    if not os.path.exists(source_file):
        source_file = 'downloaded_from_gsheets.xlsx'
    process_all_data(source_file, 'public/data')
    process_all_data(source_file, 'data_processed')
