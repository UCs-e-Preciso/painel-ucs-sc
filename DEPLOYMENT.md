# 🚀 Guia de Implantação e Deploy: Painel de UCs de Santa Catarina

Este guia apresenta todas as formas de publicar e hospedar a aplicação web do **Painel de Unidades de Conservação de Santa Catarina**.

Como o projeto é compilado para **HTML, CSS e JavaScript puros (100% estáticos)** com caminhos relativos (`base: './'`), ele pode ser executado em qualquer provedor de hospedagem estática ou servidor web tradicional sem necessidade de servidores Node.js em produção.

---

## 📑 Métodos de Hospedagem Suportados

1. [GitHub Pages (Recomendado & Ativo)](#1-github-pages-recomendado--ativo)
2. [Vercel](#2-vercel)
3. [Netlify](#3-netlify)
4. [Docker & Nginx](#4-docker--nginx)
5. [Servidor Web Local ou Intranet (Apache / Nginx / Caddy)](#5-servidor-web-local-ou-intranet)

---

## 1. GitHub Pages (Recomendado & Ativo)

O repositório já está configurado para publicar diretamente no GitHub Pages.

### Opção A: Deploy via branch `gh-pages` (Puro Estático)
1. Certifique-se de que a branch `gh-pages` está atualizada:
   ```bash
   npm run build:docs
   git add .
   git commit -m "chore: build de producao"
   git push origin main
   git subtree push --prefix docs origin gh-pages
   ```
2. No GitHub: acesse `Settings > Pages > Build and deployment > Source: Deploy from a branch > Branch: gh-pages / (root)`.
3. O site estará acessível em: `https://rafaelst97.github.io/painel-ucs-sc/`.

### Opção B: Deploy Automático via GitHub Actions
O arquivo `.github/workflows/deploy.yml` já está configurado. Basta ativar:
1. No GitHub: acesse `Settings > Pages > Build and deployment > Source: GitHub Actions`.
2. A cada novo `git push` na branch `main`, o GitHub fará a compilação e publicação automática!

---

## 2. Vercel

Para hospedar na Vercel (com CDN global ultrarrápida):

1. Instale a CLI da Vercel (`npm i -g vercel`) ou conecte o repositório pelo dashboard da [Vercel](https://vercel.com).
2. Configurações de Build:
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
3. O deploy será instantâneo com suporte automático a HTTPS e domínio personalizado.

---

## 3. Netlify

Para hospedar na Netlify:

1. Conecte o repositório no painel do [Netlify](https://www.netlify.com/).
2. Configurações de Build:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
3. Clique em **Deploy Site**.

---

## 4. Docker & Nginx

Para empacotar a aplicação em um container Docker leve com Nginx:

### Crie um arquivo `Dockerfile` na raiz do projeto:
```dockerfile
# Estágio 1: Compilação
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: Servidor Nginx estático
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Comandos de execução Docker:
```bash
# Construir a imagem Docker
docker build -t painel-ucs-sc .

# Executar o container na porta 8080
docker run -d -p 8080:80 --name ucs-sc-app painel-ucs-sc
```
Acesse em: `http://localhost:8080`.

---

## 5. Servidor Web Local ou Intranet

Para rodar em redes internas ou servidores locais:

### Usando Nginx:
Aponte o `root` do bloco `server` para a pasta `/var/www/painel-ucs-sc/dist`:
```nginx
server {
    listen 80;
    server_name ucs.meudominio.gov.br;

    root /var/www/painel-ucs-sc/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Usando Python HTTP Server (Apenas para testes):
```bash
cd dist
python -m http.server 8000
```
Acesse em: `http://localhost:8000`.
