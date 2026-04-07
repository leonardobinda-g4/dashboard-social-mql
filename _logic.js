const FEED_METRICS=[
  {key:'reach',label:'Alcance',color:'#b91c8c',idx:2},
  {key:'likes',label:'Curtidas',color:'#16a34a',idx:3},
  {key:'comments',label:'Comentários',color:'#eab308',idx:4},
  {key:'shares',label:'Compartilhamentos',color:'#f43f5e',idx:5},
  {key:'saves',label:'Salvamentos',color:'#d97706',idx:6},
  {key:'total_interactions',label:'Total de Interações',color:'#dc2626',idx:8},
  {key:'bio_link_clicked',label:'Cliques Bio',color:'#e85d04',idx:7},
  {key:'spend',label:'Impulsionado (R$)',color:'#059669',idx:null},
];
// storyMetricsRaw format: [date, reach, replies, shares, total_interactions, views]
const STORY_METRICS=[
  {key:'st_count',label:'Qtd Stories',color:'#15803d',src:'count'},
  {key:'st_reach',label:'Alcance',color:'#65a30d',src:'reach',idx:1},
  {key:'st_replies',label:'Respostas',color:'#ca8a04',src:'metric',idx:2},
  {key:'st_shares',label:'Compartilhamentos',color:'#ea580c',src:'metric',idx:3},
  {key:'st_interactions',label:'Total Interações',color:'#c2410c',src:'metric',idx:4},
  {key:'st_views',label:'Visualizações',color:'#a16207',src:'metric',idx:5},
];
const METRICS=[...FEED_METRICS,...STORY_METRICS];
const activeMetrics=new Set([]);
const MQL_TYPES=['bio','stories','outros'];
let activeMqlTypes=new Set(['bio','stories','outros']);
const PERFIL_INSTA={tallis:'tallisgomes',alfredo:'alfredosoares',g4:'g4educacao',nardon:'bruno.nardon'};
const MAIN_PERFIS=['tallis','alfredo','g4','nardon'];
let selectedPerfis=new Set(['todos']);
let currentRange=30;
let customFrom=null, customTo=null;

// ── Generic dropdown toggle ──
function toggleFilterDD(name){
  const trigger=document.getElementById(name+'Trigger');
  const dd=document.getElementById(name+'Dropdown');
  // Close all other dropdowns first
  document.querySelectorAll('.filter-dropdown.open').forEach(el=>{
    if(el!==dd){el.classList.remove('open');el.previousElementSibling?.classList?.remove('open');}
  });
  document.querySelectorAll('.filter-trigger.open').forEach(el=>{
    if(el!==trigger) el.classList.remove('open');
  });
  trigger.classList.toggle('open');
  dd.classList.toggle('open');
}
document.addEventListener('click',function(e){
  if(!e.target.closest('.filter-wrap')){
    document.querySelectorAll('.filter-dropdown.open').forEach(el=>el.classList.remove('open'));
    document.querySelectorAll('.filter-trigger.open').forEach(el=>el.classList.remove('open'));
  }
});

// ── PERÍODO ──
function pickPeriodo(el){
  const v=el.dataset.v;
  // Remove selected from all options in this dropdown
  el.closest('.filter-dropdown').querySelectorAll('.dd-option').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected');

  const today=new Date();
  const iso=d=>d.toISOString().slice(0,10);
  customFrom=null; customTo=null;

  if(v==='ytd'){
    customFrom=today.getFullYear()+'-01-01';
    customTo=iso(today);
    currentRange=-1;
  } else if(v==='this_week'){
    const day=today.getDay(); const diff=day===0?6:day-1;
    const mon=new Date(today); mon.setDate(mon.getDate()-diff);
    customFrom=iso(mon); customTo=iso(today); currentRange=-1;
  } else if(v==='this_month'){
    customFrom=iso(today).slice(0,8)+'01';
    customTo=iso(today); currentRange=-1;
  } else if(v==='this_quarter'){
    const q=Math.floor(today.getMonth()/3);
    customFrom=today.getFullYear()+'-'+String(q*3+1).padStart(2,'0')+'-01';
    customTo=iso(today); currentRange=-1;
  } else if(v==='this_year'){
    customFrom=today.getFullYear()+'-01-01';
    customTo=iso(today); currentRange=-1;
  } else if(v==='prev_week'){
    const day=today.getDay(); const diff=day===0?6:day-1;
    const mon=new Date(today); mon.setDate(mon.getDate()-diff-7);
    const sun=new Date(mon); sun.setDate(sun.getDate()+6);
    customFrom=iso(mon); customTo=iso(sun); currentRange=-1;
  } else if(v==='prev_month'){
    const pm=new Date(today.getFullYear(),today.getMonth()-1,1);
    const pmEnd=new Date(today.getFullYear(),today.getMonth(),0);
    customFrom=iso(pm); customTo=iso(pmEnd); currentRange=-1;
  } else if(v==='prev_quarter'){
    const q=Math.floor(today.getMonth()/3);
    const pq=q===0?3:q-1;
    const yr=q===0?today.getFullYear()-1:today.getFullYear();
    const start=new Date(yr,pq*3,1);
    const end=new Date(yr,pq*3+3,0);
    customFrom=iso(start); customTo=iso(end); currentRange=-1;
  } else if(v==='prev_year'){
    const py=today.getFullYear()-1;
    customFrom=py+'-01-01'; customTo=py+'-12-31'; currentRange=-1;
  } else if(v==='2'){
    // Ontem
    const y=new Date(today); y.setDate(y.getDate()-1);
    customFrom=iso(y); customTo=iso(y); currentRange=-1;
  } else {
    currentRange=parseInt(v);
  }

  document.getElementById('periodoLabel').textContent=el.textContent.trim();
  // Close dropdown
  document.getElementById('periodoDropdown').classList.remove('open');
  document.getElementById('periodoTrigger').classList.remove('open');
  buildChart(); buildKPIs(); if(drilldownDate) renderDrilldown();
}

function applyCustomRange(){
  const f=document.getElementById('dateFrom').value;
  const t=document.getElementById('dateTo').value;
  if(f) customFrom=f;
  if(t) customTo=t;
  if(customFrom&&customTo){
    // Deselect presets
    document.querySelectorAll('#periodoDropdown .dd-option').forEach(o=>o.classList.remove('selected'));
    document.getElementById('periodoLabel').textContent='Personalizado';
    currentRange=-1;
    buildChart(); buildKPIs(); if(drilldownDate) renderDrilldown();
  }
}

// ── PERFIL ──
function clickPerfil(el){
  const p=el.dataset.p;
  if(p==='todos'){
    selectedPerfis=new Set(['todos']);
    el.closest('.filter-dropdown').querySelectorAll('.dd-option').forEach(o=>o.classList.remove('selected'));
    el.classList.add('selected');
  } else {
    const todosEl=el.closest('.filter-dropdown').querySelector('[data-p="todos"]');
    if(todosEl) todosEl.classList.remove('selected');
    selectedPerfis.delete('todos');
    if(el.classList.contains('selected')){el.classList.remove('selected');selectedPerfis.delete(p);}
    else{el.classList.add('selected');selectedPerfis.add(p);}
    if(selectedPerfis.size===0){selectedPerfis.add('todos');if(todosEl)todosEl.classList.add('selected');}
  }
  updatePerfilLabel(); buildChart(); buildKPIs(); if(drilldownDate) renderDrilldown();
}
function updatePerfilLabel(){
  const lbl=document.getElementById('perfilLabel');
  if(selectedPerfis.has('todos')){lbl.textContent='Todos os perfis';return;}
  const n={tallis:'Tallis',alfredo:'Alfredo',g4:'G4',nardon:'Nardon',outros:'Outros'};
  const arr=[...selectedPerfis].map(p=>n[p]||p);
  lbl.textContent=arr.length<=2?arr.join(', '):arr.slice(0,2).join(', ')+' +'+(arr.length-2);
}

// ── TIPO MQL ──
function clickMqlTypePill(el){
  const t=el.dataset.t;
  if(el.classList.contains('active')){el.classList.remove('active');activeMqlTypes.delete(t);}
  else{el.classList.add('active');activeMqlTypes.add(t);}
  if(activeMqlTypes.size===0){
    activeMqlTypes=new Set(['bio','stories','outros']);
    document.querySelectorAll('#mqlTypePills .metric-pill').forEach(p=>p.classList.add('active'));
  }
  buildKPIs(); buildChart(); if(drilldownDate) renderDrilldown();
}

// ── MÉTRICAS ──
function buildMetricPills(){
  const renderGroup=(metrics)=>metrics.map(m=>`<div class="metric-pill ${activeMetrics.has(m.key)?'active':''}" data-m="${m.key}" style="--pill-color:${m.color}" onclick="clickPill(this)"><span class="pill-dot"></span>${m.label}</div>`).join('');
  const feedWrap=document.getElementById('feedMetricPills');
  const storyWrap=document.getElementById('storyMetricPills');
  if(feedWrap) feedWrap.innerHTML=renderGroup(FEED_METRICS);
  if(storyWrap) storyWrap.innerHTML=renderGroup(STORY_METRICS);
}
function clickPill(el){
  const k=el.dataset.m;
  if(el.classList.contains('active')){el.classList.remove('active');activeMetrics.delete(k);}
  else{el.classList.add('active');activeMetrics.add(k);}
  buildChart();
}

// ── Data functions ──
function getMqlForPerfil(p){
  const m={};
  let rows;
  if(p==='todos') return Object.fromEntries(mqlRaw.map(r=>[r[0],parseInt(r[1])]));
  if(p==='outros') rows=mqlPerfilRaw.filter(r=>!MAIN_PERFIS.includes(r[1]));
  else rows=mqlPerfilRaw.filter(r=>r[1]===p);
  rows.forEach(r=>{m[r[0]]=(m[r[0]]||0)+parseInt(r[2]);});
  return m;
}
function getMqlMap(){
  if(selectedPerfis.has('todos')) return Object.fromEntries(mqlRaw.map(r=>[r[0],parseInt(r[1])]));
  const merged={};
  for(const p of selectedPerfis){const m=getMqlForPerfil(p);for(const[d,v]of Object.entries(m)){merged[d]=(merged[d]||0)+v;}}
  return merged;
}
function getInstaMap(){
  if(selectedPerfis.has('todos')) return Object.fromEntries(instaRaw.map(r=>[r[0],r]));
  const merged={};
  for(const p of selectedPerfis){
    const u=PERFIL_INSTA[p]; if(!u) continue;
    instaPerfilRaw.filter(r=>r[1]===u).forEach(r=>{
      const row=[r[0],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9]];
      if(!merged[r[0]]){merged[r[0]]=[...row];}
      else{for(let i=1;i<row.length;i++){if(row[i]!=null)merged[r[0]][i]=(parseInt(merged[r[0]][i]||0))+parseInt(row[i]);}}
    });
  }
  return merged;
}
function getAllDates(){
  if(selectedPerfis.has('todos')){const s=new Set([...mqlRaw.map(r=>r[0]),...instaRaw.map(r=>r[0])]);return[...s].sort();}
  const s=new Set();
  for(const p of selectedPerfis){
    let rows=p==='outros'?mqlPerfilRaw.filter(r=>!MAIN_PERFIS.includes(r[1])):mqlPerfilRaw.filter(r=>r[1]===p);
    rows.forEach(r=>s.add(r[0]));
    const u=PERFIL_INSTA[p]; if(u) instaPerfilRaw.filter(r=>r[1]===u).forEach(r=>s.add(r[0]));
  }
  return[...s].sort();
}
function filterDates(dates){
  if(customFrom&&customTo){
    return dates.filter(d=>d>=customFrom&&d<=customTo);
  }
  if(currentRange>=9999) return dates;
  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-currentRange);
  return dates.filter(d=>new Date(d)>=cutoff);
}

// Mapa: perfil do dashboard → linha_de_receita_vigente(s) na tabela de metas
const PERFIL_META_LINHA={
  tallis:  ['Form G4 Instagram Tallis'],
  alfredo: ['Form G4 Instagram Alfredo'],
  g4:      ['Form G4 Instagram G4'],
  nardon:  ['Form G4 Instagram Nardon'],
  outros:  ['Form G4 Instagram Outros','Form G4 Incompleto Instagram','Form G4 - K Instagram','Social - (Testes)','Social DM - Perfil K','[CM] Form G4 - Instagram','[IM] Social DM','[SKL] Social'],
};

// Proporção Bio/Stories por perfil (aproximação baseada em dados históricos)
const META_SPLIT={
  tallis: {bio:.55,stories:.45},
  alfredo:{bio:.55,stories:.45},
  g4:     {bio:.80,stories:.20},
  nardon: {bio:.60,stories:.40},
  outros: {bio:.56,stories:.38},
};

function getMetaTypeFactor(){
  const hasBio=activeMqlTypes.has('bio'), hasSt=activeMqlTypes.has('stories'), hasOut=activeMqlTypes.has('outros');
  // Se bio+stories selecionados (ou todos), retorna 1 (meta cheia)
  if(hasBio&&hasSt) return null; // null = sem ajuste, usa meta cheia
  // Se só outros, sem meta
  if(!hasBio&&!hasSt) return 0;
  // Calcula fator ponderado pelos perfis selecionados
  return (perfil)=>{
    const s=META_SPLIT[perfil]||META_SPLIT.outros;
    let f=0;
    if(hasBio) f+=s.bio;
    if(hasSt) f+=s.stories;
    return f;
  };
}

function getMetaMap(){
  const factor=getMetaTypeFactor();
  if(factor===0) return {}; // só outros selecionado → sem meta

  if(selectedPerfis.has('todos')){
    if(factor===null){
      // Meta cheia
      const m={};
      metaPerfilRaw.forEach(r=>{m[r[0]]=(m[r[0]]||0)+r[2];});
      return m;
    }
    // Precisa ajustar por perfil
    const m={};
    const perfilFromLinha={};
    for(const[p,linhas] of Object.entries(PERFIL_META_LINHA)){
      for(const l of linhas) perfilFromLinha[l]=p;
    }
    metaPerfilRaw.forEach(r=>{
      const p=perfilFromLinha[r[1]]||'outros';
      const f=factor(p);
      m[r[0]]=(m[r[0]]||0)+r[2]*f;
    });
    for(const d in m) m[d]=Math.round(m[d]);
    return m;
  }

  const m={};
  for(const p of selectedPerfis){
    const linhas=PERFIL_META_LINHA[p];
    if(!linhas) continue;
    const f=factor===null?1:factor(p);
    metaPerfilRaw.filter(r=>linhas.includes(r[1])).forEach(r=>{m[r[0]]=(m[r[0]]||0)+r[2]*f;});
  }
  for(const d in m) m[d]=Math.round(m[d]);
  return m;
}

function getMqlContentMap(){
  const useTodos=selectedPerfis.has('todos');
  const raw={};
  mqlPerfilContentRaw.forEach(r=>{
    const med=r[1];
    if(!useTodos){
      let match=false;
      for(const p of selectedPerfis){
        if(p==='outros'){if(!MAIN_PERFIS.includes(med)){match=true;break;}}
        else{if(med===p){match=true;break;}}
      }
      if(!match) return;
    }
    if(!raw[r[0]]) raw[r[0]]={bio:0,stories:0,outros:0};
    const tipo=r[2];
    raw[r[0]][tipo]=(raw[r[0]][tipo]||0)+parseInt(r[3]);
  });
  const qm=getMqlMap();
  const m={};
  for(const[d,v] of Object.entries(raw)){
    const total=v.bio+v.stories+v.outros;
    const mqlReal=qm[d]||0;
    if(total===0||mqlReal===0){
      m[d]={bio:0,stories:0,outros:0};
    } else {
      m[d]={
        bio:  Math.round(mqlReal*(v.bio/total)),
        stories: Math.round(mqlReal*(v.stories/total)),
        outros: 0
      };
      m[d].outros = mqlReal - m[d].bio - m[d].stories;
      if(m[d].outros<0) m[d].outros=0;
    }
  }
  return m;
}

function getStoryMetricsMap(){
  // storyMetricsPerfilRaw: [date, username, reach, replies, shares, total_interactions, views]
  // storyMetricsRaw (totals): [date, reach, replies, shares, total_interactions, views]
  if(selectedPerfis.has('todos')){
    if(typeof storyMetricsRaw==='undefined') return {};
    return Object.fromEntries(storyMetricsRaw.map(r=>[r[0],r]));
  }
  if(typeof storyMetricsPerfilRaw==='undefined') return {};
  const mainUsers=Object.values(PERFIL_INSTA);
  const merged={};
  const addRow=(r)=>{
    if(!merged[r[0]]) merged[r[0]]=[r[0],0,0,0,0,0];
    merged[r[0]][1]+=r[2]; merged[r[0]][2]+=r[3]; merged[r[0]][3]+=r[4]; merged[r[0]][4]+=r[5]; merged[r[0]][5]+=r[6];
  };
  for(const p of selectedPerfis){
    if(p==='outros'){
      storyMetricsPerfilRaw.filter(r=>!mainUsers.includes(r[1])).forEach(addRow);
    } else {
      const u=PERFIL_INSTA[p]; if(!u) continue;
      storyMetricsPerfilRaw.filter(r=>r[1]===u).forEach(addRow);
    }
  }
  return merged;
}
function getSpendMap(){
  // spendPerfilRaw: [date, perfil, spend, posts_boosted]
  // spendRaw: [date, spend, posts_boosted]
  if(typeof spendRaw==='undefined') return {};
  if(selectedPerfis.has('todos')) return Object.fromEntries(spendRaw.map(r=>[r[0],r[1]]));
  const m={};
  if(typeof spendPerfilRaw==='undefined') return {};
  const mainUsers=Object.values(PERFIL_INSTA);
  for(const p of selectedPerfis){
    if(p==='outros'){
      spendPerfilRaw.filter(r=>!mainUsers.includes(r[1])).forEach(r=>{m[r[0]]=(m[r[0]]||0)+r[2];});
    } else {
      const u=PERFIL_INSTA[p]; if(!u) continue;
      spendPerfilRaw.filter(r=>r[1]===u).forEach(r=>{m[r[0]]=(m[r[0]]||0)+r[2];});
    }
  }
  return m;
}
function getStoryCountMap(){
  // storiesRaw: [date, username, story_count]
  if(typeof storiesRaw==='undefined') return {};
  const m={};
  if(selectedPerfis.has('todos')){
    storiesRaw.forEach(r=>{m[r[0]]=(m[r[0]]||0)+r[2];});
  } else {
    const mainUsers=Object.values(PERFIL_INSTA);
    for(const p of selectedPerfis){
      if(p==='outros'){
        storiesRaw.filter(r=>!mainUsers.includes(r[1])).forEach(r=>{m[r[0]]=(m[r[0]]||0)+r[2];});
      } else {
        const u=PERFIL_INSTA[p]; if(!u) continue;
        storiesRaw.filter(r=>r[1]===u).forEach(r=>{m[r[0]]=(m[r[0]]||0)+r[2];});
      }
    }
  }
  return m;
}

function buildDatasets(dates){
  const qm=getMqlMap(),im=getInstaMap(),mm=getMetaMap(),cm=getMqlContentMap();
  const sm=getStoryMetricsMap(),sc=getStoryCountMap(),sp=getSpendMap();
  const bioData=dates.map(d=>activeMqlTypes.has('bio')?(cm[d]?.bio??null):null);
  const storiesData=dates.map(d=>activeMqlTypes.has('stories')?(cm[d]?.stories??null):null);
  const outrosData=dates.map(d=>activeMqlTypes.has('outros')?(cm[d]?.outros??null):null);
  const ds=[
    {type:'line',label:'Meta MQL',data:dates.map(d=>mm[d]??null),borderColor:'#000000',backgroundColor:'transparent',borderWidth:2,borderDash:[6,4],pointRadius:0,pointHoverRadius:3,tension:0,fill:false,yAxisID:'yMql',order:5,spanGaps:true,pointStyle:'line',segment:{borderDash:[6,4]}},
  ];
  if(activeMqlTypes.has('bio')) ds.push({type:'bar',label:'Bio',data:bioData,backgroundColor:'#1d4ed8',borderWidth:0,borderRadius:{topLeft:0,topRight:0,bottomLeft:3,bottomRight:3},yAxisID:'yMql',order:10,stack:'mql',pointStyle:'rectRounded'});
  if(activeMqlTypes.has('stories')) ds.push({type:'bar',label:'Stories',data:storiesData,backgroundColor:'#22d3ee',borderWidth:0,borderRadius:{topLeft:0,topRight:0,bottomLeft:0,bottomRight:0},yAxisID:'yMql',order:10,stack:'mql',pointStyle:'rectRounded'});
  if(activeMqlTypes.has('outros')) ds.push({type:'bar',label:'Outros MQL',data:outrosData,backgroundColor:'#93c5fd',borderWidth:0,borderRadius:{topLeft:3,topRight:3,bottomLeft:0,bottomRight:0},yAxisID:'yMql',order:10,stack:'mql',pointStyle:'rectRounded'});
  // Feed metrics (from instaRaw + spend)
  FEED_METRICS.forEach(m=>{
    if(!activeMetrics.has(m.key)) return;
    if(m.key==='spend'){
      ds.push({type:'line',label:m.label,data:dates.map(d=>sp[d]?Math.round(sp[d]):null),borderColor:m.color,backgroundColor:m.color,borderWidth:2,pointRadius:0,pointHoverRadius:6,tension:.3,fill:false,yAxisID:'yInsta',order:1,spanGaps:true,pointStyle:'circle'});
    } else {
      ds.push({type:'line',label:m.label+' (Feed)',data:dates.map(d=>{const r=im[d];if(!r)return null;const v=r[m.idx];return v!=null?parseInt(v):null;}),borderColor:m.color,backgroundColor:m.color,borderWidth:1.8,pointRadius:0,pointHoverRadius:6,tension:.3,fill:false,yAxisID:'yInsta',order:1,spanGaps:true,pointStyle:'circle'});
    }
  });
  // Story metrics (from storyMetricsRaw + storiesRaw count)
  STORY_METRICS.forEach(m=>{
    if(!activeMetrics.has(m.key)) return;
    if(m.src==='count'){
      ds.push({type:'line',label:m.label+' (Stories)',data:dates.map(d=>sc[d]??null),borderColor:m.color,backgroundColor:m.color,borderWidth:1.8,pointRadius:0,pointHoverRadius:6,tension:.3,fill:false,yAxisID:'yInsta',order:1,spanGaps:true,pointStyle:'circle'});
    } else {
      ds.push({type:'line',label:m.label+' (Stories)',data:dates.map(d=>{const r=sm[d];if(!r)return null;const v=r[m.idx];return v!=null&&v!==0?parseInt(v):null;}),borderColor:m.color,backgroundColor:m.color,borderWidth:1.8,pointRadius:0,pointHoverRadius:6,tension:.3,fill:false,yAxisID:'yInsta',order:1,spanGaps:true,pointStyle:'circle'});
    }
  });
  return ds;
}

function buildKPIs(){
  const dates=filterDates(getAllDates());
  const qm=getMqlMap();
  const totalMql=dates.reduce((s,d)=>s+(qm[d]||0),0);
  const mm2=getMetaMap();
  const totalMeta=dates.reduce((s,d)=>s+(mm2[d]||0),0);
  const atingPct=totalMeta>0?Math.round(totalMql/totalMeta*100):null;
  const atingColor=atingPct==null?'#94a3b8':atingPct>=100?'#16a34a':atingPct>=80?'#E8A838':'#ef4444';
  const fmt=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':String(n);
  const ct=document.getElementById('chartTotals');
  if(ct){
    const spM=getSpendMap();
    const totalSpend=dates.reduce((s,d)=>s+(spM[d]||0),0);
    const fmtR=n=>n>=1e6?'R$ '+(n/1e6).toFixed(1)+'M':n>=1e3?'R$ '+(n/1e3).toFixed(1)+'k':'R$ '+Math.round(n);
    ct.innerHTML=`<div class="ct-item"><span class="ct-label">Meta MQL</span><span class="ct-value" style="color:#000">${fmt(totalMeta)}</span></div><div class="ct-divider"></div><div class="ct-item"><span class="ct-label">Total MQL</span><span class="ct-value" style="color:#1d4ed8">${fmt(totalMql)}</span></div>${atingPct!=null?`<div class="ct-divider"></div><div class="ct-item"><span class="ct-label">Atingimento</span><span class="ct-value" style="color:${atingColor}">${atingPct}%</span></div>`:''}<div class="ct-divider"></div><div class="ct-item"><span class="ct-label">Spend Impuls.</span><span class="ct-value" style="color:#059669">${fmtR(totalSpend)}</span></div>`;
  }
}

let chart=null;
function buildChart(){
  const dates=filterDates(getAllDates());
  const ds=buildDatasets(dates);
  if(chart){
    chart.data.labels=dates;
    chart.data.datasets=ds;
    chart.update('none');
    return;
  }
  const gridLinesPlugin={
    id:'customGridLines',
    afterDraw(ch){
      const xScale=ch.scales.x;
      if(!xScale) return;
      const ctx2=ch.ctx;
      const labels=ch.data.labels;
      const {top,bottom}=ch.chartArea;
      labels.forEach((lbl,i)=>{
        const d=new Date(lbl+'T00:00:00');
        const isWeek=d.getDay()===1;
        if(!isWeek) return;
        const x=xScale.getPixelForValue(i);
        ctx2.save();
        ctx2.beginPath();
        ctx2.moveTo(x,top);
        ctx2.lineTo(x,bottom);
        ctx2.strokeStyle='rgba(0,0,0,0.08)';
        ctx2.lineWidth=1;
        ctx2.setLineDash([]);
        ctx2.stroke();
        ctx2.restore();
      });
    }
  };
  chart=new Chart(document.getElementById('chart').getContext('2d'),{
    plugins:[gridLinesPlugin],
    data:{labels:dates,datasets:ds},
    options:{responsive:true,onClick:handleChartClick,interaction:{mode:'index',intersect:false},
      layout:{padding:{top:8}},
      plugins:{
        legend:{display:true,position:'bottom',labels:{usePointStyle:true,pointStyleWidth:18,padding:16,font:{family:'Manrope',size:11,weight:'600'},color:'rgba(26,26,26,.55)',generateLabels:function(chart){return Chart.defaults.plugins.legend.labels.generateLabels(chart).map(item=>{const ds=chart.data.datasets[item.datasetIndex];if(ds&&ds.type==='line'){item.pointStyle='line';}if(item.text==='Meta MQL'){item.lineDash=[6,4];}return item;});}}},
        tooltip:{enabled:false,external:function(context){
          const {chart,tooltip}=context;
          let el=document.getElementById('customTooltip');
          if(!el){el=document.createElement('div');el.id='customTooltip';el.style.cssText='position:absolute;pointer-events:none;background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:10px;padding:10px 14px;font-family:Manrope,sans-serif;font-size:12px;color:#1a1a1a;box-shadow:0 4px 16px rgba(0,0,0,.1);z-index:999;transition:opacity .1s;max-width:280px';document.body.appendChild(el);}
          if(tooltip.opacity===0){el.style.opacity='0';return;}
          const idx=tooltip.dataPoints?.[0]?.dataIndex;
          if(idx==null){el.style.opacity='0';return;}
          const d=chart.data.labels[idx];
          if(!d){el.style.opacity='0';return;}
          const dt=new Date(d+'T12:00:00');
          const dias=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
          const[y,mo,day]=d.split('-');
          const fmt=n=>n==null?'—':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':n.toLocaleString('pt-BR');
          const dot=(c,dash)=>`<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${dash?'transparent':c};border:${dash?'2px dashed '+c:'none'};margin-right:6px;vertical-align:middle;flex-shrink:0"></span>`;
          const row=(color,label,value,dash)=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 0">${dot(color,dash)}<span style="flex:1;color:#6b7280">${label}</span><span style="font-weight:700">${value}</span></div>`;
          let html=`<div style="font-weight:700;font-size:13px;margin-bottom:6px;color:#374151">${dias[dt.getDay()]}, ${day}/${mo}/${y}</div>`;
          // MQL section
          const metaDs=chart.data.datasets.find(ds=>ds.label==='Meta MQL');
          const bioDs=chart.data.datasets.find(ds=>ds.label==='Bio');
          const stDs=chart.data.datasets.find(ds=>ds.label==='Stories');
          const otDs=chart.data.datasets.find(ds=>ds.label==='Outros MQL');
          const metaV=metaDs?.data[idx]; const bioV=bioDs?.data[idx]??0; const stV=stDs?.data[idx]??0; const otV=otDs?.data[idx]??0;
          const totMql=bioV+stV+otV;
          if(metaV!=null) html+=row('#000','Meta MQL',fmt(metaV),true);
          if(totMql>0){
            const splitDot=`<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:linear-gradient(90deg,#1d4ed8 50%,#93c5fd 50%);margin-right:6px;vertical-align:middle;flex-shrink:0"></span>`;
            html+=`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 0">${splitDot}<span style="flex:1;color:#6b7280">Total MQL</span><span style="font-weight:700">${fmt(totMql)}</span></div>`;
            if(bioDs&&bioV>0) html+=`<div style="padding-left:16px">${row('#1d4ed8','Bio',fmt(bioV))}</div>`;
            if(stDs&&stV>0) html+=`<div style="padding-left:16px">${row('#22d3ee','Stories',fmt(stV))}</div>`;
            if(otDs&&otV>0) html+=`<div style="padding-left:16px">${row('#93c5fd','Outros',fmt(otV))}</div>`;
          }
          // Metric lines
          const metricDs=chart.data.datasets.filter(ds=>!['Meta MQL','Bio','Stories','Outros MQL'].includes(ds.label));
          if(metricDs.length>0){
            html+='<div style="border-top:1px solid rgba(0,0,0,.08);margin:5px 0"></div>';
            metricDs.forEach(ds=>{const v=ds.data[idx];if(v==null||v===0)return;const isSpend=ds.label.includes('Impulsionado');const fv=isSpend?(v>=1e3?'R$ '+(v/1e3).toFixed(1)+'k':'R$ '+v):fmt(v);html+=row(ds.borderColor||ds.backgroundColor,ds.label,fv);});
          }
          el.innerHTML=html;
          el.style.opacity='1';
          const pos=chart.canvas.getBoundingClientRect();
          const left=pos.left+window.scrollX+tooltip.caretX;
          const top=pos.top+window.scrollY+tooltip.caretY;
          el.style.left=(left+15)+'px';
          el.style.top=(top-el.offsetHeight/2)+'px';
          if(left+15+el.offsetWidth>window.innerWidth) el.style.left=(left-el.offsetWidth-15)+'px';
        }},
        zoom:{zoom:{wheel:{enabled:true},pinch:{enabled:true},mode:'x'},pan:{enabled:true,mode:'x'},limits:{x:{minRange:3}}}
      },
      scales:{
        x:{ticks:{color:'#6b7280',maxTicksLimit:12,maxRotation:0,font:{size:11,family:'Manrope'}},grid:{display:false},border:{color:'#d1d5db'}},
        yMql:{type:'linear',position:'left',title:{display:true,text:'MQL / dia',color:'#374151',font:{size:11,family:'Manrope',weight:'600'}},ticks:{color:'#6b7280',font:{size:11}},grid:{color:'rgba(0,0,0,.04)'},border:{color:'#d1d5db'}},
        yInsta:{type:'linear',position:'right',title:{display:true,text:'Engajamento',color:'#374151',font:{size:11,family:'Manrope',weight:'600'}},ticks:{color:'#6b7280',font:{size:11},callback:v=>v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'k':v},grid:{drawOnChartArea:false},border:{color:'#d1d5db'}}
      }
    }
  });
}

// ── Drilldown ──
const PROFILE_LABELS={tallisgomes:'Tallis Gomes',g4educacao:'G4',alfredosoares:'Alfredo Soares','bruno.nardon':'Bruno Nardon',g4club_:'G4 Club',g4podcasts:'G4 Podcasts',g4skills:'G4 Skills',g4sprints:'G4 Sprints',g4scale:'G4 Scale',g4scale2:'G4 Scale',outros:'Outros'};
let drilldownDate=null, drilldownTab='posts';

function getAllowedUsernames(){
  if(selectedPerfis.has('todos')) return null; // null = all
  const mainUsers=Object.values(PERFIL_INSTA);
  const allowed=new Set();
  for(const p of selectedPerfis){
    if(p==='outros'){
      // add all non-main usernames from postsRaw + storiesRaw
      if(typeof postsRaw!=='undefined') postsRaw.forEach(r=>{if(!mainUsers.includes(r[1]))allowed.add(r[1]);});
      if(typeof storiesRaw!=='undefined') storiesRaw.forEach(r=>{if(!mainUsers.includes(r[1]))allowed.add(r[1]);});
    } else {
      const u=PERFIL_INSTA[p]; if(u) allowed.add(u);
    }
  }
  return allowed;
}
function openDrilldown(dateStr){
  drilldownDate=dateStr;
  const hasBio=activeMqlTypes.has('bio'), hasSt=activeMqlTypes.has('stories'), hasOut=activeMqlTypes.has('outros');
  const hasFeedType=hasBio||hasOut;
  if(hasFeedType) drilldownTab='posts';
  else drilldownTab='stories';
  const panel=document.getElementById('drilldownPanel');
  panel.style.display='block';
  const dt=new Date(dateStr+'T12:00:00');
  const dias=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const [y,m,d]=dateStr.split('-');
  document.getElementById('drilldownDate').textContent=`${dias[dt.getDay()]}, ${d}/${m}/${y}`;
  document.querySelectorAll('.dtab').forEach(t=>{
    const tab=t.dataset.tab;
    if(tab==='stories') t.style.display='';
    else if(tab==='posts') t.style.display=hasFeedType?'':'none';
    else t.style.display='none';
    t.classList.toggle('active',tab===drilldownTab);
  });
  renderDrilldown();
  panel.scrollIntoView({behavior:'smooth',block:'start'});
}
function closeDrilldown(){
  document.getElementById('drilldownPanel').style.display='none';
  drilldownDate=null;
}
function switchDrillTab(el){
  drilldownTab=el.dataset.tab;
  document.querySelectorAll('.dtab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  renderDrilldown();
}
function renderDrilldown(){
  const body=document.getElementById('drilldownBody');
  if(!drilldownDate){body.innerHTML='';return;}
  const allowed=getAllowedUsernames();
  const matchUser=u=>allowed===null||allowed.has(u);
  // Update tab counts
  const postsCount=typeof postsRaw!=='undefined'?postsRaw.filter(r=>r[0]===drilldownDate&&matchUser(r[1])).length:0;
  const storyCount=typeof storiesDetailRaw!=='undefined'?storiesDetailRaw.filter(r=>r[0]===drilldownDate&&matchUser(r[1])).length:0;
  document.querySelectorAll('.dtab').forEach(t=>{
    const tab=t.dataset.tab;
    const cnt=tab==='posts'?postsCount:storyCount;
    t.textContent=`${tab==='posts'?'Posts':'Stories'} (${cnt})`;
  });
  if(drilldownTab==='stories'){
    // storiesDetailRaw format: [date, username, caption, permalink, reach, replies, shares, views, total_interactions]
    const rows=typeof storiesDetailRaw!=='undefined'?storiesDetailRaw.filter(r=>r[0]===drilldownDate&&matchUser(r[1])):[];
    if(!rows.length){body.innerHTML='<div class="drilldown-empty">Nenhum story registrado neste dia</div>';return;}
    const fmtN=n=>n==null?'—':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':String(n);
    body.innerHTML=rows.map(r=>`<div class="post-card">
      <div class="post-card-header"><span class="post-card-profile">${PROFILE_LABELS[r[1]]||r[1]}</span><span class="post-card-type">STORY</span></div>
      ${r[2]?`<div class="post-card-caption">${r[2].replace(/</g,'&lt;')}</div>`:''}
      <div class="post-card-stats">
        <span title="Alcance">👁 ${fmtN(r[4])}</span>
        <span title="Visualizações">▶ ${fmtN(r[7])}</span>
        <span title="Respostas">💬 ${fmtN(r[5])}</span>
        <span title="Compartilhamentos">🔁 ${fmtN(r[6])}</span>
        <span title="Total Interações">⚡ ${fmtN(r[8])}</span>
      </div>
      <a class="post-card-link" href="${r[3]}" target="_blank" rel="noopener">Ver no Instagram →</a>
    </div>`).join('');
    return;
  }
  // Posts tab: Feed + Reels merged
  const rows=typeof postsRaw!=='undefined'?postsRaw.filter(r=>r[0]===drilldownDate&&matchUser(r[1])):[];
  if(!rows.length){body.innerHTML='<div class="drilldown-empty">Nenhum post neste dia</div>';return;}
  const fmtN=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'k':String(n);
  const spLookup=typeof spendPerPost!=='undefined'?spendPerPost:{};
  body.innerHTML=rows.map(r=>{
    const sp=spLookup[r[4]];
    const spBadge=sp?`<span class="spend-badge" title="Impulsionado">💰 R$ ${sp>=1e3?(sp/1e3).toFixed(1)+'k':sp.toFixed(0)}</span>`:'';
    return `<div class="post-card">
    <div class="post-card-header"><span class="post-card-profile">${PROFILE_LABELS[r[1]]||r[1]}</span>${spBadge}<span class="post-card-type">${r[2]}</span></div>
    ${r[3]?`<div class="post-card-caption">${r[3].replace(/</g,'&lt;')}</div>`:''}
    <div class="post-card-stats">
      <span title="Alcance">👁 ${fmtN(r[5])}</span>
      <span title="Curtidas">❤ ${fmtN(r[6])}</span>
      <span title="Comentários">💬 ${fmtN(r[7])}</span>
      <span title="Compartilhamentos">🔁 ${fmtN(r[8])}</span>
      <span title="Salvamentos">🔖 ${fmtN(r[9])}</span>
      <span title="Total Interações">⚡ ${fmtN(r[10])}</span>
    </div>
    <a class="post-card-link" href="${r[4]}" target="_blank" rel="noopener">Ver no Instagram →</a>
  </div>`;}).join('');
}

// Chart click handler
function handleChartClick(evt){
  if(!chart) return;
  const points=chart.getElementsAtEventForMode(evt,'nearest',{intersect:false},true);
  if(!points.length) return;
  const idx=points[0].index;
  const dateStr=chart.data.labels[idx];
  if(dateStr) openDrilldown(dateStr);
}

buildMetricPills(); buildKPIs(); buildChart();
