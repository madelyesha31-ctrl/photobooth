(function(){
  const $ = id => document.getElementById(id);
  const screens = {
    ...['modes','settings','filter','strip','capture','result'].reduce((o,k)=>(o[k]=$('screen-'+k),o),{}),
    ...['pm-settings','pm-filter','pm-strip','pm-capture','pm-result'].reduce((o,k)=>(o[k]=$('screen-'+k),o),{}),
    'server-settings': $('screen-server-settings')
  };
  const errEl=$('err'), settingsLive=$('settingsLive'), filterLive=$('filterLive'), live2=$('live2');
  const videos=[settingsLive,filterLive,live2];
  const cameraSelect=$('cameraSelect'), mirrorToggle=$('mirrorToggle');
  const startBtn=$('startBtn'), countEl=$('countEl'), frameNoEl=$('frameNo'), shotCounter=$('shotCounter');
  const qrOverlay=$('qr-overlay'), qrCanvas=$('qrCanvas'), qrCloseBtn=$('qrCloseBtn');
  const qrBtn=$('qrBtn'), pmQrBtn=$('pmQrBtn');
  const openServerSettingsBtn=$('openServerSettingsBtn');
  const serverBaseUrlInput=$('serverBaseUrlInput'), saveServerSettingsBtn=$('saveServerSettingsBtn'), serverSettingsStatus=$('serverSettingsStatus');
  const W=640, H=1400;
  const SERVER_BASE_URL_KEY='seed_server_base_url';
  let serverBaseUrl='';
  let lastStripUrl=null;

  let currentMode='solo';
  const pmVideos=[$('pmSettingsLive'),$('pmFilterLive'),$('pmLive2')].filter(Boolean);
  const pmCameraSelect=$('pmCameraSelect'), pmMirrorToggle=$('pmMirrorToggle');
  const pmStartBtn=$('pmStartBtn'), pmCountEl=$('pmCountEl'), pmFrameNo=$('pmFrameNo'), pmShotCounter=$('pmShotCounter');
  const pmW=1200, pmH=1200;

  function isPM(){ return currentMode==='posematch'; }
  function dims(layout){ const L=LAYOUTS[layout], S=300, pad=24, gap=12, footerH=90; return {S,pad,gap,footerH,w:pad*2+L.cols*S+gap*(L.cols-1), h:pad*2+L.rows*S+gap*(L.rows-1)+gap+footerH}; }
  function curW(){ return dims(curSelectedLayout()).w; }
  function curH(){ return dims(curSelectedLayout()).h; }
  function curVideos(){ return isPM()?pmVideos:videos; }
  function curMirror(){ return isPM()?pmMirrorToggle:mirrorToggle; }
  function curCameraSelect(){ return isPM()?pmCameraSelect:cameraSelect; }
  function curShotCounter(){ return isPM()?pmShotCounter:shotCounter; }
  function curFrameNo(){ return isPM()?pmFrameNo:frameNoEl; }
  function curCountEl(){ return isPM()?pmCountEl:countEl; }
  function curStartBtn(){ return isPM()?pmStartBtn:startBtn; }
  function curLayoutLabel(){ return isPM()?$('pmLayoutLabel'):$('layoutLabel'); }
  function curStripPreviewCanvas(){ return isPM()?$('pmStripPreviewCanvas'):$('stripPreviewCanvas'); }
  function curCaptureStripPreview(){ return isPM()?$('pmCaptureStripPreview'):$('captureStripPreview'); }
  function curStripCanvas(){ return isPM()?$('pmStripCanvas'):$('stripCanvas'); }
  function curResultDate(){ return isPM()?$('pmResultDate'):$('resultDate'); }
  function curFilterLabel(){ return isPM()?$('pmFilterLabel'):$('filterLabel'); }
  function curFilterGrid(){ return isPM()?$('pmFilterGrid'):$('filterGrid'); }
  function curDesignGrid(){ return isPM()?$('pmDesignGrid'):$('designGrid'); }
  function curLayouts(){ return isPM()?document.querySelectorAll('[data-mode="posematch"]'):document.querySelectorAll('.lay:not([data-mode="posematch"])'); }

  /* ---------- verification ---------- */
  const verifyOverlay=$('verification-overlay'), verifyInput=$('verifyInput'), verifyBtn=$('verifyBtn'), verifyErr=$('verifyErr');
  const CORRECT_ANSWER='STUDENT OF EXCELLENCE, EMPOWERED TO DISCIPLE';
  function checkVerify(){
    const val=verifyInput.value.trim().toUpperCase();
    if(val===CORRECT_ANSWER){
      verifyOverlay.style.display='none';
      try{ sessionStorage.setItem('seed_verified','1'); }catch(e){}
    } else {
      verifyErr.style.display='block';
      verifyInput.value='';
      verifyInput.focus();
    }
  }
  let alreadyVerified=false;
  try{ alreadyVerified=!!sessionStorage.getItem('seed_verified'); }catch(e){}
  if(!alreadyVerified){
    verifyOverlay.style.display='flex';
    setTimeout(()=>verifyInput.focus(),100);
  } else {
    verifyOverlay.style.display='none';
  }
  verifyBtn.addEventListener('click',checkVerify);
  verifyInput.addEventListener('keydown',e=>{ if(e.key==='Enter') checkVerify(); });
  verifyInput.addEventListener('input',()=>{ verifyErr.style.display='none'; });

  /* ---------- LOGO ---------- */
  const LOGO_DATA = 'data:image/png;base64,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';
  const LOGO_FILES = LOGO_DATA ? [LOGO_DATA] : ['LOGO2.0.png','SEED_LOGO.png'];
  const logoImg = new Image();
  let logoLoaded = false, logoIdx = 0, skipLogo = false;
  logoImg.onload = () => {
    logoLoaded = true;
    ['headerLogo','verifyLogo'].forEach(id => { const el = $(id); if(el){ el.src = logoImg.src; el.style.display = ''; } });
    if(shots.length && screens[isPM()?'pm-result':'result'].classList.contains('active')) drawStrip(curStripCanvas(), shots);
  };
  logoImg.onerror = () => { if(++logoIdx < LOGO_FILES.length) logoImg.src = LOGO_FILES[logoIdx]; else skipLogo = true; };
  logoImg.src = LOGO_FILES[0];
  if(LOGO_DATA) $('headerLogo').src = LOGO_DATA;

  let stream=null, selectedFilter='none', selectedDesign='classic', selectedLayout='2x3', shots=[], running=false;
  let pmSelectedFilter='none', pmSelectedDesign='classic', pmSelectedLayout='2x3';
  function curSelectedFilter(){ return isPM()?pmSelectedFilter:selectedFilter; }
  function curSelectedDesign(){ return isPM()?pmSelectedDesign:selectedDesign; }
  function curSelectedLayout(){ return isPM()?pmSelectedLayout:selectedLayout; }

  const FILTERS=[
    ['none','Original','linear-gradient(135deg,#fbbf24,#f87171)'],
    ['brightness(1.05) contrast(1.05) saturate(1.1)','Soft','linear-gradient(135deg,#fef3c7,#fde68a)'],
    ['grayscale(1) contrast(1.1)','Silvertone','linear-gradient(135deg,#d1d5db,#9ca3af)'],
    ['brightness(1.05) contrast(0.9) saturate(0.85)','Film Matte','linear-gradient(135deg,#374151,#1f2937)'],
    ['sepia(0.15) saturate(1.2) brightness(1.05)','Blush','linear-gradient(135deg,#fce7f3,#fbcfe8)'],
    ['saturate(0.85) brightness(1.05) contrast(1.1)','Cool','linear-gradient(135deg,#94a3b8,#64748b)'],
    ['sepia(0.25) saturate(1.15) brightness(1.05)','Golden Hour','linear-gradient(135deg,#fcd34d,#f59e0b)'],
    ['sepia(0.4) contrast(1.1) brightness(0.95)','Vintage','linear-gradient(135deg,#d6d3d1,#a8a29e)'],
    ['grayscale(1) contrast(1.4) brightness(0.95)','Noir','linear-gradient(135deg,#374151,#000000)']
  ];
  const THEMES={
    classic:{n:'Classic',bg:'#ffffff',border:'#0a0a0a',text:'#0a0a0a'},
    noir:{n:'Noir',bg:'#0a0a0a',border:'#ffffff',text:'#ffffff'},
    cream:{n:'Cream',bg:'#f5f0e6',border:'#0a0a0a',text:'#0a0a0a'},
    nature:{n:'Nature',bg:'#f5f3e7',border:'#3a4a1e',text:'#3a4a1e'},
    gold:{n:'Gold',bg:'#0a0a0a',border:'#d4a843',text:'#d4a843'},
    green:{n:'Green',bg:'#143826',border:'#6b7c3a',text:'#e8f0e0'},
    blue:{n:'Blue',bg:'#e8f4f8',border:'#3a6b8c',text:'#3a6b8c'},
    navy:{n:'Navy',bg:'#0f1c2e',border:'#3a6b8c',text:'#e8f4f8'},
    red:{n:'Red',bg:'#a8322b',border:'#e07a3a',text:'#fff5e8'},
    film:{n:'Film',bg:'#f7f6f3',border:'#0a0a0a',text:'#0a0a0a'},
    checker:{n:'Checker',bg:'#ffffff',border:'#0a0a0a',text:'#0a0a0a'},
    dot:{n:'Dot',bg:'#ffffff',border:'#0a0a0a',text:'#0a0a0a'}
  };
  const LAYOUTS={'2x3':{cols:2,rows:3,n:6,label:'2 × 3'},'2x2':{cols:2,rows:2,n:4,label:'2 × 2'},'straight':{cols:1,rows:3,n:3,label:'1 × 3'}};
  const total=()=>LAYOUTS[curSelectedLayout()].n;
  const pad2=n=>String(n).padStart(2,'0');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  function showErr(msg){ errEl.textContent=msg; errEl.style.display=msg?'block':'none'; }
  function show(name){ Object.values(screens).forEach(s=>s.classList.remove('active')); screens[name].classList.add('active'); window.scrollTo(0,0); }

  /* ---------- camera ---------- */
  function stopStream(){ if(stream){ stream.getTracks().forEach(t=>t.stop()); stream=null; } curVideos().forEach(v=>v.srcObject=null); }
  function attach(){ curVideos().forEach(v=>{ v.srcObject=stream; const p=v.play(); if(p&&p.catch) p.catch(()=>{}); }); applyMirror(); }
  async function openCamera(deviceId){
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
      showErr('Camera is not available. Open this page over HTTPS (or localhost), not as a local file.'); return false;
    }
    stopStream();
    try{
      const video = deviceId ? {deviceId:{exact:deviceId}} : {facingMode:'user'};
      stream = await navigator.mediaDevices.getUserMedia({video:Object.assign({width:{ideal:1280},height:{ideal:960}},video),audio:false});
      attach(); showErr(''); return true;
    }catch(e){
      showErr('Could not access the camera ('+(e.message||e.name)+'). Allow camera permission in your browser and try again.'); return false;
    }
  }
  async function listCameras(){
    try{
      const devs=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');
      const cur=stream&&stream.getVideoTracks()[0]?stream.getVideoTracks()[0].getSettings().deviceId:null;
      const sel=curCameraSelect();
      sel.innerHTML='';
      devs.forEach((d,i)=>{ const o=document.createElement('option'); o.value=d.deviceId; o.textContent=d.label||('Camera '+(i+1)); if(d.deviceId===cur) o.selected=true; sel.appendChild(o); });
      if(!devs.length){ sel.innerHTML='<option>No cameras found</option>'; }
    }catch(e){}
  }
  function applyMirror(){ const t=curMirror().checked?'scaleX(-1)':''; curVideos().forEach(v=>v.style.transform=t); }
  function applyFilter(){ curVideos().forEach(v=>v.style.filter=curSelectedFilter()==='none'?'':curSelectedFilter()); }

  /* ---------- UI build ---------- */
  function buildFilterGrid(grid, labelEl){
    grid.innerHTML='';
    FILTERS.forEach((f,i)=>{
      const b=document.createElement('button'); b.type='button'; b.className='opt'+(i===0?' active':'');
      b.innerHTML='<i style="background:'+f[2]+'"></i>'+f[1];
      b.addEventListener('click',()=>{
        grid.querySelectorAll('.opt').forEach(x=>x.classList.remove('active')); b.classList.add('active');
        if(isPM()){ pmSelectedFilter=f[0]; } else { selectedFilter=f[0]; }
        labelEl.textContent=f[1]; applyFilter();
      });
      grid.appendChild(b);
    });
  }
  buildFilterGrid($('filterGrid'), $('filterLabel'));
  buildFilterGrid($('pmFilterGrid'), $('pmFilterLabel'));

  function buildDesignGrid(grid, previewCanvas){
    grid.innerHTML='';
    Object.keys(THEMES).forEach(k=>{
      const t=THEMES[k]; const b=document.createElement('button'); b.type='button'; b.className='opt'+(k==='classic'?' active':'');
      b.innerHTML='<i style="background:'+t.bg+';border:2px solid '+t.border+'"></i>'+t.n;
      b.addEventListener('click',()=>{
        grid.querySelectorAll('.opt').forEach(x=>x.classList.remove('active')); b.classList.add('active');
        if(isPM()){ pmSelectedDesign=k; } else { selectedDesign=k; }
        drawPreview(previewCanvas,[]);
      });
      grid.appendChild(b);
    });
  }
  buildDesignGrid($('designGrid'), $('stripPreviewCanvas'));
  buildDesignGrid($('pmDesignGrid'), $('pmStripPreviewCanvas'));

  function updateLayout(btn){
    curLayouts().forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    if(isPM()){ pmSelectedLayout=btn.dataset.layout; } else { selectedLayout=btn.dataset.layout; }
    curLayoutLabel().textContent=LAYOUTS[curSelectedLayout()].label;
    drawPreview(curStripPreviewCanvas(),[]);
  }
  document.querySelectorAll('.lay').forEach(btn=>btn.addEventListener('click',()=>updateLayout(btn)));

  /* ---------- strip drawing ---------- */
  function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

  function metrics(layout){
    const L=LAYOUTS[layout], D=dims(layout);
    return {L,pad:D.pad,gap:D.gap,footerH:D.footerH,fw:D.S,fh:D.S};
  }

  function drawBackground(ctx,design){
    const d=THEMES[design]||THEMES.classic, r=rng(7);
    const w=curW(), h=curH();
    ctx.fillStyle=d.bg; ctx.fillRect(0,0,w,h);
    const grad=stops=>{ const g=ctx.createLinearGradient(0,0,0,h); stops.forEach(s=>g.addColorStop(s[0],s[1])); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); };
    if(design==='checker'){ ctx.fillStyle='#0a0a0a'; const s=16; for(let y=0;y<h;y+=s)for(let x=0;x<w;x+=s) if(((x/s)+(y/s))%2===0) ctx.fillRect(x,y,s,s); }
    else if(design==='dot'){ ctx.fillStyle='rgba(10,10,10,.35)'; for(let y=0;y<h;y+=14)for(let x=0;x<w;x+=14){ ctx.beginPath(); ctx.arc(x+7,y+7,1.6,0,7); ctx.fill(); } }
    else if(design==='nature'){ grad([[0,'#f5f3e7'],[.7,'#e8e4d4'],[1,'#a3b060']]); ctx.fillStyle='rgba(107,124,58,.12)'; for(let i=0;i<14;i++){ ctx.beginPath(); ctx.ellipse(r()*w,r()*h,12+r()*18,6+r()*9,r()*3,0,7); ctx.fill(); } }
    else if(design==='gold'){ grad([[0,'#1a1a1a'],[.5,'#0a0a0a'],[1,'#1a1a1a']]); ctx.strokeStyle='rgba(212,168,67,.2)'; for(let i=0;i<10;i++){ const y=20+i*(h/10); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); } }
    else if(design==='green'){ grad([[0,'#143826'],[.6,'#3a5a26'],[1,'#6b7c3a']]); ctx.fillStyle='rgba(168,200,120,.14)'; for(let i=0;i<10;i++){ const x=r()*w,y=h-r()*60; ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x-14,y-28,x,y-50); ctx.quadraticCurveTo(x+14,y-28,x,y); ctx.fill(); } }
    else if(design==='blue'){ ctx.fillStyle='rgba(91,157,189,.18)'; ctx.beginPath(); ctx.moveTo(w*.2,0); ctx.lineTo(w*.5,h*.15); ctx.lineTo(w*.3,h*.25); ctx.lineTo(w*.6,h*.2); ctx.lineTo(w*.4,0); ctx.fill(); ctx.beginPath(); ctx.moveTo(w*.6,0); ctx.lineTo(w*.8,h*.1); ctx.lineTo(w*.9,h*.22); ctx.lineTo(w*.7,h*.18); ctx.lineTo(w*.75,0); ctx.fill(); }
    else if(design==='navy'){ grad([[0,'#0f1c2e'],[1,'#1a2f48']]); ctx.fillStyle='rgba(91,157,189,.18)'; for(let i=0;i<40;i++){ const s=2+r()*3; ctx.fillRect(r()*w,r()*h,s,s); } }
    else if(design==='red'){ grad([[0,'#a8322b'],[1,'#c04038']]); ctx.fillStyle='rgba(224,122,58,.15)'; const ps=28; for(let y=0;y<h;y+=ps)for(let x=0;x<w;x+=ps) if(((x/ps)+(y/ps))%2===0) ctx.fillRect(x,y,ps,ps); }
  }

  function drawFrames(ctx,design,layout,photos){
    const d=THEMES[design]||THEMES.classic, m=metrics(layout);
    const w=curW(), h=curH();
    ctx.strokeStyle=d.border; ctx.lineWidth=4; ctx.strokeRect(2,2,w-4,h-4);
    if(design==='film'){
      ctx.fillStyle=d.border;
      for(let y=18;y<h-10;y+=34){ ctx.fillRect(8,y,10,16); ctx.fillRect(w-18,y,10,16); }
    }
    for(let row=0;row<m.L.rows;row++)for(let col=0;col<m.L.cols;col++){
      const idx=row*m.L.cols+col, x=m.pad+col*(m.fw+m.gap), y=m.pad+row*(m.fh+m.gap);
      ctx.fillStyle='#e9e9e9'; ctx.fillRect(x,y,m.fw,m.fh);
      const p=photos[idx];
      if(p){
        const pw=p.width, ph=p.height, s=Math.max(m.fw/pw,m.fh/ph), sw=m.fw/s, sh=m.fh/s;
        ctx.save(); ctx.beginPath(); ctx.rect(x,y,m.fw,m.fh); ctx.clip();
        ctx.drawImage(p,(pw-sw)/2,(ph-sh)/2,sw,sh,x,y,m.fw,m.fh); ctx.restore();
      }
      ctx.strokeStyle=d.border; ctx.lineWidth=2; ctx.strokeRect(x,y,m.fw,m.fh);
    }
  }

  function drawFooter(ctx,design,layout){
    const d=THEMES[design]||THEMES.classic, m=metrics(layout);
    const w=curW(), h=curH();
    const fy=h-m.pad-m.footerH, fx=m.pad, fw=w-m.pad*2;
    ctx.fillStyle=d.bg; ctx.globalAlpha=.9; ctx.fillRect(fx,fy,fw,m.footerH); ctx.globalAlpha=1;
    ctx.strokeStyle=d.border; ctx.lineWidth=2; ctx.strokeRect(fx,fy,fw,m.footerH);
    const logoSize=66, logoX=fx+14, logoY=fy+(m.footerH-logoSize)/2;
    if(logoLoaded && !skipLogo){
      const lw=logoImg.naturalWidth||logoSize, lh=logoImg.naturalHeight||logoSize;
      const s=Math.min(logoSize/lw, logoSize/lh)*1.5, dw=lw*s, dh=lh*s;
      const cropSize=Math.max(dw,dh), cx=logoX+(logoSize-cropSize)/2, cy=logoY+(logoSize-cropSize)/2;
      ctx.fillStyle='rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(logoX+logoSize/2, logoY+logoSize/2, logoSize/2-2, 0, 7);
      ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(logoX+logoSize/2, logoY+logoSize/2, logoSize/2-3, 0, 7); ctx.clip();
      ctx.drawImage(logoImg, cx, cy, cropSize, cropSize);
      ctx.restore();
    } else {
      ctx.strokeStyle=d.text; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(logoX+logoSize/2,logoY+logoSize/2,logoSize/2-4,0,7); ctx.stroke();
    }
    const tx=logoX+logoSize+12, cy=fy+m.footerH/2; ctx.fillStyle=d.text; ctx.textBaseline='alphabetic'; ctx.textAlign='left';
    ctx.font='700 19px "Space Grotesk",sans-serif'; ctx.fillText('REGENERATION',tx,cy-2);
    ctx.font='500 13px "Space Grotesk",sans-serif'; ctx.fillText('S.E.E.D ISULAN',tx,cy+16);
    if(fw>=500){
      ctx.font='400 11px "IBM Plex Mono",monospace'; ctx.textAlign='right';
      ctx.fillText(new Date().toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}),fx+fw-12,cy+4);
      ctx.textAlign='left';
    }
  }

  function drawStrip(canvas,photos){
    const w=curW(), h=curH();
    canvas.width=w; canvas.height=h;
    canvas.style.width=Math.round(w*340/660)+'px';
    const ctx=canvas.getContext('2d');
    drawBackground(ctx,curSelectedDesign()); drawFrames(ctx,curSelectedDesign(),curSelectedLayout(),photos); drawFooter(ctx,curSelectedDesign(),curSelectedLayout());
  }
  function drawPreview(canvas,photos){ if(canvas) drawStrip(canvas,photos); }

  /* ---------- capture ---------- */
  function grabFrame(){
    const liveVideo = isPM() ? $('pmLive2') : live2;
    const w=liveVideo.videoWidth||640, h=liveVideo.videoHeight||480;
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    const ctx=c.getContext('2d');
    if(curMirror().checked){ ctx.translate(w,0); ctx.scale(-1,1); }
    if(curSelectedFilter()!=='none' && 'filter' in ctx) ctx.filter=curSelectedFilter();
    ctx.drawImage(liveVideo,0,0,w,h);
    return c;
  }
  async function countdown(){
    curCountEl().style.display='flex';
    for(let n=3;n>=1;n--){ curCountEl().textContent=n; await sleep(1000); }
    curCountEl().style.display='none';
  }
  function resetCapture(){
    shots=[]; running=false;
    curFrameNo().textContent='01 / '+pad2(total()); curShotCounter().textContent='0/'+total();
    curStartBtn().disabled=false; curStartBtn().style.display=''; curCountEl().style.display='none';
    drawPreview(curCaptureStripPreview(),[]);
  }
  async function runBooth(){
    if(running) return;
    if(!stream){ if(!(await openCamera())) return; }
    running=true; shots=[]; curStartBtn().style.display='none';
    const n=total();
    for(let i=0;i<n;i++){
      curFrameNo().textContent=pad2(i+1)+' / '+pad2(n);
      await countdown();
      shots.push(grabFrame());
      curShotCounter().textContent=shots.length+'/'+n;
      drawPreview(curCaptureStripPreview(),shots);
      await sleep(400);
    }
    running=false;
    drawStrip(curStripCanvas(),shots);
    curResultDate().textContent=new Date().toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'});
    show(isPM()?'pm-result':'result');
  }

  /* ---------- navigation ---------- */
  $('startSoloBtn').addEventListener('click',async()=>{
    currentMode='solo'; selectedFilter='none'; selectedDesign='classic'; selectedLayout='2x3';
    showErr(''); show('settings');
    if(await openCamera()) listCameras();
  });
  $('startPoseMatchBtn').addEventListener('click',async()=>{
    currentMode='posematch'; pmSelectedFilter='none'; pmSelectedDesign='classic'; pmSelectedLayout='2x3';
    showErr(''); show('pm-settings');
    if(await openCamera()) listCameras();
  });
  cameraSelect.addEventListener('change',async()=>{ if(cameraSelect.value && await openCamera(cameraSelect.value)) listCameras(); });
  pmCameraSelect.addEventListener('change',async()=>{ if(pmCameraSelect.value && await openCamera(pmCameraSelect.value)) listCameras(); });
  mirrorToggle.addEventListener('change',applyMirror);
  pmMirrorToggle.addEventListener('change',applyMirror);
  $('settingsBackBtn').addEventListener('click',()=>{ stopStream(); show('modes'); });
  $('pmSettingsBackBtn').addEventListener('click',()=>{ stopStream(); show('modes'); });
  $('continueSettingsBtn').addEventListener('click',()=>{ if(!stream){ showErr('Camera not ready. Allow camera access first.'); return; } applyFilter(); show('filter'); });
  $('continuePmSettingsBtn').addEventListener('click',()=>{ if(!stream){ showErr('Camera not ready. Allow camera access first.'); return; } applyFilter(); show('pm-filter'); });
  $('filterBackBtn').addEventListener('click',()=>show('settings'));
  $('pmFilterBackBtn').addEventListener('click',()=>show('pm-settings'));
  $('continueFilterBtn').addEventListener('click',()=>{ show('strip'); drawPreview(curStripPreviewCanvas(),[]); });
  $('continuePmFilterBtn').addEventListener('click',()=>{ show('pm-strip'); drawPreview(curStripPreviewCanvas(),[]); });
  $('stripBackBtn').addEventListener('click',()=>show('filter'));
  $('pmStripBackBtn').addEventListener('click',()=>show('pm-filter'));
  $('continueStripBtn').addEventListener('click',()=>{ show('capture'); resetCapture(); attach(); applyFilter(); });
  $('continuePmStripBtn').addEventListener('click',()=>{ show('pm-capture'); resetCapture(); attach(); applyFilter(); });
  $('backToModesBtn').addEventListener('click',()=>{ running=false; show('strip'); drawPreview(curStripPreviewCanvas(),[]); });
  $('pmBackToModesBtn').addEventListener('click',()=>{ running=false; show('pm-strip'); drawPreview(curStripPreviewCanvas(),[]); });
  startBtn.addEventListener('click',()=>{ runBooth().catch(e=>{ running=false; startBtn.style.display=''; showErr('Error: '+(e.message||e)); }); });
  pmStartBtn.addEventListener('click',()=>{ runBooth().catch(e=>{ running=false; pmStartBtn.style.display=''; showErr('Error: '+(e.message||e)); }); });
  $('retakeBtn').addEventListener('click',()=>{ show('strip'); drawPreview(curStripPreviewCanvas(),[]); });
  $('pmRetakeBtn').addEventListener('click',()=>{ show('pm-strip'); drawPreview(curStripPreviewCanvas(),[]); });

  function exportData(canvasId){
    const canvas=$(canvasId);
    try{ const d=canvas.toDataURL('image/png'); if(d && d!=='data:,') return d; }catch(e){}
    /* canvas is blocked (logo loaded from a local file): redraw without the logo so export still works */
    skipLogo=true;
    drawStrip(canvas,shots);
    showErr('Logo was skipped because the browser blocks local images. Host the page or paste the logo into LOGO_DATA to include it.');
    try{ const d=canvas.toDataURL('image/png'); if(d && d!=='data:,') return d; }catch(e){}
    return null;
  }

  function downloadStrip(canvasId, filename){
    const data=exportData(canvasId);
    if(!data){ showErr('Could not export the strip. Please try again.'); return; }
    const a=document.createElement('a');
    a.download=filename; a.href=data;
    document.body.appendChild(a); a.click(); a.remove();
  }
  $('downloadBtn').addEventListener('click',()=>downloadStrip('stripCanvas','seed-photo-strip.png'));
  $('pmDownloadBtn').addEventListener('click',()=>downloadStrip('pmStripCanvas','seed-pose-match-strip.png'));

  async function emailStrip(canvasId){
    const data=exportData(canvasId);
    if(!data){ showErr('Could not export the strip for email.'); return; }
    const blob = await (await fetch(data)).blob();
    const file = new File([blob], 'seed-photo-strip.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'S.E.E.D Photo Strip', text: 'Here is my photo strip from Regeneration S.E.E.D Isulan.' }); } catch (e) { if (e.name !== 'AbortError') showErr('Sharing failed.'); }
    } else {
      const subject = encodeURIComponent('My S.E.E.D Photo Strip');
      const body = encodeURIComponent('Here is my photo strip from Regeneration S.E.E.D Isulan. (Download the strip first and attach it.)');
      window.open('mailto:?subject='+subject+'&body='+body);
    }
  }
  $('emailBtn').addEventListener('click',()=>emailStrip('stripCanvas'));
  $('pmEmailBtn').addEventListener('click',()=>emailStrip('pmStripCanvas'));

  function printStrip(canvasId){
    const data=exportData(canvasId);
    if(!data){ showErr('Could not print the strip. Please try again.'); return; }
    const f=document.createElement('iframe');
    f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(f);
    const d=f.contentWindow.document;
    d.open();
    d.write('<!DOCTYPE html><html><head><title>Print Strip</title><style>@page{size:A4;margin:10mm}html,body{margin:0;padding:0;background:#fff}img{display:block;margin:0 auto;max-width:100%;max-height:270mm}</style></head><body><img id="i" src="'+data+'"></body></html>');
    d.close();
    const img=d.getElementById('i');
    const go=()=>{ f.contentWindow.focus(); f.contentWindow.print(); setTimeout(()=>f.remove(),2000); };
    if(img.complete) go(); else img.onload=go;
  }
  $('printBtn').addEventListener('click',()=>printStrip('stripCanvas'));
  $('pmPrintBtn').addEventListener('click',()=>printStrip('pmStripCanvas'));

  function fs(id){ const el=$(id); const f=el.requestFullscreen||el.webkitRequestFullscreen; if(f) f.call(el); }
  $('fullscreenBtn').addEventListener('click',()=>fs('stage1'));
  $('fullscreenCapBtn').addEventListener('click',()=>fs('stage4'));
  $('fullscreenPmBtn').addEventListener('click',()=>fs('stagePm1'));
  $('fullscreenPmCapBtn').addEventListener('click',()=>fs('stagePm4'));
  window.addEventListener('pagehide',stopStream);

  function getServerBaseUrl(){
    try{ return localStorage.getItem(SERVER_BASE_URL_KEY)||''; }catch(e){ return ''; }
  }
  function setServerBaseUrl(url){
    try{ localStorage.setItem(SERVER_BASE_URL_KEY,url); }catch(e){}
  }
  /* ---------- Local Server ---------- */
  async function uploadStripToServer(canvasId){
    const baseUrl=getServerBaseUrl();
    if(!baseUrl){ showErr('Server not configured. Open Server Settings and enter the server URL.'); return; }
    const canvas=$(canvasId);
    if(!canvas){ showErr('No strip found'); return; }
    try{
      const data=exportData(canvasId);
      if(!data){ showErr('Could not export the strip'); return; }
      const blob=await (await fetch(data)).blob();
      const form=new FormData();
      form.append('file',blob,'strip.png');
      const res=await fetch(baseUrl+'/api/upload-strip',{
        method:'POST',
        body:form
      });
      if(!res.ok){ const t=await res.text(); showErr('Upload failed: '+res.status+' '+t); return; }
      const result=await res.json();
      lastStripUrl=result.url;
      showErr('');
      showServerQR();
    }catch(e){ showErr('Upload error: '+(e.message||e)); }
  }
  function showServerQR(){
    const baseUrl=getServerBaseUrl();
    if(!baseUrl){ showErr('Server not configured. Open Server Settings.'); return; }
    if(!lastStripUrl){ showErr('No strip uploaded yet. Use Save to Server first.'); return; }
    if(typeof qrcode==='undefined'){ showErr('QR library not loaded'); return; }
    const url=lastStripUrl;
    const modules=[33,27,21,17,13];
    for(const m of modules){
      try {
        const qr=qrcode(0,'M');
        qr.addData(url);
        qr.make();
        const count=qr.getModuleCount();
        const cell=8, margin=4;
        const size=count*cell+margin*2;
        const c=document.createElement('canvas');
        c.width=size; c.height=size;
        const ctx=c.getContext('2d');
        ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,size,size);
        ctx.fillStyle='#000000';
        for(let y=0;y<count;y++)for(let x=0;x<count;x++){
          if(qr.isDark(y,x)) ctx.fillRect(margin+x*cell,margin+y*cell,cell,cell);
        }
        qrCanvas.innerHTML='';
        const img=c.toDataURL('image/png');
        qrCanvas.innerHTML='<img src="'+img+'" width="'+size+'" height="'+size+'" style="display:block;max-width:100%;height:auto">';
        qrOverlay.classList.add('active');
        return;
      }catch(e){ continue; }
    }
    showErr('Could not generate QR code. The link is too long.');
  }

  /* ---------- Server settings ---------- */
  function openServerSettings(){
    serverBaseUrlInput.value=getServerBaseUrl();
    updateServerSettingsStatus();
    show('server-settings');
  }
  function updateServerSettingsStatus(){
    const url=getServerBaseUrl();
    if(url){
      serverSettingsStatus.textContent='Configured · '+url;
    } else {
      serverSettingsStatus.textContent='Not configured';
    }
  }
  openServerSettingsBtn.addEventListener('click',openServerSettings);
  $('serverSettingsBackBtn').addEventListener('click',()=>show('modes'));
  saveServerSettingsBtn.addEventListener('click',()=>{
    const url=serverBaseUrlInput.value.trim();
    if(!url){ showErr('Please enter a valid server URL'); return; }
    setServerBaseUrl(url);
    updateServerSettingsStatus();
    showErr('');
    show('modes');
  });
  updateServerSettingsStatus();

  $('saveServerBtn').addEventListener('click',()=>uploadStripToServer('stripCanvas'));
  $('pmSaveServerBtn').addEventListener('click',()=>uploadStripToServer('pmStripCanvas'));

  /* ---------- QR code ---------- */
  function showQR(){
    if(lastStripUrl){ showServerQR(); return; }
    if(typeof qrcode==='undefined'){
      showErr('QR code library not loaded. Please check your internet connection and try again.');
      return;
    }
    const canvas = isPM() ? $('pmStripCanvas') : $('stripCanvas');
    if(!canvas){ return; }
    const sizes=[32,28,24];
    for(const s of sizes){
      const thumb=document.createElement('canvas');
      thumb.width=s; thumb.height=s;
      const tctx=thumb.getContext('2d');
      tctx.imageSmoothingEnabled=true;
      tctx.imageSmoothingQuality='high';
      tctx.drawImage(canvas,0,0,s,s);
      let data;
      try{ data=thumb.toDataURL('image/jpeg',0.05); }catch(e){ continue; }
      try {
        const qr=qrcode(0,'L');
        qr.addData(data);
        qr.make();
        const modules=qr.getModuleCount();
        const cell=10, margin=4;
        const size=modules*cell+margin+2;
        const c=document.createElement('canvas');
        c.width=size; c.height=size;
        const ctx=c.getContext('2d');
        ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,size,size);
        ctx.fillStyle='#000000';
        for(let y=0;y<modules;y++)for(let x=0;x<modules;x++){
          if(qr.isDark(y,x)) ctx.fillRect(margin+x*cell,margin+y*cell,cell,cell);
        }
        qrCanvas.innerHTML='';
        const img=c.toDataURL('image/png');
        qrCanvas.innerHTML='<img src="'+img+'" width="'+size+'" height="'+size+'" style="display:block;max-width:100%;height:auto">';
        qrOverlay.classList.add('active');
        return;
      }catch(e){ continue; }
    }
    showErr('Could not generate QR code. The image is too large. Please use Download instead.');
  }
  function closeQR(){ qrOverlay.classList.remove('active'); }
  qrBtn.addEventListener('click',showQR);
  pmQrBtn.addEventListener('click',showQR);
  qrCloseBtn.addEventListener('click',closeQR);
  qrOverlay.addEventListener('click',e=>{ if(e.target===qrOverlay) closeQR(); });

  applyMirror();
})();
