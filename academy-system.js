/* AnimaCare Academy System — KTV Online Training Platform */
(function(){
const t=(v,e)=>((window._lang||'vi')==='en'?e:v);
const CAT={foundation:'🏛',technique:'💆',technology:'🤖',product:'💊',soft_skill:'🤝',management:'📊'};
const S={bg:'#0A1218',accent:'#00C896',purple:'#9B82FF',txt:'#F8F2E0',card:'#111C25',border:'#1E2D3A',blue:'#3B82F6',green:'#22C55E',gray:'#6B7280'};
const db=()=>({courses:window.AnimaCourses,enroll:window.AnimaEnrollments});

function courseCard(c,enrollment,showEnroll,ktvId,ktvName){
  const status=enrollment?(enrollment.progress>=100?'completed':'enrolled'):'available';
  const color=status==='completed'?S.green:status==='enrolled'?S.blue:S.gray;
  const icon=CAT[c.category]||'📚';
  const pct=enrollment?Math.min(enrollment.progress,100):0;
  const cert=status==='completed'?`<span style="color:gold;font-size:18px" title="${t('Chứng chỉ','Certificate')}">🛡️</span>`:'';
  let btn='';
  if(status==='available'&&showEnroll) btn=`<button onclick="enrollCourse('${ktvId}','${ktvName}','${c.id}','${c.title}')" style="background:${S.accent};color:#000;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-weight:600;margin-top:8px">${t('Đăng ký','Enroll')}</button>`;
  if(status==='enrolled'&&enrollment) btn=`<div style="margin-top:8px"><div style="background:${S.border};border-radius:4px;height:8px;overflow:hidden"><div style="width:${pct}%;height:100%;background:${S.accent};border-radius:4px;transition:width .3s"></div></div><span style="font-size:11px;color:${S.gray}">${pct}%</span></div>`;
  return `<div style="background:${S.card};border:1px solid ${S.border};border-radius:12px;padding:16px;min-width:220px;border-left:3px solid ${color}">
    <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:28px">${icon}</span>${cert}<span style="background:${S.purple};color:#fff;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600">L${c.level||1}</span></div>
    <h4 style="color:${S.txt};margin:8px 0 4px">${c.title}</h4>
    <p style="color:${S.gray};font-size:12px;margin:0">${c.duration||'--'} ${t('phút','min')} · ${t(c.category,c.category)}</p>
    ${btn}</div>`;
}

window.renderAcademyTab=async function(containerId,ktvId,ktvName){
  const el=document.getElementById(containerId);if(!el)return;
  const {courses,enroll}=db();
  let allC=[],myE=[];
  try{
    allC=await courses.getAll()||[];
    myE=await enroll.getByKTV(ktvId)||[];
  }catch(e){console.error('Academy load err',e);}
  const eMap={};myE.forEach(e=>eMap[e.course_id]=e);
  const enrolled=allC.filter(c=>eMap[c.id]&&eMap[c.id].progress<100);
  const completed=allC.filter(c=>eMap[c.id]&&eMap[c.id].progress>=100);
  const available=allC.filter(c=>!eMap[c.id]);
  el.innerHTML=`<div style="padding:20px;background:${S.bg};color:${S.txt};min-height:100vh">
    <h2 style="color:${S.purple}">🎓 ${t('Học viện AnimaCare','AnimaCare Academy')}</h2>
    <p style="color:${S.gray}">${t('Chào','Hi')} ${ktvName} — ${enrolled.length} ${t('đang học','in progress')}, ${completed.length} ${t('hoàn thành','completed')}</p>
    ${section(t('Đang học','In Progress'),enrolled,eMap,true,ktvId,ktvName)}
    ${section(t('Hoàn thành','Completed'),completed,eMap,false,ktvId,ktvName)}
    ${section(t('Khóa học mới','Available Courses'),available,eMap,true,ktvId,ktvName)}
  </div>`;
};

function section(title,courses,eMap,showEnroll,ktvId,ktvName){
  if(!courses.length)return '';
  return `<h3 style="color:${S.accent};margin:20px 0 10px">${title}</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px">
    ${courses.map(c=>courseCard(c,eMap[c.id],showEnroll,ktvId,ktvName)).join('')}</div>`;
}

window.enrollCourse=async function(ktvId,ktvName,courseId,courseTitle){
  const{enroll}=db();
  try{
    await enroll.create({ktv_id:ktvId,ktv_name:ktvName,course_id:courseId,course_title:courseTitle,progress:0,status:'enrolled',enrolled_at:new Date().toISOString()});
    alert(t('Đăng ký thành công!','Enrolled successfully!'));
    if(window._academyRefresh)window._academyRefresh();
  }catch(e){alert(t('Lỗi đăng ký','Enrollment error')+': '+e.message);}
};

window.updateProgress=async function(enrollmentId,progressPct){
  const{enroll}=db();
  const pct=Math.max(0,Math.min(100,Number(progressPct)));
  const upd={progress:pct};if(pct>=100){upd.status='completed';upd.completed_at=new Date().toISOString();upd.certificate_id='CERT-'+Date.now().toString(36).toUpperCase();}
  try{
    await enroll.update(enrollmentId,upd);
  }catch(e){console.error('Progress update err',e);}
};

window.completeCourse=async function(enrollmentId){
  await window.updateProgress(enrollmentId,100);
  if(window._academyRefresh)window._academyRefresh();
};

window.renderAdmAcademy=async function(){
  const{courses,enroll}=db();
  let allC=[],allE=[];
  try{
    allC=await courses.getAll()||[];
    allE=await enroll.getAll()||[];
  }catch(e){console.error(e);}
  const total=allC.length,totalE=allE.length;
  const done=allE.filter(e=>e.progress>=100).length;
  const rate=totalE?Math.round(done/totalE*100):0;
  const active=new Set(allE.filter(e=>e.progress>0&&e.progress<100).map(e=>e.ktv_id)).size;
  const cMap={};allE.forEach(e=>{if(!cMap[e.course_id])cMap[e.course_id]={enrolled:0,done:0};cMap[e.course_id].enrolled++;if(e.progress>=100)cMap[e.course_id].done++;});

  const kpi=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px">
    ${kpiCard(t('Khóa học','Courses'),total,'📚',S.purple)}
    ${kpiCard(t('Đăng ký','Enrollments'),totalE,'📝',S.blue)}
    ${kpiCard(t('Tỉ lệ HT','Completion'),rate+'%','🎯',S.green)}
    ${kpiCard(t('Đang học','Active'),active,'👨‍🎓',S.accent)}</div>`;

  const cRows=allC.map(c=>{const s=cMap[c.id]||{enrolled:0,done:0};const r=s.enrolled?Math.round(s.done/s.enrolled*100):0;
    return `<tr style="border-bottom:1px solid ${S.border}"><td style="padding:8px">${CAT[c.category]||''} ${c.title}</td><td>L${c.level||1}</td><td>${s.enrolled}</td><td><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;background:${S.border};border-radius:4px;height:6px"><div style="width:${r}%;height:100%;background:${S.accent};border-radius:4px"></div></div><span style="font-size:11px">${r}%</span></div></td></tr>`;}).join('');

  const eRows=allE.slice(0,50).map(e=>{const color=e.progress>=100?S.green:e.progress>0?S.blue:S.gray;
    return `<tr style="border-bottom:1px solid ${S.border}"><td style="padding:8px">${e.ktv_name||'--'}</td><td>${e.course_title||'--'}</td><td><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;background:${S.border};border-radius:4px;height:6px"><div style="width:${e.progress}%;height:100%;background:${color};border-radius:4px"></div></div><span style="font-size:11px">${e.progress}%</span></div></td><td style="color:${color}">${e.status||'--'}</td></tr>`;}).join('');

  const container=document.getElementById('main-content')||document.body;
  container.innerHTML=`<div style="padding:24px;background:${S.bg};color:${S.txt};min-height:100vh">
    <h2 style="color:${S.purple}">🎓 ${t('Quản lý Học viện','Academy Management')}</h2>${kpi}
    <h3 style="color:${S.accent}">${t('Khóa học','Courses')}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px"><thead><tr style="color:${S.gray};text-align:left"><th style="padding:8px">${t('Khóa','Course')}</th><th>${t('Cấp','Level')}</th><th>${t('Đăng ký','Enrolled')}</th><th>${t('Hoàn thành','Completion')}</th></tr></thead><tbody>${cRows}</tbody></table>
    <h3 style="color:${S.accent}">${t('Học viên','Enrollments')}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:${S.gray};text-align:left"><th style="padding:8px">KTV</th><th>${t('Khóa','Course')}</th><th>${t('Tiến độ','Progress')}</th><th>${t('Trạng thái','Status')}</th></tr></thead><tbody>${eRows}</tbody></table></div>`;
};

window.renderAdmCourseManager=async function(){
  const{courses}=db();let allC=[];
  try{allC=await courses.getAll()||[];}catch(e){console.error(e);}
  const cats=Object.keys(CAT);
  const form=`<div style="background:${S.card};border:1px solid ${S.border};border-radius:12px;padding:16px;margin-bottom:20px">
    <h3 style="color:${S.accent};margin:0 0 12px">${t('Thêm khóa học','Add Course')}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;align-items:end">
      <input id="ac-title" placeholder="${t('Tên khóa','Course title')}" style="padding:8px;border-radius:6px;border:1px solid ${S.border};background:${S.bg};color:${S.txt}">
      <select id="ac-cat" style="padding:8px;border-radius:6px;border:1px solid ${S.border};background:${S.bg};color:${S.txt}">${cats.map(c=>`<option value="${c}">${CAT[c]} ${c}</option>`).join('')}</select>
      <select id="ac-level" style="padding:8px;border-radius:6px;border:1px solid ${S.border};background:${S.bg};color:${S.txt}">${[1,2,3,4].map(l=>`<option value="${l}">L${l}</option>`).join('')}</select>
      <button onclick="_addCourse()" style="background:${S.accent};color:#000;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-weight:600">${t('Thêm','Add')}</button>
    </div></div>`;
  const rows=allC.map(c=>`<tr style="border-bottom:1px solid ${S.border}"><td style="padding:8px">${CAT[c.category]||''} ${c.title}</td><td>L${c.level||1}</td><td>${c.category}</td><td>${c.duration||'--'} ${t('phút','min')}</td><td><button onclick="_delCourse('${c.id}')" style="background:#EF4444;color:#fff;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:11px">${t('Xóa','Del')}</button></td></tr>`).join('');
  const container=document.getElementById('main-content')||document.body;
  container.innerHTML=`<div style="padding:24px;background:${S.bg};color:${S.txt};min-height:100vh">
    <h2 style="color:${S.purple}">📝 ${t('Quản lý khóa học','Course Manager')}</h2>${form}
    <table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="color:${S.gray};text-align:left"><th style="padding:8px">${t('Khóa','Course')}</th><th>${t('Cấp','Level')}</th><th>${t('Danh mục','Category')}</th><th>${t('Thời lượng','Duration')}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
};

window._addCourse=async function(){
  const title=document.getElementById('ac-title').value.trim();if(!title)return;
  const cat=document.getElementById('ac-cat').value;
  const level=Number(document.getElementById('ac-level').value);
  const{courses}=db();
  try{await courses.create({title:title,category:cat,level:level,duration:60});window.renderAdmCourseManager();}catch(e){alert(e.message);}
};
window._delCourse=async function(id){
  if(!confirm(t('Xóa khóa học?','Delete course?')))return;
  const{courses}=db();
  try{await courses.update(id,{status:'archived'});window.renderAdmCourseManager();}catch(e){alert(e.message);}
};

function kpiCard(label,value,icon,color){
  return `<div style="background:${S.card};border:1px solid ${S.border};border-radius:12px;padding:16px;text-align:center">
    <div style="font-size:24px">${icon}</div><div style="font-size:28px;font-weight:700;color:${color}">${value}</div><div style="font-size:12px;color:${S.gray}">${label}</div></div>`;
}
})();
