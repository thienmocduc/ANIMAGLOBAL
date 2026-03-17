'use strict';
/**
 * AnimaCare Admin — Database Seed Script
 * Run: node src/db/seed.js
 * Generates realistic Vietnamese data for all 15 modules
 */
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt   = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const q    = (text, params) => pool.query(text, params);

// ── Vietnamese name data ──────────────────────────────────
const HO  = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương'];
const TEN = ['Thị Lan','Văn Minh','Thu Hà','Hoàng Nam','Thị Mai','Văn Hùng','Thu Hương','Quốc Anh','Thị Linh','Văn Đức','Thị Thu','Văn Tùng','Thị Nga','Minh Khoa','Thị Vân','Văn Phúc','Thị Hoa','Bảo Long','Thị Ngọc','Văn Thắng'];
const CITIES = ['Hà Nội','TP.HCM','Đà Nẵng','Hải Phòng'];

const rnd  = (a, b)    => Math.floor(Math.random()*(b-a+1))+a;
const pick = arr       => arr[Math.floor(Math.random()*arr.length)];
const name = ()        => `${pick(HO)} ${pick(TEN)}`;
const phone = (i)      => `09${String(rnd(10,99))}${String(i).padStart(6,'0')}`;
const email = (n, i)   => `${n.toLowerCase().replace(/\s/g,'.').replace(/đ/g,'d').replace(/[àáảãạăắằẵặẳâấầẫậ]/g,'a').replace(/[èéẻẽẹêếềễệ]/g,'e').replace(/[ìíỉĩị]/g,'i').replace(/[òóỏõọôốồổỗộơớờởỡợ]/g,'o').replace(/[ùúủũụưứừửữự]/g,'u').replace(/[ỳýỷỹỵ]/g,'y').replace(/[^a-z0-9.]/g,'')}${i}@gmail.com`;
const dateAgo = (days) => new Date(Date.now() - days*86400000).toISOString();
const dateFuture = (days) => new Date(Date.now() + days*86400000).toISOString();

async function seed() {
  console.log('🌱 AnimaCare Seed Script starting...\n');

  // ── USERS ────────────────────────────────────────────────
  console.log('👤 Seeding users...');
  const hashedPwd = await bcrypt.hash('Admin@2026!', 12);
  const users = [
    { email:'manager.hcm@animacare.global',  full_name:'Trần Thị Mai Anh', role:'manager',         staff_code:'MG001' },
    { email:'staff.c001@animacare.global',   full_name:'Nguyễn Văn Đức',   role:'staff',            staff_code:'ST001' },
    { email:'franchise@animacare.global',    full_name:'Phạm Quốc Huy',    role:'franchise_owner',  staff_code:'FO001' },
  ];
  for (const u of users) {
    await q(`INSERT INTO users(email,password,full_name,role,staff_code) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [u.email, hashedPwd, u.full_name, u.role, u.staff_code]);
  }

  // Get center IDs
  const centers = (await q('SELECT id,code FROM centers ORDER BY code')).rows;
  const cMap = Object.fromEntries(centers.map(c => [c.code, c.id]));
  console.log(`  Centers available: ${centers.map(c=>c.code).join(', ')}`);

  // Get service IDs
  const services = (await q('SELECT id,code,name,price FROM services')).rows;
  const svcIds   = services.map(s => s.id);

  // ── CUSTOMERS ────────────────────────────────────────────
  console.log('👥 Seeding 120 customers...');
  const constitutions = ['moc','hoa','tho','kim','thuy'];
  const tiers = ['bronze','bronze','bronze','silver','silver','gold'];
  const customerIds = [];

  for (let i = 0; i < 120; i++) {
    const n    = name();
    const ph   = phone(1000 + i);
    const em   = email(n, i);
    const cid  = pick(centers).id;
    const con  = pick(constitutions);
    const tier = pick(tiers);
    const code = `CU-${String(i+1).padStart(4,'0')}`;
    const daysAgo = rnd(10, 365);

    try {
      const { rows } = await q(`
        INSERT INTO customers(code,full_name,phone,email,gender,constitution,member_tier,
          center_id,total_sessions,total_spent,last_visit,is_active,created_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,$12)
        ON CONFLICT(phone) DO NOTHING RETURNING id
      `, [code, n, ph, em, pick(['M','F','F','F']), con, tier, cid,
          rnd(1,24), rnd(1,40)*500000, dateAgo(rnd(1,60)).slice(0,10), dateAgo(daysAgo)]);
      if (rows[0]) customerIds.push(rows[0].id);
    } catch {}
  }
  console.log(`  Inserted ${customerIds.length} customers`);

  // ── TECHNICIANS ──────────────────────────────────────────
  console.log('💆 Seeding 45 technicians...');
  const levels   = ['L1','L1','L1','L2','L2','L3','L4'];
  const specs    = [
    ['Châm cứu','Bấm huyệt'],['Xông hơi','Thảo mộc nhiệt'],
    ['Massage kinh lạc','Bồn ngâm'],['Khai vấn AI','Tư vấn thể tạng'],
    ['Liệu trình toàn phần','Dưỡng sinh']
  ];
  const techIds = [];

  for (let i = 0; i < 45; i++) {
    const n   = name();
    const ph  = phone(2000 + i);
    const cid = pick(centers).id;
    const lv  = pick(levels);
    const code = `KTV-${String(i+1).padStart(3,'0')}`;
    try {
      const { rows } = await q(`
        INSERT INTO technicians(code,full_name,phone,center_id,level,status,specialties,
          sessions_today,sessions_total,rating,joined_at)
        VALUES($1,$2,$3,$4,$5,'active',$6,$7,$8,$9,$10) ON CONFLICT(phone) DO NOTHING RETURNING id
      `, [code, n, ph, cid, lv, pick(specs), rnd(0,8), rnd(10,400),
          (rnd(42,50)/10).toFixed(1), dateAgo(rnd(30,730)).slice(0,10)]);
      if (rows[0]) techIds.push(rows[0].id);
    } catch {}
  }
  console.log(`  Inserted ${techIds.length} technicians`);

  // ── BOOKINGS (last 6 months) ─────────────────────────────
  console.log('📅 Seeding 800 bookings...');
  const statuses = ['completed','completed','completed','completed','confirmed','pending','cancelled','no_show'];
  let bkCount = 0;

  for (let i = 0; i < 800; i++) {
    const cu  = pick(customerIds);
    const cid = pick(centers).id;
    const svc = pick(services);
    const tch = techIds.length ? pick(techIds) : null;
    const st  = pick(statuses);
    const daysAgo = rnd(0, 180);
    const hour = rnd(8, 17);
    const code = `BK-${String(10000+i).slice(-5)}`;

    try {
      await q(`
        INSERT INTO bookings(code,customer_id,center_id,service_id,technician_id,
          booked_at,status,price,final_price,duration,created_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$8,$9,$10)
        ON CONFLICT DO NOTHING
      `, [code, cu, cid, svc.id, tch,
          new Date(Date.now() - daysAgo*86400000 + hour*3600000).toISOString(),
          st, svc.price, svc.duration, dateAgo(daysAgo)]);
      bkCount++;
    } catch {}
  }
  console.log(`  Inserted ${bkCount} bookings`);

  // ── INVENTORY ────────────────────────────────────────────
  console.log('📦 Seeding inventory...');
  const products = (await q('SELECT id FROM products')).rows;
  for (const p of products) {
    // Central warehouse
    await q(`INSERT INTO inventory(product_id,center_id,qty,qty_min) VALUES($1,NULL,$2,$3)
      ON CONFLICT DO NOTHING`, [p.id, rnd(50,500), 20]);
    // Per center
    for (const c of centers) {
      await q(`INSERT INTO inventory(product_id,center_id,qty,qty_min) VALUES($1,$2,$3,$4)
        ON CONFLICT DO NOTHING`, [p.id, c.id, rnd(2,40), 10]);
    }
  }
  console.log(`  Inventory seeded for ${products.length} SKUs × ${centers.length+1} locations`);

  // ── ORDERS ───────────────────────────────────────────────
  console.log('🛒 Seeding 80 orders...');
  const orderStatuses = ['delivered','delivered','delivered','shipped','confirmed','pending'];
  const pmethods = ['cod','cod','bank_transfer','momo','vnpay'];
  let ordCount = 0;

  for (let i = 0; i < 80; i++) {
    const cu  = pick(customerIds);
    const prod = pick(products);
    const qty  = rnd(1, 3);
    const pRow = (await q('SELECT price FROM products WHERE id=$1',[prod.id])).rows[0];
    const total = pRow.price * qty;
    const code  = `ORD-${String(10000+i).slice(-5)}`;
    const st    = pick(orderStatuses);
    const daysAgo = rnd(0, 90);

    try {
      const { rows } = await q(`
        INSERT INTO orders(code,customer_id,payment_method,subtotal,total,status,created_at)
        VALUES($1,$2,$3,$4,$4,$5,$6) RETURNING id
      `, [code, cu, pick(pmethods), total, st, dateAgo(daysAgo)]);
      if (rows[0]) {
        await q(`INSERT INTO order_items(order_id,product_id,qty,unit_price,subtotal) VALUES($1,$2,$3,$4,$5)`,
          [rows[0].id, prod.id, qty, pRow.price, total]);
        ordCount++;
      }
    } catch {}
  }
  console.log(`  Inserted ${ordCount} orders`);

  // ── AI SESSIONS ──────────────────────────────────────────
  console.log('🤖 Seeding 200 AI sessions...');
  let aiCount = 0;
  for (let i = 0; i < 200; i++) {
    const cu   = pick(customerIds);
    const con  = pick(constitutions);
    const conf = rnd(75, 98);
    const cid  = pick(centers).id;
    try {
      await q(`
        INSERT INTO ai_sessions(customer_id,center_id,constitution,confidence,
          input_data,result,recommendations,duration_sec,model_version,created_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,'v2.1',$9)
      `, [cu, cid, con, conf,
          JSON.stringify({ symptoms: [pick(['mệt mỏi','đau đầu','mất ngủ','khó tiêu','lo âu'])] }),
          JSON.stringify({ constitution: con, confidence: conf }),
          [`Liệu trình ${con}`, 'Thảo mộc hỗ trợ', 'Điều chỉnh sinh hoạt'],
          rnd(120, 600), dateAgo(rnd(0, 180))]);
      aiCount++;
    } catch {}
  }
  console.log(`  Inserted ${aiCount} AI sessions`);

  // ── FRANCHISE PARTNERS ───────────────────────────────────
  console.log('🤝 Seeding franchise partners...');
  const companies = [
    ['CÔNG TY TNHH SỨC KHỎE XANH','Nguyễn Minh Hoàng','active','full',500000000,5.0],
    ['CÔNG TY CP WELLNESS VIỆT','Trần Thị Phương Lan','active','lite',200000000,3.5],
    ['HỘ KINH DOANH THẢO MỘC AN','Lê Văn Thành','negotiation','lite',null,3.5],
    ['CÔNG TY TNHH THIÊN NHIÊN XANH','Phạm Thị Bích Ngọc','prospect','full',null,5.0],
    ['CÔNG TY CP WELLNESS MỀ KONG','Võ Đình Khải','signed','full',450000000,5.0],
  ];

  for (let i = 0; i < companies.length; i++) {
    const [company, contact, status, pkg, investment, royalty] = companies[i];
    const code = `FP-${String(i+1).padStart(3,'0')}`;
    await q(`
      INSERT INTO franchise_partners(code,company_name,contact_name,phone,city,status,package,investment,royalty_rate)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING
    `, [code, company, contact, phone(3000+i), pick(CITIES), status, pkg,
        investment, royalty]);
  }
  console.log(`  Inserted ${companies.length} franchise partners`);

  // ── ACADEMY ──────────────────────────────────────────────
  console.log('🎓 Seeding academy courses...');
  const courses = [
    ['AC-L1A','Nhập Môn Đông Y Cơ Bản','L1',40],
    ['AC-L1B','Kỹ Năng Phục Vụ Khách Hàng','L1',20],
    ['AC-L2A','Châm Cứu & Bấm Huyệt Nâng Cao','L2',60],
    ['AC-L2B','Thảo Mộc Liệu Pháp','L2',40],
    ['AC-L3A','Khai Vấn AI & Chẩn Đoán','L3',80],
    ['AC-L4A','Kinh Lạc Master Program','L4',120],
  ];
  const courseIds = [];
  for (const [code,title,level,duration] of courses) {
    const { rows } = await q(`
      INSERT INTO academy_courses(code,title,level,duration) VALUES($1,$2,$3,$4)
      ON CONFLICT DO NOTHING RETURNING id
    `, [code, title, level, duration]);
    if (rows[0]) courseIds.push({ id: rows[0].id, level });
  }

  // Enroll technicians
  for (const tech of techIds.slice(0, 30)) {
    const course = pick(courseIds);
    const prog   = rnd(0, 100);
    await q(`
      INSERT INTO academy_enrollments(course_id,student_id,progress,passed,enrolled_at)
      VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING
    `, [course.id, tech, prog, prog===100 && Math.random()>.3,
        dateAgo(rnd(10,120)).slice(0,10)]);
  }
  console.log(`  ${courses.length} courses, ${Math.min(30,techIds.length)} enrollments`);

  // ── BLOG POSTS ───────────────────────────────────────────
  console.log('📝 Seeding blog posts...');
  const posts = [
    { slug:'the-tang-khi-hu-la-gi', title_vi:'Thể Tạng Khí Hư Là Gì? Dấu Hiệu & Cách Điều Trị', category:'Thể Tạng', published: true },
    { slug:'loi-ich-cham-cuu', title_vi:'7 Lợi Ích Không Ngờ Của Châm Cứu Với Sức Khỏe Hiện Đại', category:'Liệu Pháp', published: true },
    { slug:'anima-119-huong-dan', title_vi:'Hướng Dẫn Sử Dụng Anima 119 Đúng Cách', category:'Sản Phẩm', published: true },
    { slug:'thao-moc-nhiet-lieu-phap', title_vi:'Thảo Mộc Nhiệt Liệu Pháp — Khoa Học & Ứng Dụng', category:'Liệu Pháp', published: true },
    { slug:'khai-van-ai-dong-y', title_vi:'Khai Vấn AI: Khi Trí Tuệ Nhân Tạo Gặp Đông Y Truyền Thống', category:'Công Nghệ', published: true },
    { slug:'bon-ngam-chan-tac-dung', title_vi:'Bồn Ngâm Thảo Mộc — Tác Dụng Và Lưu Ý', category:'Liệu Pháp', published: false },
  ];

  const adminUser = (await q("SELECT id FROM users WHERE role='superadmin' LIMIT 1")).rows[0];
  for (const p of posts) {
    await q(`
      INSERT INTO blog_posts(slug,title_vi,category,is_published,published_at,views,author_id,tags,created_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(slug) DO NOTHING
    `, [p.slug, p.title_vi, p.category, p.published,
        p.published ? dateAgo(rnd(5,60)) : null,
        rnd(120, 2400), adminUser?.id || null,
        [p.category, 'Sức khỏe', 'Đông y'],
        dateAgo(rnd(5,90))]);
  }
  console.log(`  Inserted ${posts.length} blog posts`);

  // ── REVENUE RECORDS ──────────────────────────────────────
  console.log('💰 Seeding revenue records (12 months)...');
  const categories = ['service','product','franchise'];
  let revCount = 0;
  for (let m = 0; m < 12; m++) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    const period = d.toISOString().slice(0,7);
    for (const cid of centers.map(c=>c.id)) {
      for (const cat of categories) {
        const base = cat==='service' ? rnd(20,80)*1000000
                   : cat==='product' ? rnd(5,25)*1000000
                   : rnd(2,10)*1000000;
        await q(`INSERT INTO revenue_records(center_id,period,category,amount) VALUES($1,$2,$3,$4)`,
          [cid, period, cat, base]);
        revCount++;
      }
    }
  }
  console.log(`  Inserted ${revCount} revenue records`);

  // ── SUMMARY ──────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  const counts = await Promise.all([
    q('SELECT COUNT(*) FROM users'),
    q('SELECT COUNT(*) FROM customers'),
    q('SELECT COUNT(*) FROM technicians'),
    q('SELECT COUNT(*) FROM bookings'),
    q('SELECT COUNT(*) FROM orders'),
    q('SELECT COUNT(*) FROM ai_sessions'),
    q('SELECT COUNT(*) FROM blog_posts'),
  ]);
  const labels = ['users','customers','technicians','bookings','orders','ai_sessions','blog_posts'];
  counts.forEach((r,i) => console.log(`  ${labels[i].padEnd(16)} ${r.rows[0].count}`));

  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  pool.end();
  process.exit(1);
});
