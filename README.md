# AnimaCare Admin Platform — Full Stack

## Stack
- **Backend:** Node.js + Express + PostgreSQL 16 + Redis
- **Frontend:** Single-page HTML + Vanilla JS (no framework)
- **Auth:** JWT (15m access) + Refresh tokens (7d, rotated)
- **Deploy:** Docker Compose + Nginx + SSL

---

## Quick Start (Local)

```bash
# 1. Clone + setup env
cp .env.example .env
# Edit .env — change passwords!

# 2. Start everything
docker-compose up -d

# 3. Database auto-initializes from init.sql
# Default admin: admin@animacare.global / Admin@2026!
# CHANGE THIS IMMEDIATELY

# 4. Open admin
open http://localhost
```

---

## API Endpoints — All 15 Modules

| Module | Base Path | Methods |
|--------|-----------|---------|
| Auth | `/api/v1/auth` | POST login/refresh/logout, GET me |
| Dashboard | `/api/v1/dashboard` | GET kpis, chart/revenue, chart/centers, activity, stock-alerts, today-bookings |
| Centers | `/api/v1/centers` | GET, GET/:id, POST, PUT/:id |
| Customers | `/api/v1/customers` | GET, GET/:id, GET/stats, POST, PUT/:id |
| Bookings | `/api/v1/bookings` | GET, GET/:id, POST, PUT/:id, PATCH/:id/status, DELETE/:id |
| Technicians | `/api/v1/technicians` | GET, POST |
| Orders | `/api/v1/orders` | GET, GET/:id, POST, PATCH/:id/status |
| Inventory | `/api/v1/inventory` | GET, PATCH/:id, POST/adjust |
| Franchise | `/api/v1/franchise` | GET/POST partners, PATCH partners/:id/status, GET/POST/PATCH royalties |
| AI Engine | `/api/v1/ai` | GET sessions, GET stats, POST sessions |
| Academy | `/api/v1/academy` | GET courses, GET/POST enrollments, PATCH enrollments/:id/progress |
| Revenue | `/api/v1/revenue` | GET summary, GET by-center, GET arr-forecast |
| Blog/CMS | `/api/v1/blog` | GET, GET/:id, POST, PUT/:id, PATCH/:id/publish, DELETE/:id |
| Users | `/api/v1/users` | GET, POST, PATCH/:id |
| Analytics | `/api/v1/analytics` | GET funnel, GET retention, GET top-services |

---

## Auth Flow

```
POST /api/v1/auth/login
{ email, password }
→ { access_token (15m), refresh_token (7d), user }

# Auto-refresh: api-client.js handles this transparently
# On 401 TOKEN_EXPIRED → POST /auth/refresh → retry original request
```

---

## RBAC Roles
| Role | Permissions |
|------|-------------|
| `superadmin` | Full access |
| `admin` | All except delete |
| `manager` | Own center only, no financial data |
| `staff` | Own center bookings only |
| `franchise_owner` | Own center read-only |

---

## File Structure

```
animacare-admin/
├── docker-compose.yml
├── .env.example
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js           # Express entry point
│       ├── db/
│       │   ├── pool.js         # PG pool + transaction helper
│       │   └── init.sql        # Full schema + seeds
│       ├── middleware/
│       │   ├── auth.js         # JWT + RBAC + audit
│       │   └── error.js        # Global error handler
│       ├── utils/
│       │   └── logger.js       # Winston
│       └── routes/
│           ├── auth.js
│           ├── dashboard.js
│           ├── bookings.js
│           ├── inventory.js
│           ├── franchise.js
│           ├── _crud.js        # centers/customers/technicians/orders
│           └── _modules.js     # ai/academy/revenue/blog/users/analytics
└── frontend/
    ├── admin.html              # Main SPA (with API scripts injected)
    ├── api-client.js           # ApiClient class — all 15 modules
    └── live-data.js            # Override render functions → live API
```

---

## Production Deploy (VPS Ubuntu)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Get SSL cert (Let's Encrypt)
apt install certbot
certbot certonly --standalone -d admin.animacare.global
cp /etc/letsencrypt/live/admin.animacare.global/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/admin.animacare.global/privkey.pem nginx/ssl/

# Edit .env with production values
# Start
docker-compose up -d --build

# Logs
docker-compose logs -f backend
```

---

## Security Checklist
- [ ] Change default admin password immediately
- [ ] Set strong JWT_SECRET (32+ chars random)
- [ ] Update CORS_ORIGIN to actual domain
- [ ] Enable SSL in production
- [ ] Set up automated DB backups
- [ ] Configure SMTP for alerts
- [ ] Review rate limits for your traffic
