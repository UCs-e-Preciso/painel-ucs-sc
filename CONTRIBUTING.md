# 🤝 Guia de Contribuição: Painel de UCs de Santa Catarina

Agradecemos o seu interesse em contribuir com o **Painel de Unidades de Conservação de Santa Catarina**! Este documento orienta como colaborar com melhorias no código, novas funcionalidades e correções nos dados das UCs.

---

## 🧭 Como Você Pode Contribuir

1. **Atualização de Dados**: Correção de nomes, áreas, atos legais de criação, coordenadas geográficas ou inclusão de novas UCs municipais.
2. **Novas Visualizações**: Criação de novos gráficos, cruzamentos espaciais e relatórios analíticos.
3. **Melhorias de Interface (UI/UX)**: Acessibilidade, responsividade para dispositivos móveis e otimizações de performance.
4. **Correção de Bugs**: Identificação e resolução de problemas técnicos na plataforma.

---

## 🛠️ Ambiente de Desenvolvimento

### 1. Clonar e Instalar

```bash
# Clone o repositório forkado
git clone https://github.com/SEU_USUARIO/painel-ucs-sc.git
cd painel-ucs-sc

# Instale as dependências
npm install
```

### 2. Executar Localmente

```bash
npm run dev
```
O servidor iniciará em `http://localhost:3000`.

---

## 🔄 Como Atualizar ou Adicionar Dados

Se você adicionar novas linhas na planilha do Excel (`UCs de SC-completo.xlsx`):

1. Execute o script de extração e normalização:
   ```bash
   python scripts_process_data.py
   ```
2. O script atualizará os arquivos em `public/data/` e `data_processed/`.
3. Verifique se a aplicação carrega os novos dados corretamente com `npm run dev`.

---

## 📐 Padrões de Código

* **TypeScript**: Tipagem estrita é obrigatória. Não utilize `any` a menos que estritamente necessário.
* **Componentes React**: Utilize componentes funcionais com hooks (`useState`, `useMemo`, `useCallback`, `useContext`).
* **Estilização**: Utilize **Tailwind CSS** mantendo a consistência do design system (paleta verde/esmeralda para UCs, azul para esferas, roxo para federal e laranja para alertas/TIs).
* **Ícones**: Utilize a biblioteca `lucide-react`.

---

## 📋 Fluxo de Pull Requests (PR)

1. Crie uma branch para sua funcionalidade ou correção:
   ```bash
   git checkout -b feature/minha-melhoria
   ```
2. Faça commits descritivos seguindo o padrão Conventional Commits:
   * `feat: adiciona filtro por bacia hidrografica`
   * `fix: corrige calculo de area protegida da APA do Rio Vermelho`
   * `docs: atualiza dicionario de dados`
3. Execute o build para garantir que não há erros de tipagem:
   ```bash
   npm run build:docs
   ```
4. Envie sua branch para o GitHub e abra um **Pull Request**.
