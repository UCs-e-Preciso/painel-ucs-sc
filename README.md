# 🌲 Painel de Unidades de Conservação de Santa Catarina (UCs de SC)

> **Observatório Estadual de Áreas Protegidas, Governança Ambiental Municipal e Unidades de Conservação**  
> Inspirado no painel oficial do **[CNUC / Ministério do Meio Ambiente (MMA)](https://cnuc.mma.gov.br/powerbi)** e integrado à planilha do Google Sheets.

---

## 🎯 Sobre o Projeto

Este projeto é uma aplicação web analítica e geoespacial de alta performance desenvolvida para fornecer um diagnóstico completo das **Unidades de Conservação (UCs)** e áreas protegidas no Estado de Santa Catarina.

O sistema integra dados cadastrais oficiais, diagnósticos de campo, situação de regularização junto ao CNUC federal, infraestrutura legislativa de todos os 295 municípios catarinenses, além de Terras Indígenas, Comunidades Quilombolas e Reservas Particulares do Patrimônio Natural (RPPNs).

---

## 🚀 Principais Funcionalidades

1. **🌲 Visão Geral & KPIs (Estilo CNUC/MMA)**
   - Total de UCs, Área Total Protegida (ha e km²), % de Cobertura do Território Catarinense.
   - Status de Planos de Manejo e Conselhos Gestores.
   - Gráficos de Esfera Administrativa (*Municipal, Estadual, Federal*), Grupos do SNUC (*Proteção Integral vs Uso Sustentável*) e linha do tempo histórica de criação.

2. **🗺️ Mapa Geoespacial Interativo de Santa Catarina**
   - Malha vetorial oficial dos **295 municípios catarinenses** (IBGE GeoJSON).
   - Marcadores inteligentes de UCs com popups detalhados.
   - Alternância de camadas: *Densidade de UCs, RPPNs, Terras Indígenas e Comunidades Quilombolas*.
   - Painel lateral dinâmico de diagnóstico municipal ao clicar em qualquer cidade.

3. **📋 Diagnóstico de Regularização (Roteiro & Não SNUC)**
   - Acompanhamento das UCs municipais com pendências no CNUC.
   - Diagnóstico dos principais gargalos: delimitação territorial, plano de manejo e atos legais.

4. **🏛️ Governança & Legislação Ambiental Municipal (295 Municípios)**
   - Matriz comparativa de maturidade jurídica e institucional:
     - Plano Diretor
     - Conselho Municipal de Meio Ambiente (COMDEMA)
     - Fundo Municipal de Meio Ambiente
     - Secretaria / Fundação de Meio Ambiente
     - Leis municipais específicas (APAs, RPPNs, Parques)
     - Telefones e contatos dos órgãos ambientais.

5. **🌿 Mosaico Socioambiental**
   - Aba exclusiva para **44 Terras Indígenas**, **10 Comunidades Quilombolas** e **137 RPPNs**.

6. **🔍 Explorador Dinâmico & Exportação**
   - Tabela interativa com busca full-text instantânea, paginação e ordenação multicritério.
   - Modal com ficha técnica completa de cada UC e links diretos para Atos de Criação e Planos de Manejo.
   - Exportação dos dados filtrados para **Excel (`.xlsx`)** e **CSV**.

7. **🔄 Sincronização ao Vivo com Google Sheets**
   - Botão no cabeçalho para sincronizar diretamente com a planilha pública do projeto no Google Sheets:
     `https://docs.google.com/spreadsheets/d/1nCkAPo3RVINOzlyTt0pBBoAZ_P84becD/edit?usp=sharing`
   - Suporte para upload manual de planilhas `.xlsx` locais.
   - Fallback offline automático (0ms de tempo de carregamento).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Estilização**: Tailwind CSS, Lucide Icons, Glassmorphism
- **Visualização de Dados**: Recharts
- **Mapas Interativos**: Leaflet, React-Leaflet, IBGE SC GeoJSON
- **Manipulação de Planilhas**: SheetJS (`xlsx`)

---

## 📦 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Instalação e Execução

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Gerar build otimizado de produção
npm run build

# 4. Visualizar build de produção localmente
npm run preview
```

O dashboard estará disponível em: `http://localhost:3000` (ou `http://localhost:4173`).

---

## 📊 Atualização de Dados (ETL)

Para reprocessar a planilha local `UCs de SC-completo.xlsx` e gerar os arquivos JSON otimizados:

```bash
python scripts_process_data.py
```

---

## 📄 Licença e Fontes

- **Fonte dos Dados**: Projeto de Levantamento de UCs de Santa Catarina • Planilha Google Sheets.
- **Referência Metodológica**: Cadastro Nacional de Unidades de Conservação (CNUC / MMA) e Instituto do Meio Ambiente de Santa Catarina (IMA-SC).
- **Cartografia**: Instituto Brasileiro de Geografia e Estatística (IBGE).
