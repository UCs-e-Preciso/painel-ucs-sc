# 📜 Changelog: Painel de UCs de Santa Catarina

Todas as mudanças relevantes e versões do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-08-21

### ✨ Adicionado
- **Visão Geral (Estilo CNUC/MMA)**:
  - KPIs centrais: total de UCs (288+), área protegida (~1,35M ha / ~13.500 km²), % de cobertura estadual (~13,7%), planos de manejo e conselhos gestores.
  - Gráficos de rosca/barras de Esfera Administrativa (Municipal, Estadual, Federal) e Grupos SNUC (Proteção Integral vs Uso Sustentável).
  - Linha do tempo histórica de criação de UCs por década desde 1960.
  - Top categorias de manejo em Santa Catarina (RPPNs, Parques, APAs, REBIOs, FLONAs, etc.).
- **Mapa Interativo Geoespacial**:
  - Malha vetorial oficial dos 295 municípios de SC do IBGE (GeoJSON).
  - Marcadores de UCs com popups detalhados e alternância de cores por esfera, grupo ou status no CNUC.
  - Camadas comutáveis para RPPNs (137), Terras Indígenas (44) e Comunidades Quilombolas (10).
  - Painel lateral de diagnóstico e lista de UCs por município.
- **Diagnóstico CNUC & Roteiro Municipal**:
  - Acompanhamento das 99 UCs municipais com pendências de cadastro no CNUC.
  - Mapeamento das 62 áreas protegidas municipais não enquadradas no SNUC.
- **Governança Municipal (295 Municípios)**:
  - Matriz comparativa de Plano Diretor, COMDEMA, Fundo de Meio Ambiente, Órgão Ambiental e leis específicas de UCs.
  - Modal de detalhes jurídicos e contato por município.
- **Mosaico Socioambiental**:
  - Aba exclusiva para 44 Terras Indígenas, 10 Quilombos e 137 RPPNs.
- **Explorador Dinâmico de UCs**:
  - Tabela com filtros globais multicritério, busca textual instantânea, paginação e ordenação por colunas.
  - Modal de ficha técnica completa com links para atos de criação e planos de manejo.
  - Exportação de dados filtrados para Excel (`.xlsx`) e CSV.
- **Demografia & Território**:
  - Cruzamento com população do Censo IBGE 2022 por mesorregião e acervo de legislação estadual de SC.
- **Infraestrutura & Integração**:
  - Conector ao vivo com a planilha do Google Sheets via API de exportação.
  - Suporte a upload manual de arquivos `.xlsx` no navegador.
  - Fallback offline integrado em `public/data/`.
  - Suporte a temas Claro / Escuro (Dark Mode).
  - Configuração de CI/CD para GitHub Pages via `.github/workflows/deploy.yml` e branch `gh-pages`.
