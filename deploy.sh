#!/bin/bash
# ════════════════════════════════════════════════════════════
# AnimaCare Admin — VPS Deploy Script
# Ubuntu 22.04 / 24.04
# Usage: curl -sL https://raw.github.com/.../deploy.sh | bash
# Or:    chmod +x deploy.sh && ./deploy.sh
# ════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="admin.animacare.global"
APP_DIR="/opt/animacare"
REPO="https://github.com/thienmocduc/animacare-admin.git"
GREEN='\033[0;32m' YELLOW='\033[1;33m' RED='\033[0;31m' NC='\033[0m'

info()  { echo -e "${GREEN}▶ $*${NC}"; }
warn()  { echo -e "${YELLOW}⚠ $*${NC}"; }
error() { echo -e "${RED}✗ $*${NC}"; exit 1; }

# ── 0. Check root ─────────────────────────────────────────
[[ $EUID -eq 0 ]] || error "Run as root: sudo bash deploy.sh"

info "AnimaCare Admin VPS Setup — $(date)"
info "Target domain: $DOMAIN"

# ── 1. System updates ─────────────────────────────────────
info "1/8 Updating system..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Install Docker ─────────────────────────────────────
if ! command -v docker &>/dev/null; then
  info "2/8 Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker && systemctl start docker
else
  info "2/8 Docker already installed: $(docker --version)"
fi

# ── 3. Install dependencies ───────────────────────────────
info "3/8 Installing dependencies..."
apt-get install -y -qq git certbot ufw fail2ban curl jq

# ── 4. Firewall ───────────────────────────────────────────
info "4/8 Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
ufw status

# ── 5. Fail2ban ───────────────────────────────────────────
info "5/8 Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = 22
filter  = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
EOF
systemctl restart fail2ban

# ── 6. SSL Certificate ────────────────────────────────────
info "6/8 Getting SSL certificate..."
mkdir -p $APP_DIR/nginx/ssl

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email "admin@animacare.global" \
    -d "$DOMAIN" \
    || warn "Certbot failed — continuing with self-signed"

  if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    warn "Creating self-signed cert for development..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout $APP_DIR/nginx/ssl/privkey.pem \
      -out    $APP_DIR/nginx/ssl/fullchain.pem \
      -subj "/CN=$DOMAIN"
  fi
fi

# Copy certs
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/nginx/ssl/
  cp /etc/letsencrypt/live/$DOMAIN/privkey.pem   $APP_DIR/nginx/ssl/
fi

# SSL auto-renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem $APP_DIR/nginx/ssl/ && docker-compose -f $APP_DIR/docker-compose.yml restart nginx") | crontab -

# ── 7. App setup ──────────────────────────────────────────
info "7/8 Setting up application..."
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or pull
if [ -d ".git" ]; then
  git pull origin main
else
  git clone $REPO . || {
    warn "Repo not accessible — creating minimal structure"
  }
fi

# Create .env if not exists
if [ ! -f ".env" ]; then
  cp .env.example .env 2>/dev/null || cat > .env << EOF
POSTGRES_DB=animacare
POSTGRES_USER=animacare
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9!@#$' | head -c 32)
JWT_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
REDIS_PASSWORD=$(openssl rand -base64 24)
NODE_ENV=production
CORS_ORIGIN=https://$DOMAIN
ADMIN_EMAIL=admin@animacare.global
EOF
  warn "Generated .env — CHECK AND UPDATE before running!"
  cat .env
fi

# ── 8. Start services ─────────────────────────────────────
info "8/8 Starting Docker services..."
docker-compose pull 2>/dev/null || true
docker-compose up -d --build

# Wait for health
info "Waiting for services to start..."
for i in {1..30}; do
  if curl -sf http://localhost:4000/health >/dev/null 2>&1; then
    info "✅ Backend healthy!"
    break
  fi
  sleep 2
done

# DB seed prompt
echo ""
read -p "Seed database with sample data? [y/N] " SEED
if [[ $SEED =~ ^[Yy]$ ]]; then
  docker-compose exec backend node src/db/seed.js
  info "✅ Database seeded"
fi

# ── Summary ───────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ AnimaCare Admin deployed!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "  🌐 URL:    https://$DOMAIN"
echo "  📊 Admin:  https://$DOMAIN/login.html"
echo "  🔍 API:    https://$DOMAIN/api/v1/health"
echo "  📁 App:    $APP_DIR"
echo ""
echo "  Default login:"
echo "  Email:    admin@animacare.global"
echo "  Password: Admin@2026!"
echo ""
echo -e "${YELLOW}  ⚠️  CHANGE THE DEFAULT PASSWORD IMMEDIATELY!${NC}"
echo ""
echo "  Logs:     docker-compose -f $APP_DIR/docker-compose.yml logs -f"
echo "  Restart:  docker-compose -f $APP_DIR/docker-compose.yml restart"
echo ""
