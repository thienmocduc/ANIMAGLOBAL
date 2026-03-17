'use strict';
/**
 * AnimaCare — Payment Routes
 * VNPay + MoMo + COD
 * npm install crypto querystring axios
 */
const router = require('express').Router();
const crypto = require('crypto');
const qs     = require('querystring');
const db     = require('../db/pool');
const mailer = require('../utils/mailer');
const logger = require('../utils/logger');

// ── VNPay Config ─────────────────────────────────────────
const VNP = {
  tmnCode:    process.env.VNPAY_TMN_CODE    || 'ANIMACARE',
  hashSecret: process.env.VNPAY_HASH_SECRET || 'your_vnpay_secret',
  url:        process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  returnUrl:  process.env.VNPAY_RETURN_URL || 'https://animacare.global/api/v1/payment/vnpay/return',
};

// ── MoMo Config ──────────────────────────────────────────
const MOMO = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'ANIMACARE',
  accessKey:   process.env.MOMO_ACCESS_KEY   || 'your_momo_access_key',
  secretKey:   process.env.MOMO_SECRET_KEY   || 'your_momo_secret_key',
  endpoint:    process.env.MOMO_ENDPOINT     || 'https://test-payment.momo.vn/v2/gateway/api/create',
  returnUrl:   process.env.MOMO_RETURN_URL   || 'https://animacare.global/api/v1/payment/momo/return',
  notifyUrl:   process.env.MOMO_NOTIFY_URL   || 'https://animacare.global/api/v1/payment/momo/notify',
};

// ─────────────────────────────────────────────────────────
// POST /payment/create — Unified payment creation
// ─────────────────────────────────────────────────────────
router.post('/create', async (req, res) => {
  const { code, amount, method, description, return_url,
          customer_name, customer_phone, customer_email } = req.body;

  if (!code || !amount || amount < 1000) {
    return res.status(400).json({ error: 'code and amount required (min 1000 VND)' });
  }

  const amountNum = Math.round(Number(amount));

  try {
    if (method === 'vnpay') {
      const url = createVNPayUrl({ code, amount: amountNum, description, return_url });
      return res.json({ payment_url: url, code, method: 'vnpay' });
    }

    if (method === 'momo') {
      const { pay_url } = await createMoMoOrder({ code, amount: amountNum, description,
        customer_phone, customer_email });
      return res.json({ payment_url: pay_url, code, method: 'momo' });
    }

    // COD — just confirm immediately
    return res.json({ code, method: 'cod', status: 'pending', payment_url: null });

  } catch (err) {
    logger.error('Payment create error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── VNPay URL builder ─────────────────────────────────────
function createVNPayUrl({ code, amount, description, return_url }) {
  const now     = new Date();
  const pad     = n => String(n).padStart(2,'0');
  const createDate = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  let params = {
    vnp_Version:    '2.1.0',
    vnp_Command:    'pay',
    vnp_TmnCode:    VNP.tmnCode,
    vnp_Amount:     amount * 100,
    vnp_CreateDate: createDate,
    vnp_CurrCode:   'VND',
    vnp_IpAddr:     '127.0.0.1',
    vnp_Locale:     'vn',
    vnp_OrderInfo:  description || `AnimaCare Order ${code}`,
    vnp_OrderType:  'billpayment',
    vnp_ReturnUrl:  return_url || VNP.returnUrl,
    vnp_TxnRef:     code,
  };

  // Sort params
  params = Object.fromEntries(Object.entries(params).sort(([a],[b]) => a.localeCompare(b)));
  const signData = qs.stringify(params);
  const hmac = crypto.createHmac('sha512', VNP.hashSecret);
  params.vnp_SecureHash = hmac.update(Buffer.from(signData,'utf-8')).digest('hex');

  return `${VNP.url}?${qs.stringify(params)}`;
}

// ── VNPay return webhook ──────────────────────────────────
router.get('/vnpay/return', async (req, res) => {
  const { vnp_SecureHash, vnp_ResponseCode, vnp_TxnRef, ...params } = req.query;

  // Verify signature
  const sorted = Object.fromEntries(Object.entries(params).filter(([k]) => k.startsWith('vnp_')).sort(([a],[b]) => a.localeCompare(b)));
  const signData = qs.stringify(sorted);
  const hmac = crypto.createHmac('sha512', VNP.hashSecret);
  const checkHash = hmac.update(Buffer.from(signData,'utf-8')).digest('hex');

  const isValid = checkHash === vnp_SecureHash;
  const isSuccess = vnp_ResponseCode === '00';

  if (isValid && isSuccess) {
    // Update order/booking status
    await updatePaymentStatus(vnp_TxnRef, 'paid');
    res.redirect(`/?payment_return=1&code=${vnp_TxnRef}&vnp_ResponseCode=00`);
  } else {
    res.redirect(`/?payment_return=1&code=${vnp_TxnRef}&vnp_ResponseCode=${vnp_ResponseCode}`);
  }
});

// ── MoMo order creation ───────────────────────────────────
async function createMoMoOrder({ code, amount, description, customer_phone }) {
  const axios = require('axios');
  const orderId    = code;
  const requestId  = code + '_' + Date.now();
  const orderInfo  = description || `AnimaCare Order ${code}`;
  const extraData  = '';

  const rawSignature = [
    `accessKey=${MOMO.accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${MOMO.notifyUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${MOMO.partnerCode}`,
    `redirectUrl=${MOMO.returnUrl}`,
    `requestId=${requestId}`,
    `requestType=payWithATM`,
  ].join('&');

  const signature = crypto.createHmac('sha256', MOMO.secretKey)
    .update(rawSignature).digest('hex');

  const body = {
    partnerCode: MOMO.partnerCode,
    accessKey:   MOMO.accessKey,
    requestId, orderId, orderInfo,
    redirectUrl: MOMO.returnUrl,
    ipnUrl:      MOMO.notifyUrl,
    amount:      String(amount),
    lang:        'vi',
    extraData,
    requestType: 'payWithATM',
    signature,
  };

  const response = await axios.post(MOMO.endpoint, body);
  if (response.data.resultCode === 0) {
    return { pay_url: response.data.payUrl };
  }
  throw new Error(response.data.message || 'MoMo error');
}

// ── MoMo return ───────────────────────────────────────────
router.get('/momo/return', async (req, res) => {
  const { orderId, resultCode } = req.query;
  if (resultCode === '0') {
    await updatePaymentStatus(orderId, 'paid');
    res.redirect(`/?payment_return=1&code=${orderId}&resultCode=0`);
  } else {
    res.redirect(`/?payment_return=1&code=${orderId}&resultCode=${resultCode}`);
  }
});

// ── MoMo IPN (server-to-server) ───────────────────────────
router.post('/momo/notify', async (req, res) => {
  const { orderId, resultCode, amount } = req.body;
  if (resultCode === 0) {
    await updatePaymentStatus(orderId, 'paid');
    logger.info(`MoMo IPN: ${orderId} paid ${amount}`);
  }
  res.json({ status: 0 });
});

// ── Update order/booking payment status ───────────────────
async function updatePaymentStatus(code, status) {
  try {
    // Try orders first
    const ord = await db.query(
      `UPDATE orders SET payment_status=$1, status=CASE WHEN $1='paid' THEN 'confirmed' ELSE status END
       WHERE code=$2 RETURNING id, customer_id`,
      [status, code]
    );

    if (ord.rows[0] && status === 'paid') {
      // Send order confirmation email
      const orderFull = await db.query(`
        SELECT o.*, cu.full_name AS customer_name, cu.email AS customer_email
        FROM orders o LEFT JOIN customers cu ON cu.id=o.customer_id WHERE o.code=$1
      `, [code]);
      const items = await db.query('SELECT oi.*, p.name FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=$1', [ord.rows[0].id]);
      if (orderFull.rows[0]?.customer_email) {
        mailer.orderConfirmed({ ...orderFull.rows[0], items: items.rows }).catch(() => {});
      }
    }
  } catch (err) {
    logger.error('updatePaymentStatus error:', err.message);
  }
}

// ── Public booking endpoint (no auth) ─────────────────────
router.post('/bookings/public', async (req, res) => {
  const { code, customer_name, customer_phone, customer_email,
          service_name, center_id, booked_at, price, notes } = req.body;

  try {
    // Find or create customer
    let cusRes = await db.query('SELECT id FROM customers WHERE phone=$1', [customer_phone]);
    let customerId = cusRes.rows[0]?.id;

    if (!customerId) {
      const newCode = 'CU-' + Date.now().toString(36).toUpperCase();
      const ins = await db.query(
        `INSERT INTO customers(code,full_name,phone,email,center_id)
         VALUES($1,$2,$3,$4,$5) RETURNING id`,
        [newCode, customer_name, customer_phone, customer_email||null, center_id||null]
      );
      customerId = ins.rows[0].id;
    }

    // Get service
    const svcRes = await db.query("SELECT id FROM services WHERE name ILIKE $1 LIMIT 1", [service_name]);

    // Create booking
    await db.query(
      `INSERT INTO bookings(code,customer_id,center_id,service_id,booked_at,price,final_price,notes,status)
       VALUES($1,$2,$3,$4,$5,$6,$6,$7,'pending')`,
      [code, customerId, center_id||null, svcRes.rows[0]?.id||null,
       booked_at, price||0, notes||null]
    );

    // Send confirmation email
    if (customer_email) {
      mailer.bookingConfirmed({
        code, customer_name, customer_email, customer_phone,
        service_name, center_name: center_id,
        booked_at, technician_name: null
      }).catch(() => {});
    }

    res.status(201).json({ code, status: 'pending' });
  } catch (err) {
    logger.error('Public booking error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Public order endpoint ─────────────────────────────────
router.post('/orders/public', async (req, res) => {
  const { code, customer_name, customer_phone, customer_email,
          ship_address, payment_method, items, total } = req.body;

  try {
    let cusRes = await db.query('SELECT id FROM customers WHERE phone=$1', [customer_phone||'']);
    let customerId = cusRes.rows[0]?.id;

    if (!customerId && customer_phone) {
      const newCode = 'CU-' + Date.now().toString(36).toUpperCase();
      const ins = await db.query(
        `INSERT INTO customers(code,full_name,phone,email) VALUES($1,$2,$3,$4) RETURNING id`,
        [newCode, customer_name||'Guest', customer_phone, customer_email||null]
      );
      customerId = ins.rows[0].id;
    }

    const orderRes = await db.query(
      `INSERT INTO orders(code,customer_id,payment_method,subtotal,total,ship_address,status)
       VALUES($1,$2,$3,$4,$4,$5,'pending') RETURNING id`,
      [code, customerId||null, payment_method||'cod', total||0, ship_address||null]
    );

    // Insert items
    for (const item of (items || [])) {
      const prod = await db.query('SELECT id,price FROM products WHERE sku=$1', [item.sku]);
      if (prod.rows[0]) {
        await db.query(
          `INSERT INTO order_items(order_id,product_id,qty,unit_price,subtotal) VALUES($1,$2,$3,$4,$5)`,
          [orderRes.rows[0].id, prod.rows[0].id, item.qty||1, item.price||prod.rows[0].price, (item.price||prod.rows[0].price)*(item.qty||1)]
        );
      }
    }

    res.status(201).json({ code, id: orderRes.rows[0].id, status: 'pending' });
  } catch (err) {
    logger.error('Public order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
