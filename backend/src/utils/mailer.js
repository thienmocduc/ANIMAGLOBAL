'use strict';
/**
 * AnimaCare — Email Notification Service
 * Uses Nodemailer with HTML templates
 * Install: npm install nodemailer
 */
const nodemailer = require('nodemailer');
const logger     = require('./logger');

// ── Transport ─────────────────────────────────────────────
let _transport = null;

function getTransport() {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return _transport;
}

const FROM = `"AnimaCare Global" <${process.env.SMTP_USER || 'noreply@animacare.global'}>`;

// ── Base template ─────────────────────────────────────────
function baseHtml(title, body) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:20px}
  .wrap{max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  .hd{background:linear-gradient(135deg,#005A42,#00C896);padding:28px 32px;color:#fff}
  .hd h1{margin:0;font-size:20px;font-weight:700;letter-spacing:.3px}
  .hd p{margin:6px 0 0;font-size:13px;opacity:.8}
  .bd{padding:28px 32px;color:#1a1a1a;font-size:14px;line-height:1.7}
  .info-box{background:#f8f9fa;border-radius:8px;padding:16px 20px;margin:16px 0;border-left:3px solid #00C896}
  .info-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e8e8e8;font-size:13px}
  .info-row:last-child{border-bottom:none}
  .label{color:#666}
  .value{font-weight:600;color:#1a1a1a}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
  .badge-green{background:#e6faf5;color:#005A42}
  .badge-red{background:#fef0f3;color:#cc2244}
  .badge-amber{background:#fef8e6;color:#92620a}
  .btn{display:inline-block;background:#00C896;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:16px}
  .ft{padding:20px 32px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#888;text-align:center}
  .ft a{color:#00C896;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="hd">
    <h1>🌿 AnimaCare Global</h1>
    <p>${title}</p>
  </div>
  <div class="bd">${body}</div>
  <div class="ft">
    AnimaCare Global Pte. Ltd. · 286 Nguyễn Xiển, Hà Nội<br>
    <a href="https://animacare.global">animacare.global</a> ·
    <a href="tel:+84913156676">0913 156 676</a>
  </div>
</div>
</body>
</html>`;
}

// ── Templates ─────────────────────────────────────────────
const templates = {

  // Booking confirmation → customer
  bookingConfirmed: ({ booking }) => ({
    subject: `✅ Xác nhận lịch hẹn ${booking.code} · AnimaCare`,
    html: baseHtml('Xác nhận lịch hẹn thành công', `
      <p>Xin chào <strong>${booking.customer_name}</strong>,</p>
      <p>Lịch hẹn của bạn tại AnimaCare đã được xác nhận. Chi tiết:</p>
      <div class="info-box">
        <div class="info-row"><span class="label">Mã lịch hẹn</span><span class="value">${booking.code}</span></div>
        <div class="info-row"><span class="label">Dịch vụ</span><span class="value">${booking.service_name}</span></div>
        <div class="info-row"><span class="label">Cơ sở</span><span class="value">${booking.center_name}</span></div>
        <div class="info-row"><span class="label">Thời gian</span><span class="value">${new Date(booking.booked_at).toLocaleString('vi-VN')}</span></div>
        <div class="info-row"><span class="label">Kỹ thuật viên</span><span class="value">${booking.technician_name || 'Sẽ phân công sau'}</span></div>
        <div class="info-row"><span class="label">Trạng thái</span><span class="value"><span class="badge badge-green">Đã xác nhận</span></span></div>
      </div>
      <p style="color:#666;font-size:13px">💡 <strong>Lưu ý:</strong> Vui lòng đến trước 10 phút. Mang theo thẻ thành viên (nếu có). Gọi <a href="tel:+84913156676" style="color:#00C896">0913 156 676</a> để thay đổi lịch.</p>
      <a href="https://animacare.global" class="btn">Xem chi tiết lịch hẹn</a>
    `)
  }),

  // Booking cancelled → customer
  bookingCancelled: ({ booking }) => ({
    subject: `Lịch hẹn ${booking.code} đã bị hủy · AnimaCare`,
    html: baseHtml('Thông báo hủy lịch hẹn', `
      <p>Xin chào <strong>${booking.customer_name}</strong>,</p>
      <p>Lịch hẹn <strong>${booking.code}</strong> (${booking.service_name}) vào lúc <strong>${new Date(booking.booked_at).toLocaleString('vi-VN')}</strong> đã được hủy.</p>
      ${booking.cancel_reason ? `<div class="info-box"><strong>Lý do:</strong> ${booking.cancel_reason}</div>` : ''}
      <p>Để đặt lịch mới, vui lòng liên hệ hotline <a href="tel:+84913156676" style="color:#00C896">0913 156 676</a> hoặc đặt trực tuyến.</p>
      <a href="https://animacare.global" class="btn">Đặt lịch mới</a>
    `)
  }),

  // New booking → staff alert
  newBookingAlert: ({ booking }) => ({
    subject: `🔔 Lịch hẹn mới: ${booking.code} · ${booking.center_name}`,
    html: baseHtml(`Lịch hẹn mới tại ${booking.center_name}`, `
      <p>Có lịch hẹn mới cần xác nhận:</p>
      <div class="info-box">
        <div class="info-row"><span class="label">Mã</span><span class="value">${booking.code}</span></div>
        <div class="info-row"><span class="label">Khách hàng</span><span class="value">${booking.customer_name} · ${booking.customer_phone}</span></div>
        <div class="info-row"><span class="label">Dịch vụ</span><span class="value">${booking.service_name}</span></div>
        <div class="info-row"><span class="label">Thời gian</span><span class="value">${new Date(booking.booked_at).toLocaleString('vi-VN')}</span></div>
        <div class="info-row"><span class="label">Trạng thái</span><span class="value"><span class="badge badge-amber">Chờ xác nhận</span></span></div>
      </div>
      <a href="https://admin.animacare.global" class="btn">Xác nhận trong Admin</a>
    `)
  }),

  // Low stock alert → admin
  stockAlert: ({ items }) => ({
    subject: `⚠️ Cảnh báo tồn kho thấp · ${items.length} SKU · AnimaCare`,
    html: baseHtml(`Cảnh báo tồn kho — ${items.length} mặt hàng cần bổ sung`, `
      <p>Các mặt hàng sau đang ở mức tồn kho thấp:</p>
      <div class="info-box">
        ${items.map(i => `
          <div class="info-row">
            <span class="label">${i.sku} · ${i.name}<br><small style="color:#999">${i.location}</small></span>
            <span class="value"><span class="badge ${i.alert==='out'?'badge-red':i.alert==='critical'?'badge-amber':'badge-green'}">${i.qty} còn lại</span></span>
          </div>`).join('')}
      </div>
      <a href="https://admin.animacare.global" class="btn">Quản lý kho hàng</a>
    `)
  }),

  // Daily report → admin
  dailyReport: ({ date, stats }) => ({
    subject: `📊 Báo cáo ngày ${date} · AnimaCare Admin`,
    html: baseHtml(`Báo cáo hoạt động ngày ${date}`, `
      <p>Tổng kết hoạt động hệ thống AnimaCare:</p>
      <div class="info-box">
        <div class="info-row"><span class="label">Lịch hẹn mới</span><span class="value">${stats.bookings_total}</span></div>
        <div class="info-row"><span class="label">Hoàn thành</span><span class="value">${stats.bookings_completed}</span></div>
        <div class="info-row"><span class="label">Doanh thu dịch vụ</span><span class="value">${new Intl.NumberFormat('vi-VN').format(stats.service_revenue)}đ</span></div>
        <div class="info-row"><span class="label">Khách hàng mới</span><span class="value">${stats.new_customers}</span></div>
        <div class="info-row"><span class="label">Đơn hàng mới</span><span class="value">${stats.new_orders}</span></div>
        <div class="info-row"><span class="label">Phiên Khai Vấn AI</span><span class="value">${stats.ai_sessions}</span></div>
      </div>
      ${stats.alerts?.length ? `
        <div style="margin-top:16px;padding:12px 16px;background:#fef8e6;border-radius:8px;border-left:3px solid #F59E0B">
          <strong>⚠️ Cảnh báo:</strong> ${stats.alerts.join(' · ')}
        </div>` : ''}
      <a href="https://admin.animacare.global" class="btn">Xem Dashboard</a>
    `)
  }),

  // Order confirmation → customer
  orderConfirmed: ({ order }) => ({
    subject: `✅ Xác nhận đơn hàng ${order.code} · AnimaCare`,
    html: baseHtml('Xác nhận đơn hàng thành công', `
      <p>Xin chào <strong>${order.customer_name}</strong>,</p>
      <p>Đơn hàng <strong>${order.code}</strong> của bạn đã được xác nhận:</p>
      <div class="info-box">
        ${order.items.map(i=>`
          <div class="info-row">
            <span class="label">${i.name} × ${i.qty}</span>
            <span class="value">${new Intl.NumberFormat('vi-VN').format(i.subtotal)}đ</span>
          </div>`).join('')}
        <div class="info-row" style="font-size:15px;font-weight:700">
          <span class="label">Tổng cộng</span>
          <span class="value" style="color:#00C896">${new Intl.NumberFormat('vi-VN').format(order.total)}đ</span>
        </div>
      </div>
      <p style="font-size:13px;color:#666">Phương thức: <strong>${order.payment_method.toUpperCase()}</strong> · Giao đến: <strong>${order.ship_address || '—'}</strong></p>
      <a href="https://animacare.global" class="btn">Theo dõi đơn hàng</a>
    `)
  }),

  // OTP verification → admin login
  otpCode: ({ user, code, expiresMinutes }) => ({
    subject: `🔐 Mã xác thực OTP · AnimaCare Admin`,
    html: baseHtml('Mã xác thực đăng nhập Admin', `
      <p>Xin chào <strong>${user.full_name}</strong>,</p>
      <p>Bạn đang yêu cầu đăng nhập vào <strong>Cổng Quản Trị AnimaCare</strong>. Mã xác thực OTP của bạn:</p>
      <div style="text-align:center;margin:28px 0">
        <div style="display:inline-block;background:linear-gradient(135deg,#005A42,#00C896);padding:20px 40px;border-radius:12px;letter-spacing:12px;font-size:32px;font-weight:900;color:#fff;font-family:monospace">${code}</div>
      </div>
      <div class="info-box">
        <div class="info-row"><span class="label">Hiệu lực</span><span class="value">${expiresMinutes} phút</span></div>
        <div class="info-row"><span class="label">Thời gian yêu cầu</span><span class="value">${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</span></div>
        <div class="info-row"><span class="label">Tài khoản</span><span class="value">${user.staff_code || user.email}</span></div>
      </div>
      <p style="color:#cc2244;font-size:13px;margin-top:16px">⚠️ <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã này với bất kỳ ai. AnimaCare sẽ không bao giờ yêu cầu mã OTP qua điện thoại hay tin nhắn. Nếu bạn không yêu cầu đăng nhập, vui lòng đổi mật khẩu ngay.</p>
    `)
  }),

  // Royalty invoice → franchise partner
  royaltyInvoice: ({ partner, royalty }) => ({
    subject: `💼 Hóa đơn tiền bản quyền ${royalty.period} · AnimaCare`,
    html: baseHtml(`Hóa đơn tiền bản quyền tháng ${royalty.period}`, `
      <p>Xin chào <strong>${partner.contact_name}</strong> · ${partner.company_name},</p>
      <p>Tiền bản quyền tháng <strong>${royalty.period}</strong> đã được tính toán:</p>
      <div class="info-box">
        <div class="info-row"><span class="label">Doanh thu tháng</span><span class="value">${new Intl.NumberFormat('vi-VN').format(royalty.revenue)}đ</span></div>
        <div class="info-row"><span class="label">Tỷ lệ bản quyền</span><span class="value">${royalty.royalty_pct}%</span></div>
        <div class="info-row"><span class="label">Số tiền phải nộp</span><span class="value" style="color:#00C896;font-size:16px">${new Intl.NumberFormat('vi-VN').format(royalty.amount)}đ</span></div>
        <div class="info-row"><span class="label">Hạn thanh toán</span><span class="value">Ngày 15 tháng sau</span></div>
      </div>
      <p style="font-size:13px;color:#666">Tài khoản nhận: <strong>Anima Global Pte. Ltd.</strong> · Bank: DBS Singapore · Acc: 123-456-789</p>
    `)
  }),
};

// ── Send function ─────────────────────────────────────────
async function send(to, templateName, data) {
  const template = templates[templateName];
  if (!template) throw new Error(`Unknown template: ${templateName}`);

  const { subject, html } = template(data);

  try {
    const info = await getTransport().sendMail({
      from: FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${templateName} → ${to} [${info.messageId}]`);
    return info;
  } catch (err) {
    logger.error(`Email failed: ${templateName} → ${to}: ${err.message}`);
    throw err;
  }
}

// ── Convenience wrappers ──────────────────────────────────
module.exports = {
  send,

  async bookingConfirmed(booking) {
    if (!booking.customer_email) return;
    return send(booking.customer_email, 'bookingConfirmed', { booking });
  },

  async bookingCancelled(booking) {
    if (!booking.customer_email) return;
    return send(booking.customer_email, 'bookingCancelled', { booking });
  },

  async newBookingAlert(booking, staffEmail) {
    if (!staffEmail) return;
    return send(staffEmail, 'newBookingAlert', { booking });
  },

  async stockAlert(items, adminEmail) {
    adminEmail = adminEmail || process.env.ADMIN_EMAIL || 'admin@animacare.global';
    return send(adminEmail, 'stockAlert', { items });
  },

  async dailyReport(stats, adminEmail) {
    adminEmail = adminEmail || process.env.ADMIN_EMAIL || 'admin@animacare.global';
    const date = new Date().toLocaleDateString('vi-VN');
    return send(adminEmail, 'dailyReport', { date, stats });
  },

  async orderConfirmed(order) {
    if (!order.customer_email) return;
    return send(order.customer_email, 'orderConfirmed', { order });
  },

  async royaltyInvoice(partner, royalty) {
    if (!partner.email) return;
    return send(partner.email, 'royaltyInvoice', { partner, royalty });
  },

  async sendOtp(user, code, expiresMinutes = 5) {
    if (!user.email) return;
    return send(user.email, 'otpCode', { user, code, expiresMinutes });
  },
};
