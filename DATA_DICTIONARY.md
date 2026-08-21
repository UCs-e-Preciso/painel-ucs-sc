# 📖 Dicionário de Dados: Unidades de Conservação de Santa Catarina

Este documento descreve detalhadamente a estrutura, os campos, tipos de dados, regras de normalização e significado de todas as **13 abas** presentes na planilha oficial do projeto (`UCs de SC-completo.xlsx` e Google Sheets).

---

## 📑 Índice das Abas

1. [`UCs`](#1-aba-ucs-base-principal) - Cadastro Principal de Unidades de Conservação
2. [`Roteiro`](#2-aba-roteiro-diagnóstico-de-regularização-municipal) - Diagnóstico e Gestão de Contatos de UCs Municipais
3. [`N SNUC`](#3-aba-n-snuc-áreas-não-enquadradas-no-snuc) - Áreas Protegidas Municipais Não Enquadradas no SNUC
4. [`Legislação`](#4-aba-legislação-matriz-ambiental-dos-295-municípios) - Governança Ambiental dos 295 Municípios de SC
5. [`RPPNS`](#5-aba-rppns-reservas-particulares-do-patrimônio-natural) - Reservas Particulares em SC
6. [`Terras Indígenas`](#6-aba-terras-indígenas) - Territórios Indígenas
7. [`Quilombolas`](#7-aba-quilombolas) - Comunidades Quilombolas e Processos INCRA
8. [`Leg. Estadual`](#8-aba-leg-estadual) - Leis e Decretos Estaduais de SC
9. [`População Mesorregião`](#9-aba-população-mesorregião) - População por Mesorregiões e Microrregiões (IBGE 2022)
10. [`Proporção territorial (%)`](#10-aba-proporção-territorial-) - Proporções de Área Protegida por Esfera
11. [`Dicionário`](#11-aba-dicionário) - Glossário de Siglas e Categorias do SNUC
12. [`referências`](#12-aba-referências) - Fontes e Links Documentais
13. [`Planilha2`](#13-aba-planilha2) - Atualizações e Novas UCs

---

## 1. Aba `UCs` (Base Principal)

Contém o cadastro consolidado de todas as Unidades de Conservação federais, estaduais e municipais em território catarinense (~288 a 310 registros).

| Coluna Original | Nome no JSON | Tipo | Descrição & Regras de Normalização | Exemplo |
| :--- | :--- | :--- | :--- | :--- |
| `ID_UC` | `id` | `String` | Identificador único da UC no cadastro. | `UC-SC-1` |
| `CÓDIGO_UC` | `codigo_cnuc` | `String` | Código numérico oficial no sistema CNUC/MMA. | `0000.42.0001` |
| `Nome da UC` | `nome` | `String` | Nome oficial completo da Unidade de Conservação. | `Parque Nacional de São Joaquim` |
| `Esfera Administrativa` | `esfera` | `Enum` | Esfera governamental: `Federal`, `Estadual` ou `Municipal`. | `Federal` |
| `Grupo` | `grupo` | `Enum` | Grupo segundo a Lei do SNUC: `Proteção Integral` ou `Uso Sustentável`. | `Proteção Integral` |
| `Categoria de Manejo` | `categoria` | `String` | Categoria de manejo (*Parque, APA, RPPN, REBIO, FLONA, Monumento Natural, ARIE, etc.*). | `Parque Nacional` |
| `CNUC?` | `cnuc` | `Boolean` | Indica se a UC está cadastrada formalmente no CNUC (`true` para S/SIM, `false` para N/NÃO). | `true` |
| `Ano de Criação` | `ano_criacao` | `Number` | Ano em que o ato legal de criação foi promulgado. | `1961` |
| `Ano do ato legal mais recente` | `ano_ato_recente` | `Number` | Ano do decreto ou lei de alteração/regulamentação mais recente. | `2018` |
| `ato de criação` | `ato_criacao` | `String` | Número e tipo do ato de criação (*Decreto, Lei, Portaria*). | `Decreto Federal nº 50.922` |
| `Outros atos legais` | `outros_atos` | `String` | Atos de ampliação, regulamentação, termos de ajustamento de conduta (TAC). | `Decreto s/n de 20/05/2016` |
| `Municípios abrangidos` | `municipios` | `String` | Lista de municípios em que a UC está localizada. | `Urubici, São Joaquim, Bom Jardim da Serra` |
| `Área Ato Legal de Criação` | `area_ha` | `Number` | Área oficial em hectares (ha) normalizada numericamente. | `49800.0` |
| `Soma de Área (Km²)` | `area_km2` | `Number` | Área convertida em quilômetros quadrados (ha / 100). | `498.0` |
| `Bioma declarado` | `bioma` | `String` | Bioma predominante (*Mata Atlântica, Zona Costeira e Marinha*). | `Mata Atlântica` |
| `Plano de manejo` | `plano_manejo` | `Boolean` | Existência de Plano de Manejo formalmente aprovado (`true`/`false`). | `true` |
| `INSTRUMENTO PLANO DE MANEJO` | `plano_manejo_detalhe` | `String` | Portaria ou instrumento de aprovação do Plano de Manejo. | `Portaria ICMBio nº 124/2018` |
| `LINK PLANO DE MANEJO` | `link_plano_manejo` | `String` | URL direta para o documento digital do Plano de Manejo. | `https://...` |
| `Conselho gestor` | `conselho_gestor` | `Boolean` | Existência de Conselho Gestor consultivo ou deliberativo (`true`/`false`). | `true` |
| `Órgão gestor` | `orgao_gestor` | `String` | Órgão governamental responsável (*ICMBio, IMA-SC, Fundação Municipal*). | `ICMBio` |
| `LINK PARA ATO DE CRIAÇÃO` | `link_ato_criacao` | `String` | URL para o Diário Oficial ou texto integral do decreto/lei. | `http://...` |
| `MAPA` | `link_mapa` | `String` | Link para mapa georreferenciado ou shapefile. | `http://...` |
| `observações` | `observacoes` | `String` | Notas técnicas e diagnóstico de campo. | `Em processo de revisão de limites` |
| `Encaminhamentos` | `encaminhamentos` | `String` | Ações e encaminhamentos recomendados. | `Solicitar ao município ata de posse` |

---

## 2. Aba `Roteiro` (Diagnóstico de Regularização Municipal)

Registra o diagnóstico de campo e acompanhamento de **99 UCs municipais** com pendências de inclusão no CNUC federal.

| Coluna Original | Nome no JSON | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `Nome da UC` | `nome` | `String` | Nome da Unidade de Conservação Municipal. |
| `Categoria de Manejo` | `categoria` | `String` | Categoria de manejo pretendida ou instituída. |
| `Esfera Administrativa` | `esfera` | `String` | Esfera administrativa (`Municipal`). |
| `Município` | `municipio` | `String` | Município catarinense responsável. |
| `Ato de criação` | `ato_criacao` | `String` | Lei ou decreto municipal instituidor. |
| `Porque não está no CNUC?` | `motivo_fora_cnuc` | `String` | Causa diagnosticada (*falta de limites definidos, ausência de plano de manejo, destituição*). |
| `Limites definidos` | `limites_definidos` | `String` | Diagnóstico sobre a demarcação cartográfica e limites perimetrais. |
| `Plano de Manejo?` | `plano_manejo` | `String` | Status da elaboração do plano de manejo municipal. |
| `Conselho Gestor?` | `conselho_gestor` | `String` | Status de formação do conselho gestor. |
| `Data do contato` | `data_contato` | `String` | Registro da data de contato com a prefeitura / fundação de meio ambiente. |

---

## 3. Aba `N SNUC` (Áreas Não Enquadradas no SNUC)

Reúne **62 áreas protegidas municipais** que possuem alguma proteção local (mananciais, morros, áreas verdes), mas não cumprem os requisitos formais da Lei Federal nº 9.985/2000 (SNUC).

| Coluna Original | Nome no JSON | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `UC MUNICIPAL` | `nome` | `String` | Nome da área protegida municipal. |
| `Categoria` | `categoria` | `String` | Tipo de área (*APP, Área de Preservação, Parque Histórico, etc.*). |
| `ANO DE CRIAÇÃO` | `ano_criacao` | `Number` | Ano do decreto ou ato instituidor. |
| `ATO DE CRIAÇÃO` | `ato_criacao` | `String` | Decreto ou lei municipal instituidora. |
| `MUNICÍPIO` | `municipio` | `String` | Cidade de Santa Catarina onde se localiza. |
| `ÁREA (ha)` | `area_ha` | `Number` | Área declarada em hectares. |
| `Observação` | `observacao` | `String` | Histórico e contexto da área. |
| `Encaminhamentos` | `encaminhamentos` | `String` | Providências jurídicas ou técnicas recomendadas. |

---

## 4. Aba `Legislação` (Matriz Ambiental dos 295 Municípios)

Diagnóstico institucional e legislativo de **todos os 295 municípios do Estado de Santa Catarina**.

| Coluna Original | Nome no JSON | Tipo | Descrição & Pontuação no Índice |
| :--- | :--- | :--- | :--- |
| `MUNICÍPIOS de SC` | `municipio` | `String` | Nome oficial do município catarinense. |
| `Plano diretor` | `plano_diretor` | `String` | Lei Complementar instituidora do Plano Diretor municipal (+2 pontos no índice). |
| `Parcelamento` | `parcelamento` | `String` | Lei de uso e ocupação do solo / parcelamento urbano. |
| `Saneamento` | `saneamento` | `String` | Lei e plano municipal de saneamento básico (+1 ponto). |
| `recursos Hídricos` | `recursos_hidricos` | `String` | Legislação de proteção de mananciais e recursos hídricos (+1 ponto). |
| `Política ambiental` | `politica_ambiental` | `String` | Código Ambiental Municipal ou Política Municipal de Meio Ambiente (+2 pontos). |
| `Secretaria MA` / `Fundação MA` | `secretaria_ma` | `String` | Existência de órgão executivo municipal dedicado ao meio ambiente (+1 ponto). |
| `Conselho MA` | `conselho_ma` | `String` | Lei de criação do Conselho Municipal de Meio Ambiente - COMDEMA (+2 pontos). |
| `Fundo MA` | `fundo_ma` | `String` | Lei de instituição do Fundo Municipal de Meio Ambiente (+1 ponto). |
| `RPPN` / `PNM` / `APA` | `leis_especificas` | `String` | Leis municipais para criação de categorias de UCs. |
| `Órgão ambiental` | `orgao_ambiental` | `String` | Nome formal do órgão ambiental municipal. |
| `Telefone` | `telefone` | `String` | Telefone de contato da secretaria / fundação ambiental. |
| `Observações` | `observacoes` | `String` | Anotações de contato e horários de atendimento. |

---

## 5. Aba `RPPNS` (Reservas Particulares do Patrimônio Natural)

Reúne **137 RPPNs** reconhecidas no Estado de Santa Catarina por diferentes esferas.

| Coluna Original | Nome no JSON | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `UNIDADE` | `nome` | `String` | Nome da Reserva Particular do Patrimônio Natural. |
| `ENTE FEDERATIVO` | `ente_federativo` | `String` | Esfera que reconheceu a RPPN (*UNIÃO, ESTADO ou MUNICÍPIO*). |
| `ANO` | `ano` | `Number` | Ano de reconhecimento da portaria. |
| `ATO LEGISLATIVO` | `ato_legislativo` | `String` | Portaria e publicação no Diário Oficial. |
| `MUNICÍPIO` | `municipio` | `String` | Município onde a reserva está sediada. |
| `ÁREA` | `area_ha` | `Number` | Área da reserva em hectares. |

---

## 6. Aba `Terras Indígenas`

Contém **44 áreas de Terras Indígenas** mapeadas em Santa Catarina.

| Coluna Original | Nome no JSON | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `ÁREAS PROTEGIDAS...` | `nome` | `String` | Nome da Terra Indígena (ex.: *TI Morro dos Cavalos, TI Xapecó*). |
| `ATO DE CRIAÇÃO` | `ato_criacao_status`| `String` | Situação fundiária (*Regularizada, Declarada, Em estudo, Sem providência*). |
| `ÁREA` | `area_ha` | `Number` | Área declarada em hectares. |
| `LOCALIZAÇÃO` | `localizacao` | `String` | Município(s) de localização em SC. |

---

## 7. Aba `Quilombolas`

Contém as **10 Comunidades Quilombolas** com processos abertos no INCRA em Santa Catarina.

| Coluna Original | Nome no JSON | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `Nº Processo` | `processo_incra` | `String` | Número do processo administrativo no INCRA. |
| `Comunidade` | `comunidade` | `String` | Nome da Comunidade Quilombola (ex.: *Invernada dos Negros*). |
| `Localização` | `localizacao` | `String` | Município catarinense onde a comunidade se localiza. |
| `Área` | `area_ha` | `Number` | Área do território quilombola em hectares. |
| `Edital RTID no DOU` | `edital_rtid_dou` | `String` | Data de publicação do Relatório Técnico de Identificação e Delimitação. |
| `Portaria no DOU` | `portaria_dou` | `String` | Data de publicação da Portaria de Reconhecimento. |

---

## 8. Aba `Leg. Estadual`

Normas e leis de âmbito estadual sobre conservação da natureza em SC (**109 registros**).

| Coluna Original | Nome no JSON | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `TIPO` | `tipo` | `String` | Tipo do ato (*LEI, DEC, PORTARIA*). |
| `Nº` | `numero` | `String` | Número do ato normativo. |
| `ANO` | `ano` | `Number` | Ano de publicação da norma. |
| `EMENTA` | `ementa` | `String` | Síntese do conteúdo da norma (ex.: *Código Estadual do Meio Ambiente*). |

---

## 9. Aba `População Mesorregião`

Dados demográficos oficiais do Censo IBGE 2022 por mesorregiões e microrregiões de Santa Catarina.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `mesorregiao` | `String` | Mesorregião de SC (*Oeste, Norte, Vale do Itajaí, Grande Florianópolis, Sul, Serrana*). |
| `microrregiao` | `String` | Microrregião geográfica do IBGE. |
| `total_municipios` | `Number` | Quantidade de municípios pertencentes à microrregião. |
| `populacao_2022` | `Number` | População residente recenseada no Censo 2022. |
