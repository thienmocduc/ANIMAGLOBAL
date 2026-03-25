// ═══════════════════════════════════════════════════════
// ADMIN REAL PAGES — Replace ALL demo pages with Supabase
// ═══════════════════════════════════════════════════════
(function(){
'use strict';
var SB='https://pvhfzqopcorzaoghbywo.supabase.co';
var KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGZ6cW9wY29yemFvZ2hieXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjIyNDksImV4cCI6MjA4NzY5ODI0OX0.rv1CJizk4GpFjOw7I5ifipyEYv2TMSGeQbdf358PjBU';
function sb(table,opts){opts=opts||{};var u=SB+'/rest/v1/'+table+'?select='+(opts.select||'*');if(opts.filter)u+='&'+opts.filter;if(opts.order)u+='&order='+opts.order;if(opts.limit)u+='&limit='+opts.limit;return fetch(u,{headers:{'apikey':KEY,'Authorization':'Bearer '+KEY}}).then(function(r){return r.json();});}
function sbPost(table,data){return fetch(SB+'/rest/v1/'+table,{method:'POST',headers:{'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(data)}).then(function(r){return r.json();});}
function sbPatch(table,filter,data){return fetch(SB+'/rest/v1/'+table+'?'+filter,{method:'PATCH',headers:{'apikey':KEY,'Authorization':'Bearer '+KEY,'Content-Type':'application/json','Prefer':'return=representation'},body:JSON.stringify(data)});}
function money(n){return(n||0).toLocaleString('vi-VN')+'đ';}
function badge(text,color){return '<span style="display:inline-block;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;background:rgba('+(color==='green'?'0,200,150':color==='yellow'?'255,184,0':color==='blue'?'96,165,250':color==='red'?'255,77,109':color==='purple'?'155,130,255':'0,200,150')+',.12);color:'+(color==='green'?'#22C55E':color==='yellow'?'#FFB800':color==='blue'?'#60A5FA':color==='red'?'#FF4D6D':color==='purple'?'#9B82FF':'#00C896')+'">'+text+'</span>';}
function kpi(label,value,color){return '<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:10px;padding:12px;text-align:center"><div style="font-size:18px;font-weight:700;color:'+color+'">'+value+'</div><div style="font-size:10px;color:#607870;margin-top:2px">'+label+'</div></div>';}
function el(){return document.getElementById('admPageContent');}
function table(headers,rows){var h='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>';headers.forEach(function(hd){h+='<th style="text-align:left;padding:8px 10px;color:#607870;font-weight:600;text-transform:uppercase;font-size:10px;border-bottom:1px solid rgba(0,200,150,.08)">'+hd+'</th>';});h+='</tr></thead><tbody>';rows.forEach(function(row){h+='<tr>';row.forEach(function(cell){h+='<td style="padding:8px 10px;border-bottom:1px solid rgba(0,200,150,.04);color:#B8D8D0">'+cell+'</td>';});h+='</tr>';});h+='</tbody></table></div>';return h;}

// ═══ 1. CENTERS (Cơ Sở) ═══
window.renderRealCenters = function(){
  var c=el();if(!c)return;c.innerHTML='<div style="padding:20px;color:#607870">Loading...</div>';
  sb('centers',{order:'created_at.asc',limit:50}).then(function(centers){
    var active=centers.filter(function(c){return c.status==='active';}).length;
    var h='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px">';
    h+=kpi('Tổng cơ sở',centers.length,'#00C896')+kpi('Hoạt động',active,'#22C55E')+kpi('Đang setup',centers.length-active,'#FFB800');
    h+='</div>';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-size:16px;font-weight:700;color:#F8F2E0">Danh sách cơ sở</span><button onclick="window._addCenter()" style="padding:6px 14px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:8px;color:#000;font-size:12px;font-weight:700;cursor:pointer">+ Thêm cơ sở</button></div>';
    var rows=centers.map(function(c){return [
      '<span style="color:#7B5FFF;font-family:monospace;font-size:11px">'+c.center_id+'</span>',
      '<strong style="color:#F8F2E0">'+c.name+'</strong>',c.city||'—',c.region||'—',
      badge(c.status==='active'?'Hoạt động':'Setup',c.status==='active'?'green':'yellow'),
      'Tier '+c.tier, (c.staff_count||0)+' KTV',
      '<span style="color:#FFB800">★ '+(c.rating||5.0)+'</span>'
    ];});
    h+=table(['ID','Tên','Thành phố','Vùng','Trạng thái','Tier','KTV','Rating'],rows);
    c.innerHTML=h;
  });
};
window._addCenter=function(){var id=prompt('Mã cơ sở (VD: CTR-BN):');if(!id)return;var name=prompt('Tên:');var city=prompt('Thành phố:');sbPost('centers',{center_id:id,name:name||'',city:city||'',region:'',tier:1,status:'setup'}).then(function(){renderRealCenters();});};

// ═══ 2. MEMBERS (Khách Hàng) ═══
window.renderRealMembers = function(){
  var c=el();if(!c)return;c.innerHTML='<div style="padding:20px;color:#607870">Loading...</div>';
  Promise.all([sb('users',{order:'created_at.desc',limit:200}),sb('orders',{select:'customer_phone,total_amount',limit:1000})]).then(function(res){
    var users=res[0]||[],orders=res[1]||[];
    // Calculate spend per user
    var spendMap={};orders.forEach(function(o){var k=o.customer_phone||'';spendMap[k]=(spendMap[k]||0)+(o.total_amount||0);});
    var h='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px">';
    h+=kpi('Tổng thành viên',users.length,'#00C896')+kpi('Đã xác minh',users.filter(function(u){return u.email_verified;}).length,'#22C55E')+kpi('Google Auth',users.filter(function(u){return u.provider==='google';}).length,'#60A5FA');
    h+='</div>';
    h+='<div style="font-size:16px;font-weight:700;color:#F8F2E0;margin-bottom:12px">Danh sách thành viên ('+users.length+')</div>';
    var rows=users.map(function(u){
      var spend=spendMap[u.phone||'']||0;
      var tier=spend>20000000?'Premium':spend>5000000?'VIP':spend>0?'Khách':'Mới';
      var tierColor=tier==='Premium'?'purple':tier==='VIP'?'blue':tier==='Khách'?'green':'yellow';
      return [
        '<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#005A42,#00C896);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#000">'+(u.name||'U')[0]+'</div><div><div style="font-weight:600;color:#F8F2E0;font-size:12px">'+(u.name||'—')+'</div><div style="font-size:10px;color:#607870">'+(u.email||'')+'</div></div></div>',
        u.phone||'—', badge(tier,tierColor), '<span style="color:#FFB800;font-weight:600">'+money(spend)+'</span>',
        u.provider==='google'?'<span style="color:#4285F4;font-size:10px">Google</span>':'Email',
        u.email_verified?badge('Verified','green'):badge('Chưa','yellow'),
        new Date(u.created_at).toLocaleDateString('vi-VN')
      ];
    });
    h+=table(['Thành viên','SĐT','Hạng','Chi tiêu','Nguồn','Email','Ngày ĐK'],rows);
    c.innerHTML=h;
  });
};

// ═══ 3. REVENUE (Doanh Thu) ═══
window.renderRealRevenue = function(){
  var c=el();if(!c)return;c.innerHTML='<div style="padding:20px;color:#607870">Loading...</div>';
  Promise.all([
    sb('orders',{select:'total_amount,order_status,commission,created_at,payment_status',limit:1000}),
    sb('bookings',{select:'service_price,commission,status,created_at',limit:1000}),
    sb('withdrawals',{select:'amount,status,created_at',limit:200})
  ]).then(function(res){
    var orders=res[0]||[],bookings=res[1]||[],withdrawals=res[2]||[];
    var orderRev=orders.reduce(function(s,o){return s+(o.total_amount||0);},0);
    var bookRev=bookings.reduce(function(s,b){return s+(b.service_price||0);},0);
    var gmv=orderRev+bookRev;
    var commission=orders.reduce(function(s,o){return s+(o.commission||0);},0)+bookings.reduce(function(s,b){return s+(b.commission||0);},0);
    var paidOrders=orders.filter(function(o){return o.payment_status==='paid';});
    var paidRev=paidOrders.reduce(function(s,o){return s+(o.total_amount||0);},0);
    var pendingWD=withdrawals.filter(function(w){return w.status==='pending';}).reduce(function(s,w){return s+(w.amount||0);},0);

    var h='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:20px">';
    h+=kpi('GMV',money(gmv),'#00C896')+kpi('Sản phẩm',money(orderRev),'#60A5FA')+kpi('Dịch vụ',money(bookRev),'#9B82FF');
    h+=kpi('Đã thu',money(paidRev),'#22C55E')+kpi('Hoa hồng',money(commission),'#FFB800')+kpi('Chờ rút',money(pendingWD),'#FF4D6D');
    h+='</div>';

    // Revenue by month chart placeholder
    h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">';
    h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:16px"><div style="font-size:14px;font-weight:700;color:#F8F2E0;margin-bottom:12px">Doanh thu theo ngày</div><canvas id="revChart" height="200"></canvas></div>';
    h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:16px"><div style="font-size:14px;font-weight:700;color:#F8F2E0;margin-bottom:12px">SP vs DV</div><canvas id="revPieChart" height="200"></canvas></div>';
    h+='</div>';

    // Order list
    h+='<div style="font-size:14px;font-weight:700;color:#F8F2E0;margin-bottom:8px">Giao dịch gần đây</div>';
    var recentOrders=orders.slice(0,15);
    var rows=recentOrders.map(function(o){return [
      new Date(o.created_at).toLocaleDateString('vi-VN'),
      '<span style="color:#FFB800;font-weight:600">'+money(o.total_amount)+'</span>',
      badge(o.payment_status==='paid'?'Đã thu':'Chưa thu',o.payment_status==='paid'?'green':'yellow'),
      badge(o.order_status||'pending',o.order_status==='delivered'?'green':o.order_status==='cancelled'?'red':'blue'),
      '<span style="color:#00C896">'+money(o.commission)+'</span>'
    ];});
    h+=table(['Ngày','Doanh thu','Thu tiền','Đơn hàng','Hoa hồng'],rows);
    c.innerHTML=h;

    // Render charts
    if(typeof Chart!=='undefined'){
      Chart.defaults.color='#607870';Chart.defaults.borderColor='rgba(0,200,150,.08)';
      // Daily revenue (last 7 days)
      var days=[],revs=[];
      for(var d=6;d>=0;d--){var dt=new Date();dt.setDate(dt.getDate()-d);var key=dt.toISOString().split('T')[0];days.push(dt.toLocaleDateString('vi-VN',{day:'numeric',month:'short'}));
        var dayRev=orders.filter(function(o){return o.created_at&&o.created_at.startsWith(key);}).reduce(function(s,o){return s+(o.total_amount||0);},0);
        dayRev+=bookings.filter(function(b){return b.created_at&&b.created_at.startsWith(key);}).reduce(function(s,b){return s+(b.service_price||0);},0);
        revs.push(dayRev);
      }
      new Chart(document.getElementById('revChart'),{type:'bar',data:{labels:days,datasets:[{label:'Doanh thu',data:revs,backgroundColor:'rgba(0,200,150,.6)',borderRadius:4}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{ticks:{callback:function(v){return(v/1000000).toFixed(1)+'M';}}}}}});
      // Pie: products vs services
      new Chart(document.getElementById('revPieChart'),{type:'doughnut',data:{labels:['Sản phẩm','Dịch vụ'],datasets:[{data:[orderRev,bookRev],backgroundColor:['#60A5FA','#9B82FF']}]},options:{responsive:true,plugins:{legend:{position:'bottom'}}}});
    }
  });
};

// ═══ 4. STAFF (Kỹ Thuật Viên) ═══
window.renderRealStaff = function(){
  var c=el();if(!c)return;c.innerHTML='<div style="padding:20px;color:#607870">Loading...</div>';
  Promise.all([sb('staff',{order:'created_at.desc',limit:100}),sb('kyc_requests',{order:'created_at.desc',limit:100})]).then(function(res){
    var staff=res[0]||[],kyc=res[1]||[];
    var active=staff.filter(function(s){return s.status==='active';}).length;
    var pendingKYC=kyc.filter(function(k){return k.status==='pending';}).length;
    var h='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px">';
    h+=kpi('Tổng KTV',staff.length,'#00C896')+kpi('Hoạt động',active,'#22C55E')+kpi('KYC chờ',pendingKYC,'#FFB800');
    h+='</div>';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-size:16px;font-weight:700;color:#F8F2E0">Kỹ Thuật Viên</span><button onclick="window._addStaff()" style="padding:6px 14px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:8px;color:#000;font-size:12px;font-weight:700;cursor:pointer">+ Thêm KTV</button></div>';
    // Merge KYC approved as staff
    var allStaff=staff.slice();
    kyc.filter(function(k){return k.status==='approved';}).forEach(function(k){
      if(!allStaff.find(function(s){return s.phone===k.ktv_phone;})){
        allStaff.push({name:k.ktv_name,phone:k.ktv_phone,email:k.ktv_email,center_id:k.center_id,status:'active',rating:5.0,total_bookings:0});
      }
    });
    var rows=allStaff.map(function(s){
      var specs=[];try{specs=typeof s.specialties==='string'?JSON.parse(s.specialties):s.specialties||[];}catch(e){}
      return [
        '<div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#9B82FF,#7B5FFF);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff">'+(s.name||'K')[0]+'</div><strong style="color:#F8F2E0;font-size:12px">'+(s.name||'—')+'</strong></div>',
        s.phone||'—', s.center_id||'—', badge(s.status==='active'?'Active':'Inactive',s.status==='active'?'green':'yellow'),
        '<span style="color:#FFB800">★ '+(s.rating||5.0)+'</span>', (s.total_bookings||0)+' buổi',
        specs.slice(0,2).join(', ')||'—'
      ];
    });
    h+=table(['KTV','SĐT','Cơ sở','Status','Rating','Bookings','Chuyên môn'],rows);
    c.innerHTML=h;
  });
};
window._addStaff=function(){var n=prompt('Tên KTV:');if(!n)return;var p=prompt('SĐT:');var cid=prompt('Mã cơ sở (VD: CTR-HN):');sbPost('staff',{name:n,phone:p||'',center_id:cid||'',status:'active'}).then(function(){renderRealStaff();});};

// ═══ 5. FRANCHISE (Nhượng Quyền) ═══
window.renderRealFranchise = function(){
  var c=el();if(!c)return;c.innerHTML='<div style="padding:20px;color:#607870">Loading...</div>';
  sb('centers',{order:'created_at.asc',limit:50}).then(function(centers){
    var h='<div style="font-size:16px;font-weight:700;color:#F8F2E0;margin-bottom:16px">Nhượng Quyền — 34 Tỉnh Thành</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:16px">';
    h+=kpi('Đã mở',centers.filter(function(c){return c.status==='active';}).length,'#22C55E');
    h+=kpi('Đang setup',centers.filter(function(c){return c.status==='setup';}).length,'#FFB800');
    h+=kpi('Còn trống',34-centers.length,'#607870');
    h+='</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">';
    centers.forEach(function(ct){
      var isActive=ct.status==='active';
      h+='<div style="background:rgba('+(isActive?'0,200,150':'255,184,0')+',.04);border:1px solid rgba('+(isActive?'0,200,150':'255,184,0')+',.15);border-radius:12px;padding:14px;text-align:center">';
      h+='<div style="font-size:14px;font-weight:700;color:#F8F2E0;margin-bottom:4px">'+ct.city+'</div>';
      h+='<div style="font-size:11px;color:#607870;margin-bottom:6px">'+ct.name+'</div>';
      h+=badge(isActive?'Hoạt động':'Setup',isActive?'green':'yellow');
      h+='</div>';
    });
    h+='</div>';
    c.innerHTML=h;
  });
};

// ═══ 6. CONTENT / CMS ═══
window.renderRealCMS = function(){
  var c=el();if(!c)return;c.innerHTML='<div style="padding:20px;color:#607870">Loading...</div>';
  sb('blog_posts',{order:'created_at.desc',limit:50}).then(function(posts){
    var h='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><span style="font-size:16px;font-weight:700;color:#F8F2E0">CMS / Blog ('+posts.length+')</span><button onclick="window._addPost()" style="padding:6px 14px;background:linear-gradient(135deg,#005A42,#00C896);border:none;border-radius:8px;color:#000;font-size:12px;font-weight:700;cursor:pointer">+ Bài viết mới</button></div>';
    if(!posts.length){
      h+='<div style="text-align:center;padding:40px;color:#607870"><div style="font-size:36px;margin-bottom:8px;opacity:.4">📝</div>Chưa có bài viết. Bấm "+ Bài viết mới" để bắt đầu.</div>';
    } else {
      var rows=posts.map(function(p){return [
        '<strong style="color:#F8F2E0">'+p.title+'</strong>',
        badge(p.status==='published'?'Published':'Draft',p.status==='published'?'green':'yellow'),
        p.category||'—', p.author||'Admin', (p.views||0)+' views',
        new Date(p.created_at).toLocaleDateString('vi-VN'),
        '<button onclick="window._editPost(\''+p.id+'\')" style="padding:3px 8px;background:rgba(0,200,150,.1);border:1px solid rgba(0,200,150,.2);border-radius:6px;color:#00C896;font-size:10px;cursor:pointer">Sửa</button>'
      ];});
      h+=table(['Tiêu đề','Status','Danh mục','Tác giả','Views','Ngày',''],rows);
    }
    c.innerHTML=h;
  });
};
window._addPost=function(){var t=prompt('Tiêu đề bài viết:');if(!t)return;var cat=prompt('Danh mục (blog/news/guide):','blog');sbPost('blog_posts',{title:t,category:cat||'blog',author:'Admin',status:'draft',slug:t.toLowerCase().replace(/[^a-z0-9]+/g,'-')}).then(function(){renderRealCMS();});};
window._editPost=function(id){var t=prompt('Tiêu đề mới:');if(!t)return;sbPatch('blog_posts','id=eq.'+id,{title:t}).then(function(){renderRealCMS();});};

// ═══ 7. AUDIT LOG ═══
window.renderRealAudit = function(){
  var c=el();if(!c)return;c.innerHTML='<div style="padding:20px;color:#607870">Loading...</div>';
  sb('audit_log',{order:'created_at.desc',limit:100}).then(function(logs){
    var h='<div style="font-size:16px;font-weight:700;color:#F8F2E0;margin-bottom:16px">Nhật ký hệ thống ('+logs.length+')</div>';
    if(!logs.length){
      h+='<div style="text-align:center;padding:40px;color:#607870">Chưa có log. Các thao tác admin sẽ được ghi nhận tự động.</div>';
    } else {
      var rows=logs.map(function(l){return [
        new Date(l.created_at).toLocaleString('vi-VN'),
        '<strong style="color:#F8F2E0">'+(l.user_name||'System')+'</strong>',
        badge(l.action||'unknown','blue'), l.target||'—', '<span style="font-size:11px;color:#607870">'+(l.details||'')+'</span>'
      ];});
      h+=table(['Thời gian','User','Action','Target','Chi tiết'],rows);
    }
    c.innerHTML=h;
  });
};

// ═══ 8. SETTINGS (real) ═══
window.renderRealSettings = function(){
  var c=el();if(!c)return;
  var h='<div style="max-width:600px">';
  h+='<div style="font-size:16px;font-weight:700;color:#F8F2E0;margin-bottom:16px">Cài đặt hệ thống</div>';
  // System info
  h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:16px;margin-bottom:12px">';
  h+='<div style="font-size:13px;font-weight:600;color:#00C896;margin-bottom:12px">Thông tin hệ thống</div>';
  h+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">';
  h+='<div><span style="color:#607870">Version:</span> <strong style="color:#F8F2E0">v3.0 Phase 2</strong></div>';
  h+='<div><span style="color:#607870">Database:</span> <strong style="color:#22C55E">Supabase (22 tables)</strong></div>';
  h+='<div><span style="color:#607870">Payment:</span> <strong style="color:#FFB800">PayOS Active</strong></div>';
  h+='<div><span style="color:#607870">AI:</span> <strong style="color:#9B82FF">Gemini 2.5 Flash</strong></div>';
  h+='<div><span style="color:#607870">Domain:</span> <strong style="color:#60A5FA">animacare.global</strong></div>';
  h+='<div><span style="color:#607870">Hosting:</span> <strong style="color:#F8F2E0">GitHub Pages</strong></div>';
  h+='</div></div>';
  // Commission settings
  h+='<div style="background:rgba(0,200,150,.03);border:1px solid rgba(0,200,150,.08);border-radius:12px;padding:16px;margin-bottom:12px">';
  h+='<div style="font-size:13px;font-weight:600;color:#00C896;margin-bottom:12px">Hoa hồng</div>';
  h+='<div style="font-size:12px;color:#B8D8D0;line-height:2">';
  h+='Sản phẩm (L1 độc quyền): <strong style="color:#FFB800">25%</strong><br>';
  h+='Dịch vụ (L1 độc quyền): <strong style="color:#FFB800">40%</strong><br>';
  h+='KTV nhận: <strong style="color:#22C55E">70%</strong> hoa hồng | Center: <strong style="color:#60A5FA">30%</strong><br>';
  h+='Override L1 từ L2: <strong style="color:#9B82FF">5%</strong>';
  h+='</div></div>';
  // Danger zone
  h+='<div style="background:rgba(255,77,109,.03);border:1px solid rgba(255,77,109,.15);border-radius:12px;padding:16px">';
  h+='<div style="font-size:13px;font-weight:600;color:#FF4D6D;margin-bottom:8px">Danger Zone</div>';
  h+='<button onclick="if(confirm(\'Xóa toàn bộ localStorage?\')){localStorage.clear();location.reload();}" style="padding:8px 16px;background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.2);border-radius:8px;color:#FF4D6D;font-size:12px;cursor:pointer">Clear localStorage</button>';
  h+='</div></div>';
  c.innerHTML=h;
};

// ═══ INVESTORS (keep as-is — static data by design) ═══

console.log('[Admin] Real pages loaded — 8 Supabase renderers');
})();
