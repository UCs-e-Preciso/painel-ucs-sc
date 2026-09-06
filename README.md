# 🌲 Painel de Unidades de Conservação de Santa Catarina (UCs de SC)

[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Online-22c55e?style=for-the-badge&logo=github)](https://rafaelst97.github.io/painel-ucs-sc/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Observatório Estadual de Áreas Protegidas, Governança Ambiental Municipal e Unidades de Conservação**  
> Inspirado no painel oficial do **[CNUC / Ministério do Meio Ambiente (MMA)](https://cnuc.mma.gov.br/powerbi)** e integrado à planilha oficial do Google Sheets.

---

## 🌐 Acesso Rápido

* 🚀 **Dashboard Online no GitHub Pages**: [https://rafaelst97.github.io/painel-ucs-sc/](https://rafaelst97.github.io/painel-ucs-sc/)
* 📁 **Repositório GitHub**: [https://github.com/rafaelst97/painel-ucs-sc](https://github.com/rafaelst97/painel-ucs-sc)
* 📊 **Planilha Fonte (Google Sheets)**: [Acessar Google Docs](https://docs.google.com/spreadsheets/d/1nCkAPo3RVINOzlyTt0pBBoAZ_P84becD/edit?usp=sharing)

---

## 📑 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Módulos do Sistema](#-módulos-do-sistema)
- [Arquitetura & Tecnologias](#-arquitetura--tecnologias)
- [Instalação e Execução Local](#-instalação-e-execução-local)
- [Pipeline de Dados (ETL)](#-pipeline-de-dados-etl)
- [Publicação no GitHub Pages](#-publicação-no-github-pages)
- [Documentação Detalhada](#-documentação-detalhada)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **Painel de UCs de Santa Catarina** é uma plataforma analítica e geoespacial interativa de alto desempenho desenvolvida para diagnosticar, monitorar e visualizar a situação das **Unidades de Conservação (UCs)** e áreas protegidas em Santa Catarina.

O sistema reúne dados de esferas **Federal**, **Estadual** e **Municipal**, cruzando status de regularização no Cadastro Nacional de Unidades de Conservação (CNUC), maturidade de governança jurídica dos 295 municípios catarinenses, além de **Terras Indígenas**, **Comunidades Quilombolas** e **Reservas Particulares do Patrimônio Natural (RPPNs)**.

---

## 🚀 Principais Funcionalidades

* 📊 **Indicadores & KPIs em Tempo Real**: Mais de 288 UCs mapeadas, somando mais de 1,35 milhão de hectares (~13,7% do território catarinense).
* 🗺️ **Mapa Geoespacial Interativo com 295 Municípios**: Limites cartográficos vetoriais oficiais do IBGE com marcadores e alternância de camadas (*UCs, RPPNs, TIs e Quilombos*).
* 📋 **Diagnóstico de Regularização (Roteiro & Não SNUC)**: Acompanhamento detalhado das UCs municipais fora do CNUC e identificação dos gargalos legais e fundiários.
* 🏛️ **Matriz de Governança Municipal**: Indicadores de Plano Diretor, COMDEMA, Fundo de Meio Ambiente e Órgãos Ambientais em todos os 295 municípios de SC.
* 🌿 **Mosaico Socioambiental**: 44 Terras Indígenas, 10 Comunidades Quilombolas e 137 RPPNs com áreas e atos legais.
* 🔍 **Explorador & Exportação**: Tabela dinâmica com filtros combinados, modal de ficha técnica completa e exportação para **Excel (`.xlsx`)** e **CSV**.
* 🔄 **Sincronização com Google Sheets**: Conector ao vivo com a planilha do Google Docs + fallback offline com carregamento instantâneo em 0ms.
* 🌓 **Modo Escuro / Claro**: Suporte automático e manual ao tema Dark/Light.

---

## 🖥️ Módulos do Sistema

| Ícone | Módulo | Descrição |
| :---: | :--- | :--- |
| 🌲 | **Visão Geral** | KPIs centrais, proporção territorial, gráficos de esferas, grupos SNUC e linha do tempo histórica. |
| 🗺️ | **Mapa Interativo** | Visualização geoespacial com malha do IBGE, coroplético de densidade e painel de diagnóstico lateral. |
| 📋 | **Diagnóstico CNUC** | Roteiro de regularização de 99 UCs municipais e 62 áreas não enquadradas no SNUC. |
| 🏛️ | **Legislação Municipal** | Quadro comparativo de maturidade jurídica e contatos ambientais das 295 cidades catarinenses. |
| 🌿 | **Mosaico Socioambiental** | Mapeamento de Terras Indígenas (TIs), Quilombos e RPPNs. |
| 🔍 | **Explorador de UCs** | Tabela com busca full-text, ordenação multicritério, ficha completa e exportação para Excel/CSV. |
| 📊 | **Demografia & Território** | Cruzamento com a população do Censo IBGE 2022 por mesorregião e legislação estadual de SC. |

---

## 🛠️ Arquitetura & Tecnologias

* **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
* **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide React](https://lucide.dev/)
* **Gráficos**: [Recharts](https://recharts.org/)
* **Mapas**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) + GeoJSON IBGE Santa Catarina
* **Processamento de Planilhas**: [SheetJS (xlsx)](https://sheetjs.com/) + [PapaParse](https://www.papaparse.com/)
* **Pipeline ETL**: Python 3.13 (`scripts/process_data.py`)

---

## 💻 Instalação e Execução Local

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)
* [Python](https://www.python.org/) 3.10+ (opcional, para reprocessamento de dados)

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone https://github.com/rafaelst97/painel-ucs-sc.git
cd painel-ucs-sc

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm run dev

# 4. Compilar para produção (gera pasta dist/ e docs/)
npm run build:docs

# 5. Visualizar o build de produção localmente
npm run preview
```

Abra no navegador: `http://localhost:3000` (ou `http://localhost:4173`).

---

## 📊 Pipeline de Dados (ETL)

Para reprocessar a planilha local em `data_raw/UCs de SC-completo.xlsx` ou os dados baixados do Google Sheets e atualizar todos os arquivos JSON:

```bash
npm run sync-data
# ou: python scripts/process_data.py
```

Os arquivos JSON normalizados são gravados em `public/data/` e `data_processed/`.

---

## 🔄 Sincronização Diária (SharePoint / GitHub Actions)

O projeto possui um fluxo automatizado (via GitHub Actions) para baixar a planilha atualizada diretamente do SharePoint e convertê-la em um JSON estático, resolvendo questões de CORS e autenticação. A rotina roda todos os dias às 03:00 UTC.

Para configurar essa automação no seu repositório:
1. Vá até a aba **Settings** > **Secrets and variables** > **Actions**.
2. Adicione os seguintes *Repository secrets*:
   - `MS_TENANT_ID`: ID do seu diretório Entra ID.
   - `MS_CLIENT_ID`: ID do aplicativo registrado.
   - `MS_CLIENT_SECRET`: Segredo do aplicativo.
   - `MS_SHAREPOINT_HOSTNAME`: Domínio do SharePoint (ex: *universidade.sharepoint.com*).
*(Consulte o arquivo `.env.example` para detalhes adicionais de configuração e personalização).*

---

## 🚀 Publicação no GitHub Pages

O projeto está configurado para publicar **exclusivamente os arquivos estáticos puros (HTML/CSS/JS)**:

```bash
# Recompila e atualiza os arquivos estáticos na pasta docs/
npm run build:docs

# Envia as alterações para o branch main e gh-pages
git add .
git commit -m "update: atualizacao do painel"
git push origin main
git subtree push --prefix docs origin gh-pages
```

---

## 📚 Documentação Detalhada

* 📖 [**Dicionário de Dados** (`DATA_DICTIONARY.md`)](./DATA_DICTIONARY.md) - Estrutura de todas as 13 abas da planilha e campos.
* 🏛️ [**Arquitetura do Sistema** (`ARCHITECTURE.md`)](./ARCHITECTURE.md) - Diagrama de fluxo de dados, componentes e serviços.
* 🚀 [**Guia de Implantação / Deploy** (`DEPLOYMENT.md`)](./DEPLOYMENT.md) - GitHub Pages, Vercel, Netlify e Docker.
* 🤝 [**Guia de Contribuição** (`CONTRIBUTING.md`)](./CONTRIBUTING.md) - Como colaborar, padrões de código e commits.
* 📜 [**Histórico de Versões** (`CHANGELOG.md`)](./CHANGELOG.md) - Registro de versões e funcionalidades.

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT** - consulte o arquivo [LICENSE](./LICENSE) para obter detalhes.
