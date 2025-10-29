# Guia Rápido de Deploy - Clube do Cupom

## 📋 Checklist Pré-Deploy

- [ ] Chave API do Google Gemini
- [ ] Acesso SSH à VPS
- [ ] Domínio configurado (opcional)
- [ ] Node.js 18+ instalado na VPS

## 🚀 Deploy Rápido (5 minutos)

### 1. Conectar à VPS

```bash
ssh usuario@seu-servidor.com
```

### 2. Instalar Dependências do Sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx git
sudo # npm (já vem com Node.js)
```

### 3. Clonar e Configurar Projeto

```bash
cd /var/www
sudo git clone https://github.com/seu-usuario/clube-do-cupom.git
cd clube-do-cupom
sudo nano .env
```

Adicione no arquivo `.env`:
```
API_KEY=sua_chave_api_gemini_aqui
```

### 4. Build do Projeto

```bash
sudo npm install
sudo npm run build
```

### 5. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/clube-do-cupom
```

Cole esta configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    root /var/www/clube-do-cupom/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

### 6. Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/clube-do-cupom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### 8. SSL (Opcional mas Recomendado)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## ✅ Pronto!

Seu site está no ar em `http://seu-dominio.com` (ou `https://` se configurou SSL)

## 🔄 Atualizar Site

```bash
cd /var/www/clube-do-cupom
sudo git pull
sudo npm install
sudo npm run build
sudo systemctl restart nginx
```

## 📊 Verificar Status

```bash
# Status do Nginx
sudo systemctl status nginx

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🆘 Problemas Comuns

### Erro 403 Forbidden
```bash
sudo chown -R www-data:www-data /var/www/clube-do-cupom
sudo chmod -R 755 /var/www/clube-do-cupom
```

### Erro 502 Bad Gateway
```bash
sudo systemctl restart nginx
sudo nginx -t
```

### Site não carrega
```bash
# Verificar se o Nginx está rodando
sudo systemctl status nginx

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 📝 Notas Importantes

- **Nunca commite** o arquivo `.env` no GitHub
- Mantenha backups regulares
- Monitore os logs regularmente
- Atualize as dependências periodicamente

## 🔐 Segurança

- Use sempre HTTPS em produção
- Configure firewall corretamente
- Mantenha o sistema atualizado
- Use senhas fortes para SSH

## 📞 Suporte

Para dúvidas, consulte o arquivo `README.md` completo ou entre em contato com Paulo Hernani Costa.
