# Clube do Cupom

Aplicação web que encontra e exibe cupons e promoções em tempo real para Uber, 99, iFood, Rappi, Mercado Livre e Magazine Luiza usando a API Gemini. Possui uma interface limpa e responsiva com filtros e cópia fácil de códigos.

## Estrutura do Projeto

```
clube-do-cupom/
├── index.html              # Arquivo HTML principal
├── index.tsx               # Ponto de entrada do React
├── App.tsx                 # Componente principal da aplicação
├── types.ts                # Definições de tipos TypeScript
├── metadata.json           # Metadados do projeto
├── components/             # Componentes React
│   ├── Header.tsx
│   ├── Filters.tsx
│   ├── CouponCard.tsx
│   ├── SkeletonCard.tsx
│   └── LoadingSpinner.tsx
└── services/               # Serviços e integrações
    └── geminiService.ts    # Integração com API Gemini
```

## Tecnologias Utilizadas

- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Biblioteca de ícones
- **Google Generative AI** - API Gemini para busca de cupons
- **Vite** - Build tool e dev server (recomendado para produção)

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (versão 18 ou superior)
- npm ou pnpm
- Chave de API do Google Gemini

## Configuração Local

### 1. Instalar Dependências

```bash
cd clube-do-cupom
npm install
# ou
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
API_KEY=sua_chave_api_gemini_aqui
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
# ou
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

## Deploy na VPS

### Opção 1: Deploy com Vite + Nginx (Recomendado)

#### Passo 1: Preparar o Servidor VPS

Conecte-se à sua VPS via SSH:

```bash
ssh usuario@seu-servidor.com
```

Atualize o sistema e instale as dependências:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx git
```

Instale o pnpm globalmente (opcional, mas recomendado):

```bash
sudo npm install -g pnpm
```

#### Passo 2: Clonar o Projeto

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/clube-do-cupom.git
cd clube-do-cupom
```

#### Passo 3: Configurar Variáveis de Ambiente

Crie o arquivo `.env` com sua chave API:

```bash
sudo nano .env
```

Adicione:

```
API_KEY=sua_chave_api_gemini_aqui
```

Salve com `Ctrl+O`, Enter, e saia com `Ctrl+X`.

#### Passo 4: Instalar Dependências e Build

```bash
sudo pnpm install
sudo pnpm build
```

Isso criará uma pasta `dist` com os arquivos estáticos otimizados.

#### Passo 5: Configurar Nginx

Crie um arquivo de configuração para o site:

```bash
sudo nano /etc/nginx/sites-available/clube-do-cupom
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    root /var/www/clube-do-cupom/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configuração para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Segurança adicional
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compressão gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

Ative o site e teste a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/clube-do-cupom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Passo 6: Configurar SSL com Let's Encrypt (Opcional mas Recomendado)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções do Certbot. Ele configurará automaticamente o SSL e redirecionará HTTP para HTTPS.

#### Passo 7: Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Opção 2: Deploy com PM2 + Node.js

Se preferir usar um servidor Node.js ao invés de arquivos estáticos:

#### Passo 1: Instalar PM2

```bash
sudo npm install -g pm2
```

#### Passo 2: Criar servidor Node.js simples

Crie um arquivo `server.js` na raiz do projeto:

```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Passo 3: Instalar Express e iniciar com PM2

```bash
sudo pnpm add express
sudo pnpm build
pm2 start server.js --name clube-do-cupom
pm2 startup
pm2 save
```

#### Passo 4: Configurar Nginx como Proxy Reverso

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Atualização do Site

Para atualizar o site após fazer alterações:

```bash
cd /var/www/clube-do-cupom
sudo git pull origin main
sudo pnpm install
sudo pnpm build
sudo systemctl restart nginx
```

Se estiver usando PM2:

```bash
pm2 restart clube-do-cupom
```

## Monitoramento e Logs

### Logs do Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Logs do PM2 (se aplicável)

```bash
pm2 logs clube-do-cupom
pm2 monit
```

## Solução de Problemas

### Erro 502 Bad Gateway

- Verifique se o serviço está rodando: `pm2 status` ou `sudo systemctl status nginx`
- Verifique os logs do Nginx: `sudo tail -f /var/log/nginx/error.log`

### Erro de Permissão

```bash
sudo chown -R www-data:www-data /var/www/clube-do-cupom
sudo chmod -R 755 /var/www/clube-do-cupom
```

### Variáveis de Ambiente não Carregam

Certifique-se de que o arquivo `.env` está na raiz do projeto e tem as permissões corretas:

```bash
sudo chmod 600 .env
```

## Segurança

- **Nunca commite** o arquivo `.env` no Git
- Adicione `.env` ao `.gitignore`
- Use HTTPS em produção
- Mantenha as dependências atualizadas: `pnpm update`
- Configure backups regulares do servidor

## Suporte

Para problemas ou dúvidas, entre em contato com Paulo Hernani Costa.

## Licença

Este projeto é de propriedade privada. Todos os direitos reservados.
