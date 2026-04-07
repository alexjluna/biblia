#!/bin/bash
# ============================================
# Despliegue de Biblia App en VPS Ubuntu/Debian
# Dominio: santabiblia.es
# Rama: pro
# ============================================

set -e

DOMAIN="santabiblia.es"
APP_DIR="/var/www/biblia"
REPO="https://github.com/alexjluna/biblia.git"
BRANCH="main"

echo "=========================================="
echo " Desplegando Biblia App en $DOMAIN"
echo "=========================================="

# 1. Actualizar sistema e instalar dependencias
echo "[1/7] Actualizando sistema..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# 2. Instalar Node.js 20 LTS
echo "[2/7] Instalando Node.js 20..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo "Node.js $(node -v) instalado"

# 3. Instalar PM2 (process manager)
echo "[3/7] Instalando PM2..."
sudo npm install -g pm2

# 4. Clonar repositorio
echo "[4/7] Clonando repositorio..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
git clone -b $BRANCH $REPO $APP_DIR
cd $APP_DIR

# 5. Instalar dependencias, crear DB, y compilar
echo "[5/7] Instalando dependencias y compilando..."
npm install
npx tsx scripts/seed-db.ts
npm run build

# 6. Configurar Nginx
echo "[6/7] Configurando Nginx..."
sudo tee /etc/nginx/sites-available/biblia > /dev/null <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/biblia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 7. Iniciar app con PM2
echo "[7/7] Iniciando app con PM2..."
cd $APP_DIR
pm2 start npm --name "biblia" -- start
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ""
echo "=========================================="
echo " App desplegada en http://$DOMAIN"
echo "=========================================="
echo ""
echo " Siguiente paso: configurar SSL con:"
echo " sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
