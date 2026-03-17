-- ════════════════════════════════════════════════════════
-- AnimaCare Global · Database Schema v1.0
-- PostgreSQL 16
-- ════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────────────────
-- ENUM TYPES
-- ─────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('superadmin','admin','manager','staff','franchise_owner');
CREATE TYPE center_type AS ENUM ('direct','franchise_full','franchise_lite');
CREATE TYPE center_status AS ENUM ('active','setup','maintenance','closed');
CREATE TYPE booking_status AS ENUM ('pending','confirmed','in_progress','completed','cancelled','no_show');
CREATE TYPE customer_constitution AS ENUM ('moc','hoa','tho','kim','thuy','unknown');
CREATE TYPE order_status AS ENUM ('pending','confirmed','processing','shipped','delivered','cancelled','refunded');
CREATE TYPE payment_method AS ENUM ('cod','bank_transfer','momo','vnpay','stripe');
CREATE TYPE ktv_level AS ENUM ('L1','L2','L3','L4');
CREATE TYPE ktv_status AS ENUM ('active','inactive','on_leave');
CREATE TYPE franchise_status AS ENUM ('prospect','negotiation','signed','active','suspended');
CREATE TYPE inventory_unit AS ENUM ('hop','goi','ml','g','cai');
CREATE TYPE stock_alert AS ENUM ('ok','low','critical','out');
CREATE TYPE revenue_tier AS ENUM ('T1','T2','T3','T4','T5','T6','T7','T8');

-- ─────────────────────────────────────────────────────────
-- MODULE 1: AUTHENTICATION & USERS
-- ─────────────────────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(255) NOT NULL,
  staff_code  VARCHAR(20) UNIQUE,
  role        user_role NOT NULL DEFAULT 'staff',
  center_id   UUID,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_staff_code ON users(staff_code);

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OTP verification codes (for admin login 2FA)
CREATE TABLE otp_codes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code        VARCHAR(6) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  purpose     VARCHAR(50) NOT NULL DEFAULT 'admin_login',
  attempts    INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  expires_at  TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_user_purpose ON otp_codes(user_id, purpose, created_at DESC);
CREATE INDEX idx_otp_expires ON otp_codes(expires_at);

-- Seed superadmin (password: Admin@2026! — change immediately)
-- Staff code: SA001 (can login with this ID instead of email)
-- Admin email for OTP: doanhnhancaotuan@gmail.com
INSERT INTO users (email, password, full_name, role, staff_code) VALUES
('doanhnhancaotuan@gmail.com','$2b$12$wS/p1VXX5z0TnFcR.HoqoeInWmA7KrBvf7V.m00P/DpBZHqzrFwwy','Superadmin','superadmin','SA001');

-- ─────────────────────────────────────────────────────────
-- MODULE 2: CENTERS (Cơ sở)
-- ─────────────────────────────────────────────────────────
CREATE TABLE centers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         VARCHAR(20) UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  city         VARCHAR(100) NOT NULL,
  district     VARCHAR(100),
  address      TEXT NOT NULL,
  lat          DECIMAL(10,7),
  lng          DECIMAL(10,7),
  type         center_type NOT NULL DEFAULT 'franchise_lite',
  status       center_status NOT NULL DEFAULT 'setup',
  rooms        SMALLINT NOT NULL DEFAULT 4,
  phone        VARCHAR(20),
  email        VARCHAR(255),
  owner_id     UUID REFERENCES users(id),
  rating       DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  opened_at    DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed centers
INSERT INTO centers (code,name,city,district,address,lat,lng,type,status,rooms,phone,rating) VALUES
('C001','Anima Care Thanh Liệt','Hà Nội','Hoàng Mai','286 Nguyễn Xiển',20.9730,105.8412,'direct','active',8,'0913156676',4.9),
('C002','Anima Care Cầu Giấy','Hà Nội','Cầu Giấy','15 Trần Thái Tông',21.0310,105.7969,'franchise_full','setup',6,NULL,0),
('C003','Anima Care Đống Đa','Hà Nội','Đống Đa','102 Xã Đàn',21.0203,105.8430,'franchise_lite','active',4,NULL,4.8),
('C004','Anima Care Ba Đình','Hà Nội','Ba Đình','45 Đội Cấn',21.0380,105.8200,'franchise_full','active',5,NULL,4.7),
('C005','Anima Care Quận 1','TP.HCM','Quận 1','88 Nguyễn Huệ',10.7769,106.7009,'franchise_full','active',7,NULL,4.9),
('C006','Anima Care Quận 3','TP.HCM','Quận 3','55 Võ Văn Tần',10.7720,106.6800,'franchise_lite','active',3,NULL,4.6),
('C007','Anima Care Bình Thạnh','TP.HCM','Bình Thạnh','112 Đinh Bộ Lĩnh',10.8031,106.7152,'franchise_lite','active',3,NULL,4.7),
('C008','Anima Care Long Biên','Hà Nội','Long Biên','234 Nguyễn Văn Cừ',21.0465,105.8845,'franchise_lite','maintenance',4,NULL,4.5);

-- ─────────────────────────────────────────────────────────
-- MODULE 3: CUSTOMERS (Khách hàng)
-- ─────────────────────────────────────────────────────────
CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(20) UNIQUE NOT NULL,
  email           VARCHAR(255),
  dob             DATE,
  gender          CHAR(1) CHECK (gender IN ('M','F','O')),
  address         TEXT,
  center_id       UUID REFERENCES centers(id),
  constitution    customer_constitution DEFAULT 'unknown',
  ai_score        DECIMAL(5,2),
  member_tier     VARCHAR(20) DEFAULT 'bronze',
  total_sessions  INT DEFAULT 0,
  total_spent     BIGINT DEFAULT 0,
  last_visit      DATE,
  notes           TEXT,
  tags            TEXT[],
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_constitution ON customers(constitution);
CREATE INDEX idx_customers_center ON customers(center_id);

-- ─────────────────────────────────────────────────────────
-- MODULE 4: KỸ THUẬT VIÊN (Technicians)
-- ─────────────────────────────────────────────────────────
CREATE TABLE technicians (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE NOT NULL,
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(20) UNIQUE NOT NULL,
  email           VARCHAR(255),
  center_id       UUID NOT NULL REFERENCES centers(id),
  level           ktv_level NOT NULL DEFAULT 'L1',
  status          ktv_status NOT NULL DEFAULT 'active',
  specialties     TEXT[],
  sessions_today  INT DEFAULT 0,
  sessions_total  INT DEFAULT 0,
  rating          DECIMAL(3,2) DEFAULT 0,
  total_reviews   INT DEFAULT 0,
  joined_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_technicians_center ON technicians(center_id);
CREATE INDEX idx_technicians_level ON technicians(level);

-- ─────────────────────────────────────────────────────────
-- MODULE 5: SERVICES
-- ─────────────────────────────────────────────────────────
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(20) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  name_en     VARCHAR(255),
  category    VARCHAR(100),
  duration    INT NOT NULL DEFAULT 60,   -- minutes
  price       BIGINT NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO services (code,name,category,duration,price) VALUES
('SV001','Khai Vấn AI','Chẩn đoán',30,350000),
('SV002','Thảo Mộc Nhiệt','Liệu pháp nhiệt',90,850000),
('SV003','Bồn Ngâm','Thủy liệu',60,650000),
('SV004','Châm Cứu Chuẩn','Châm cứu',60,750000),
('SV005','Massage Kinh Lạc','Massage',90,950000),
('SV006','Xông Hơi Thảo Mộc','Xông hơi',45,550000),
('SV007','Liệu Trình Toàn Phần','Combo',180,2500000);

-- ─────────────────────────────────────────────────────────
-- MODULE 6: BOOKINGS (Lịch hẹn)
-- ─────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE NOT NULL,
  customer_id     UUID NOT NULL REFERENCES customers(id),
  center_id       UUID NOT NULL REFERENCES centers(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  technician_id   UUID REFERENCES technicians(id),
  booked_at       TIMESTAMPTZ NOT NULL,
  duration        INT,
  status          booking_status NOT NULL DEFAULT 'pending',
  notes           TEXT,
  price           BIGINT,
  discount        INT DEFAULT 0,
  final_price     BIGINT,
  cancelled_by    UUID REFERENCES users(id),
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  completed_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_center ON bookings(center_id);
CREATE INDEX idx_bookings_date ON bookings(booked_at);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ─────────────────────────────────────────────────────────
-- MODULE 7: PRODUCTS & SKUs
-- ─────────────────────────────────────────────────────────
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku         VARCHAR(50) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  name_en     VARCHAR(255),
  category    VARCHAR(100),
  unit        inventory_unit NOT NULL DEFAULT 'hop',
  price       BIGINT NOT NULL,
  cost        BIGINT,
  weight      INT,            -- grams
  description TEXT,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (sku,name,category,unit,price,cost) VALUES
('ANIMA-119-10','Anima 119 · 10 gói/hộp','Thảo mộc','hop',1868000,820000),
('ANIMA-119-30','Anima 119 · 30 gói (3 hộp)','Thảo mộc','hop',5604000,2460000),
('ANIMA-119-120','Anima 119 · 120 gói (12 hộp)','Thảo mộc','hop',22416000,9840000),
('FERMENT-001','Fermented Herb Extract 100ml','Chiết xuất','ml',680000,290000),
('HERB-SOAK-001','Bột Ngâm Chân Thảo Mộc 500g','Ngâm chân','g',420000,180000),
('DIFFUSE-001','Tinh Dầu Khuếch Tán 30ml','Aromatherapy','ml',550000,210000);

-- ─────────────────────────────────────────────────────────
-- MODULE 8: INVENTORY (Kho hàng)
-- ─────────────────────────────────────────────────────────
CREATE TABLE inventory (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id),
  center_id   UUID REFERENCES centers(id),  -- NULL = central warehouse
  qty         INT NOT NULL DEFAULT 0,
  qty_reserved INT NOT NULL DEFAULT 0,
  qty_min     INT NOT NULL DEFAULT 10,
  alert       stock_alert NOT NULL DEFAULT 'ok',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_inventory_product_center ON inventory(product_id, COALESCE(center_id::text,'central'));

CREATE OR REPLACE FUNCTION update_stock_alert() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qty = 0 THEN NEW.alert = 'out';
  ELSIF NEW.qty <= NEW.qty_min * 0.5 THEN NEW.alert = 'critical';
  ELSIF NEW.qty <= NEW.qty_min THEN NEW.alert = 'low';
  ELSE NEW.alert = 'ok';
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_alert
  BEFORE INSERT OR UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_stock_alert();

-- ─────────────────────────────────────────────────────────
-- MODULE 9: ORDERS (Đơn hàng)
-- ─────────────────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE NOT NULL,
  customer_id     UUID NOT NULL REFERENCES customers(id),
  center_id       UUID REFERENCES centers(id),
  status          order_status NOT NULL DEFAULT 'pending',
  payment_method  payment_method NOT NULL DEFAULT 'cod',
  payment_status  VARCHAR(20) DEFAULT 'unpaid',
  subtotal        BIGINT NOT NULL,
  discount        BIGINT DEFAULT 0,
  shipping_fee    BIGINT DEFAULT 0,
  total           BIGINT NOT NULL,
  ship_name       VARCHAR(255),
  ship_phone      VARCHAR(20),
  ship_address    TEXT,
  notes           TEXT,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  qty         INT NOT NULL,
  unit_price  BIGINT NOT NULL,
  subtotal    BIGINT NOT NULL
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- ─────────────────────────────────────────────────────────
-- MODULE 10: FRANCHISE (Nhượng quyền)
-- ─────────────────────────────────────────────────────────
CREATE TABLE franchise_partners (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(20) UNIQUE NOT NULL,
  company_name    VARCHAR(255) NOT NULL,
  contact_name    VARCHAR(255) NOT NULL,
  phone           VARCHAR(20) NOT NULL,
  email           VARCHAR(255),
  city            VARCHAR(100),
  status          franchise_status NOT NULL DEFAULT 'prospect',
  package         VARCHAR(50),         -- 'full','lite'
  investment      BIGINT,
  royalty_rate    DECIMAL(5,2),
  signed_at       DATE,
  opened_at       DATE,
  contract_expires DATE,
  center_id       UUID REFERENCES centers(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE franchise_royalties (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id  UUID NOT NULL REFERENCES franchise_partners(id),
  period      VARCHAR(7) NOT NULL,   -- '2026-03'
  revenue     BIGINT NOT NULL,
  royalty_pct DECIMAL(5,2) NOT NULL,
  amount      BIGINT NOT NULL,
  paid        BOOLEAN DEFAULT false,
  paid_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- MODULE 11: AI ENGINE (Khai vấn)
-- ─────────────────────────────────────────────────────────
CREATE TABLE ai_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  technician_id   UUID REFERENCES technicians(id),
  center_id       UUID REFERENCES centers(id),
  constitution    customer_constitution,
  confidence      DECIMAL(5,2),
  input_data      JSONB,         -- symptom checklist answers
  result          JSONB,         -- AI output
  recommendations TEXT[],
  duration_sec    INT,
  model_version   VARCHAR(20),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_sessions_customer ON ai_sessions(customer_id);
CREATE INDEX idx_ai_sessions_constitution ON ai_sessions(constitution);

-- ─────────────────────────────────────────────────────────
-- MODULE 12: ACADEMY (Đào tạo)
-- ─────────────────────────────────────────────────────────
CREATE TABLE academy_courses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        VARCHAR(20) UNIQUE NOT NULL,
  title       VARCHAR(255) NOT NULL,
  level       ktv_level NOT NULL,
  duration    INT NOT NULL,    -- hours
  price       BIGINT DEFAULT 0,
  description TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE academy_enrollments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id   UUID NOT NULL REFERENCES academy_courses(id),
  student_id  UUID NOT NULL REFERENCES technicians(id),
  enrolled_at DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at DATE,
  progress    SMALLINT DEFAULT 0,   -- 0-100%
  score       DECIMAL(5,2),
  passed      BOOLEAN,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────
-- MODULE 13: REVENUE (Doanh thu)
-- ─────────────────────────────────────────────────────────
CREATE TABLE revenue_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id   UUID REFERENCES centers(id),
  tier        revenue_tier,
  period      VARCHAR(7) NOT NULL,    -- '2026-03'
  category    VARCHAR(50) NOT NULL,   -- 'service','product','franchise','academy'
  amount      BIGINT NOT NULL,
  currency    CHAR(3) DEFAULT 'VND',
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revenue_period ON revenue_records(period);
CREATE INDEX idx_revenue_center ON revenue_records(center_id);

-- ─────────────────────────────────────────────────────────
-- MODULE 14: CMS / BLOG
-- ─────────────────────────────────────────────────────────
CREATE TABLE blog_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        VARCHAR(255) UNIQUE NOT NULL,
  title_vi    VARCHAR(500) NOT NULL,
  title_en    VARCHAR(500),
  content_vi  TEXT,
  content_en  TEXT,
  excerpt_vi  VARCHAR(500),
  excerpt_en  VARCHAR(500),
  cover_url   TEXT,
  author_id   UUID REFERENCES users(id),
  tags        TEXT[],
  category    VARCHAR(100),
  views       INT DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_published ON blog_posts(is_published, published_at DESC);

-- ─────────────────────────────────────────────────────────
-- MODULE 15: SETTINGS / AUDIT
-- ─────────────────────────────────────────────────────────
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(100) NOT NULL,
  entity      VARCHAR(50),
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip          INET,
  ua          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ─────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users','centers','customers','technicians','bookings',
    'orders','franchise_partners','blog_posts'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER trg_updated_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;
