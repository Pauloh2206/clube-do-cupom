#!/bin/bash

# Script de Instalação Automatizada - Clube do Cupom
# Autor: Paulo Hernani Costa
# Descrição: Instala e configura o Clube do Cupom na VPS (diretório /var)

set -e  # Para o script se houver erro

echo "=========================================="
echo "  INSTALAÇÃO CLUBE DO CUPOM - VPS"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Verificar se está rodando como root ou com sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root ou com sudo"
    exit 1
fi

echo "PASSO 1: Atualizando sistema..."
apt update && apt upgrade -y
print_success "Sistema atualizado"
echo ""

echo "PASSO 2: Instalando dependências..."
apt install -y nodejs npm nginx git curl
print_success "Dependências instaladas"
echo ""

echo "PASSO 3: Instalando pnpm..."
npm install -g pnpm
print_success "pnpm instalado"
echo ""

echo "PASSO 4: Clonando repositório..."
cd /var
if [ -d "clube-do-cupom" ]; then
    print_info "Diretório clube-do-cupom já existe. Removendo..."
    rm -rf clube-do-cupom
fi
git clone https://github.com/Pauloh2206/clube-do-cupom.git
cd clube-do-cupom
print_success "Repositório clonado em /var/clube-do-cupom"
echo ""

echo "PASSO 5: Configurando variáveis de ambiente..."
print_info "IMPORTANTE: Você precisa configurar o arquivo .env manualmente!"
print_info "Execute: sudo nano /var/clube-do-cupom/.env"
print_info "E adicione: API_KEY=sua_chave_api_gemini_aqui"
echo ""

# Criar arquivo .env de exemplo
cat > .env << 'EOF'
# Configure sua chave API do Gemini aqui
# Obtenha em: https://aistudio.google.com/app/apikey
API_KEY=sua_chave_api_gemini_aqui
EOF
print_success "Arquivo .env criado (PRECISA SER EDITADO!)"
echo ""

echo "PASSO 6: Instalando dependências do projeto..."
pnpm install
print_success "Dependências instaladas"
echo ""

echo "PASSO 7: Fazendo build do projeto..."
pnpm build
print_success "Build concluído"
echo ""

echo "PASSO 8: Configurando Nginx..."

# Perguntar sobre domínio
read -p "Você tem um domínio configurado? (s/n): " tem_dominio

if [ "$tem_dominio" = "s" ] || [ "$tem_dominio" = "S" ]; then
    read -p "Digite seu domínio (ex: meusite.com): " dominio
    
    cat > /etc/nginx/sites-available/clube-do-cupom << EOF
server {
    listen 80;
    server_name $dominio www.$dominio;

    root /var/clube-do-cupom/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
EOF
else
    cat > /etc/nginx/sites-available/clube-do-cupom << 'EOF'
server {
    listen 80;
    server_name _;

    root /var/clube-do-cupom/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
EOF
fi

# Ativar site
ln -sf /etc/nginx/sites-available/clube-do-cupom /etc/nginx/sites-enabled/

# Remover site padrão
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Testar configuração
nginx -t
if [ $? -eq 0 ]; then
    print_success "Configuração do Nginx OK"
else
    print_error "Erro na configuração do Nginx"
    exit 1
fi

# Reiniciar Nginx
systemctl restart nginx
print_success "Nginx configurado e reiniciado"
echo ""

echo "PASSO 9: Configurando firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
echo "y" | ufw enable
print_success "Firewall configurado"
echo ""

echo "PASSO 10: Ajustando permissões..."
chown -R www-data:www-data /var/clube-do-cupom
chmod -R 755 /var/clube-do-cupom
print_success "Permissões ajustadas"
echo ""

echo "=========================================="
echo "  INSTALAÇÃO CONCLUÍDA!"
echo "=========================================="
echo ""
print_success "O Clube do Cupom foi instalado com sucesso!"
echo ""
print_info "PRÓXIMOS PASSOS:"
echo "1. Configure o arquivo .env com sua chave API:"
echo "   sudo nano /var/clube-do-cupom/.env"
echo ""
echo "2. Depois de configurar o .env, faça rebuild:"
echo "   cd /var/clube-do-cupom"
echo "   sudo pnpm build"
echo "   sudo systemctl restart nginx"
echo ""
echo "3. Acesse seu site:"
if [ "$tem_dominio" = "s" ] || [ "$tem_dominio" = "S" ]; then
    echo "   http://$dominio"
    echo ""
    echo "4. Configure SSL (HTTPS):"
    echo "   sudo apt install -y certbot python3-certbot-nginx"
    echo "   sudo certbot --nginx -d $dominio -d www.$dominio"
else
    IP=$(hostname -I | awk '{print $1}')
    echo "   http://$IP"
fi
echo ""
print_info "Para ver os logs:"
echo "   sudo tail -f /var/log/nginx/access.log"
echo "   sudo tail -f /var/log/nginx/error.log"
echo ""
print_success "Instalação finalizada! 🚀"
