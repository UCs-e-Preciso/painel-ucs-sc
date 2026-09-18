# 📜 Changelog: Painel de UCs de Santa Catarina

Todas as mudanças relevantes e versões do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.2.0](https://github.com/UCs-e-Preciso/painel-ucs-sc/compare/ucs-sc-dashboard-v1.1.0...ucs-sc-dashboard-v1.2.0) (2026-09-18)


### Features

* add admin upload page for updating dataset directly to github ([3b45417](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/3b45417ef1ae9f934fc3b83f3e868f45e4b96fcc))
* adiciona barra de busca em tempo real no mapa e painel completo de controle de camadas (esfera, grupo, cnuc, socioambiental e cartografia) ([5537e08](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/5537e082fd74c3731c60113c1a79a8d11bd884db))
* adiciona camada e filtros de mesorregioes e territorios de SC no mapa ([ad29e5d](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/ad29e5d4ce2e0eaddd8ee7f3a6bfcc73ab5649ba))
* adiciona camada superior para marcadores, halo pulsante e efeito visual completo de selecao ao clicar ([b24eb40](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/b24eb4037289b672f9486848a30d42f93ec227b1))
* adiciona destaque visual interativo, expansao e tooltips no hover dos marcadores de UCs ([b5ff520](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/b5ff52036823a9495bd97993b7828de962e8384e))
* adicionar versionamento automático baseado na main ([181e840](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/181e8409142eab53a82014d722e3ce011388919d))
* **admin:** aprimorar pagina de upload, corrigir repoOwner e atualizar para v1.1.0 ([8d2cafe](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/8d2cafe209a88e52237f6cb6aada0e7721ea9013))
* aprimora botoes e visibilidade do painel de camadas com presets rapidos e chevrons ([9cae0b8](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/9cae0b8b4b55214b50b4aa6d3aab179cf3219aa3))
* **data:** configura conversão automatizada da planilha para json via actions ([f180ad8](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/f180ad8371be785d988f227f71c986f5cb810d12))
* hover highlight em cidades e regioes com tooltip flutuante e zoom animado ([f251b21](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/f251b219d3ca68b72764feebead9f5c520994e5e))
* Painel de Unidades de Conservacao de SC (CNUC) ([ab9708f](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/ab9708f20037b2b8394d0e3d0488db3eb18d866d))
* **ui:** criar componente CustomSelect com animacao suave de expansao e substituir selects nativos ([6b1f855](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/6b1f8550efc7b1933635d160d47904c946ff253e))


### Bug Fixes

* address PR review feedback for admin upload flow ([f845e60](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/f845e6047c8ce1887124f967e8b09452a4f05a53))
* adiciona pointer-events: none nos tooltips e regras CSS :hover estaveis nos poligonos ([28569a3](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/28569a3cbce8e90a47b4d43ce96597f5fca2109e))
* **ci:** regenerate app data and docs after spreadsheet upload ([6cd61f3](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/6cd61f349830ee10b3499080e7085c36ed0976cd))
* conecta visibilidade do painel de camadas ao botao toggle para expandir e recolher os filtros ([27175e3](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/27175e3f51c0b68ea6c5a20bdde97caefb104687))
* **dashboard:** exibir nome completo de categorias, adicionar realce interativo em gráficos de pizza e remover bordas de foco ([b17f61a](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/b17f61a2b2eb8673ec53a9517e633147dd2e6c85))
* elimina cortes de texto e porcentagens nos graficos da visao geral ([618d517](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/618d5170bc78bd902e29f92f3a9b2c2c993ded48))
* elimina flickering no hover das cidades mantendo destaque estavel ([1082203](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/1082203a7c06bf8b133cf5bd2f5d1bcb0afa6817))
* elimina travamento de tooltips ao arrastar e mover o mapa interativo ([df29b95](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/df29b95c3a86309cabfc6880c0569e80c4b5c768))
* estabiliza camada GeoJSON com highlights instantaneos ao passar o mouse e selecao regional ([abf83d1](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/abf83d1cd3b5f0a18c63291fed6f41478040e01f))
* geocoding aprimorado com 100% das UCs mapeadas e dispersao espacial ([e46422b](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/e46422b89b3d7684efb5cd8876ea3a8303fbef61))
* remove destaque da UC selecionada ao clicar no municipio ou fora do mapa ([9cbdd10](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/9cbdd1043dc7e33a7c3ff9348840b799aabfad6d))
* resolve pointer-events e enriquece GeoJSON com nomes oficiais e tooltips fluidos ([073ce84](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/073ce84918eda00129388ded955f2114fa933c6e))
* restaura arrasto e zoom fluidos do Leaflet sem bloqueios no container ([2a3dee7](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/2a3dee7417615acc6c09e5383171853a7b19da85))
* **ui:** corrigir sobreposição do cabeçalho com a barra de filtros ao rolar a tela ([19d5dac](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/19d5dac330474258771aa5c4794328589565926d))
* **ui:** corrigir stacking context, overflow clipping e abertura inteligente dos dropdowns ([3614855](https://github.com/UCs-e-Preciso/painel-ucs-sc/commit/3614855ba7ff7c67099ca94198b28cd0d77df951))

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
